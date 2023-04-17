<template>
  <div class="map-controls">
    <span>Preview</span>

    <canvas ref="refCanvas" class="image-preview" />

    <div class="controls">
      <button @click="onClickAddColor">Add Color</button>
      <AppSlider
        :currentValue="colorRange"
        @update-current-value="setColorRange"
        :minNumber="10"
        :maxNumber="80"
        :fixedPoint="0"
        label="Color Range"
      />
    </div>

    <div class="controls">
      <div class="color-change-control" v-for="(color, index) in targetColors" :key="color">
        <div class="target-color-wrapper">
          <div class="color-chip" :style="{ backgroundColor: color }" />
          <span>{{ color }}</span>
        </div>

        <div class="target-color-wrapper">
          <input type="color" v-model="newColors[index]" />
          <span>{{ newColors[index] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import ColorThief from 'colorthief'
import AppSlider from '@/components/app/AppSlider.vue'

const emit = defineEmits(['change-map'])

const props = defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})

const refCanvas = ref()
const canvasContext = ref()
const refImage = ref()
const imageData = ref()
const newPixelData = ref()

const drawImage = () => {
  canvasContext.value = refCanvas.value.getContext('2d', { willReadFrequently: true })

  refImage.value = new Image()
  refImage.value.src = props.imageSrc

  refImage.value.onload = () => {
    const { width, height } = refImage.value
    refCanvas.value.width = width
    refCanvas.value.height = height
    canvasContext.value.drawImage(refImage.value, 0, 0)
    imageData.value = canvasContext.value.getImageData(0, 0, width, height)
    const pixelData = imageData.value.data
    newPixelData.value = new Uint8ClampedArray(pixelData.length)
    newPixelData.value.set(pixelData)
  }
}

onMounted(drawImage)

const onClickAddColor = () => {
  const colorThief = new ColorThief()

  const getCount = targetColors.value.length < 2 ? 2 : targetColors.value.length + 1
  const palettes = colorThief.getPalette(refImage.value, getCount)
  targetColors.value = palettes.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`)
  newColors.value = palettes.map(([r, g, b]) => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1))

  canvasContext.value.putImageData(imageData.value, 0, 0)
  newPixelData.value.set(imageData.value.data)
  emit('change-map', refCanvas.value)
}

const targetColors = ref([])
const newColors = ref([])

const refineRGBCode = (original) => {
  if (original.includes('rgb')) {
    return original
      .replace('rgb(', '')
      .replace(')', '')
      .split(', ')
      .map((str) => parseInt(str, 10))
  }

  if (original.includes('#')) {
    const hexInt = parseInt(original.replace('#', ''), 16)

    const red = (hexInt >> 16) & 255
    const green = (hexInt >> 8) & 255
    const blue = hexInt & 255

    return [red, green, blue]
  }

  return [255, 255, 255]
}

const colorRange = ref(30)
const setColorRange = (value) => {
  colorRange.value = value
}

watch(
  () => newColors.value.join(''),
  (newVal, oldVal) => {
    if (newVal.length === oldVal.length) {
      onClickChangeColor(newVal, oldVal)
    }
  }
)

const refineNewColorCode = (oldColorCode, targetColorCode, newColorCode) => {
  const colorCode = newColorCode + oldColorCode - targetColorCode

  if (colorCode < 0) return 0

  if (colorCode > 255) return 255

  return colorCode
}

const onClickChangeColor = (newValues, oldValues) => {
  const pixelData = imageData.value.data

  const changeTargetColor = (targetColor, newColor) => {
    const originalColorCode = refineRGBCode(targetColor)
    const newColorCode = refineRGBCode(newColor)

    if (originalColorCode.join('') === newColorCode.join('')) {
      return
    }

    for (let i = 0; i < pixelData.length; i += 4) {
      if (
        pixelData[i] >= originalColorCode[0] - colorRange.value &&
        pixelData[i] <= originalColorCode[0] + colorRange.value &&
        pixelData[i + 1] >= originalColorCode[1] - colorRange.value &&
        pixelData[i + 1] <= originalColorCode[1] + colorRange.value &&
        pixelData[i + 2] >= originalColorCode[2] - colorRange.value &&
        pixelData[i + 2] <= originalColorCode[2] + colorRange.value
      ) {
        newPixelData.value[i] = refineNewColorCode(originalColorCode[0], pixelData[i], newColorCode[0])
        newPixelData.value[i + 1] = refineNewColorCode(originalColorCode[1], pixelData[i + 1], newColorCode[1])
        newPixelData.value[i + 2] = refineNewColorCode(originalColorCode[2], pixelData[i + 2], newColorCode[2])
      }
    }
  }

  const diffColors = newValues
    .split('#')
    .filter((value, index) => value !== oldValues.split('#')[index])
    .map((value) => `#${value}`)

  const updatedColors = newColors.value.map((color, index) => {
    if (diffColors.includes(color)) {
      return {
        targetColor: targetColors.value[index],
        newColor: color,
      }
    }

    return {}
  })

  updatedColors.forEach(({ targetColor, newColor }) => {
    if (targetColor && newColor) {
      changeTargetColor(targetColor, newColor)
    }
  })

  const { width, height } = imageData.value
  const newImageData = new ImageData(width, height)
  newImageData.data.set(newPixelData.value)

  canvasContext.value.putImageData(newImageData, 0, 0)
  emit('change-map', refCanvas.value)
}

watch(
  () => colorRange.value,
  () => {
    if (newColors.value.length > 0) {
      newPixelData.value.set(imageData.value.data)

      onClickChangeColor(
        newColors.value.join(''),
        [...newColors.value].map((color) => `#Z${color.substring(2)}`).join('')
      )
    }
  }
)
</script>

<style lang="scss" scoped>
.map-controls {
  display: grid;
  grid-template-columns: 600px 200px 200px;
  gap: 8px;

  > span {
    grid-column: 1 / 4;
  }

  .image-preview {
    border: 1px solid black;
    width: 600px;
    aspect-ratio: 1 / 1;
  }

  .controls {
    width: 200px;
    max-height: 600px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .color-chip {
    width: 10px;
    height: 10px;
  }

  .color-change-control {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .target-color-wrapper {
    display: flex;
    align-items: center;
    column-gap: 8px;
  }
}
</style>
