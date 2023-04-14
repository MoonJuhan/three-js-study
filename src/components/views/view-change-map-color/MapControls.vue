<template>
  <div class="map-controls">
    <span>Preview</span>

    <canvas ref="refCanvas" class="image-preview" />

    <div class="controls">
      <button @click="onClickGetColor">Get Color</button>
      <div>{{ sortedColors.length }} Colors Found</div>
      <button @click="onClickShowTargetColor" :disabled="sortedColors.length === 0">Set Target Colors</button>
      <button @click="onClickChangeColor" :disabled="sortedColors.length === 0 || targetColors.length === 0">
        Change Color
      </button>
      <button @click="emit('change-map', refCanvas)">Change Map</button>
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
import { onMounted, ref } from 'vue'
import ColorThief from 'colorthief'

const emit = defineEmits(['change-map'])

const props = defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})

const refCanvas = ref()

const drawImage = () => {
  const canvas = refCanvas.value
  const ctx = canvas.getContext('2d')

  const img = new Image()
  img.src = props.imageSrc

  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  }
}

onMounted(drawImage)

const sortedColors = ref([])

const onClickGetColor = () => {
  const img = new Image()
  img.src = props.imageSrc

  const colorThief = new ColorThief()

  img.onload = () => {
    const data = colorThief.getPalette(img, 5)
    sortedColors.value = data.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`)
  }
}

const targetColors = ref([])
const newColors = ref([])
const onClickShowTargetColor = () => {
  newColors.value.push('#eeff00')
  targetColors.value.push(sortedColors.value[targetColors.value.length])

  // for (let i = 0; i < (sortedColors.value.length > 100 ? 100 : sortedColors.value.length); i += 1) {
  //   newColors.value.push('#eeff00')
  //   targetColors.value.push(sortedColors.value[targetColors.value.length])
  // }
}

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

const onClickChangeColor = () => {
  const canvas = refCanvas.value
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelData = imageData.data

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
        pixelData[i] = newColorCode[0]
        pixelData[i + 1] = newColorCode[1]
        pixelData[i + 2] = newColorCode[2]
      }
    }
  }

  targetColors.value.forEach((color, index) => {
    changeTargetColor(color, newColors.value[index])
  })

  console.log(imageData)

  ctx.putImageData(imageData, 0, 0)
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
