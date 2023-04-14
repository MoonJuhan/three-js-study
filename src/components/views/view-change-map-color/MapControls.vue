<template>
  <div class="map-controls">
    <span>Preview</span>

    <canvas ref="refCanvas" class="image-preview" />

    <div class="controls">
      <button @click="onClickAddColor">Add Color</button>
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
  emit('change-map', refCanvas.value)
}

const targetColors = ref([])
const newColors = ref([])

const refineColorCode = (original) => {
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

watch(
  () => newColors.value.join(''),
  (newVal, oldVal) => {
    if (newVal.length === oldVal.length) {
      onClickChangeColor()
    }
  }
)

const onClickChangeColor = () => {
  const pixelData = imageData.value.data
  const newPixelData = new Uint8ClampedArray(pixelData.length)
  newPixelData.set(pixelData)

  const changeTargetColor = (targetColor, newColor) => {
    const originalColorCode = refineColorCode(targetColor)
    const newColorCode = refineColorCode(newColor)

    const range = 30

    for (let i = 0; i < pixelData.length; i += 4) {
      if (
        pixelData[i] >= originalColorCode[0] - range &&
        pixelData[i] <= originalColorCode[0] + range &&
        pixelData[i + 1] >= originalColorCode[1] - range &&
        pixelData[i + 1] <= originalColorCode[1] + range &&
        pixelData[i + 2] >= originalColorCode[2] - range &&
        pixelData[i + 2] <= originalColorCode[2] + range
      ) {
        newPixelData[i] = newColorCode[0]
        newPixelData[i + 1] = newColorCode[1]
        newPixelData[i + 2] = newColorCode[2]
      }
    }
  }

  targetColors.value.forEach((color, index) => {
    changeTargetColor(color, newColors.value[index])
  })

  const { width, height } = imageData.value
  const newImageData = new ImageData(width, height)
  newImageData.data.set(newPixelData)

  canvasContext.value.putImageData(newImageData, 0, 0)
  emit('change-map', refCanvas.value)
}
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
