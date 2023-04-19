<template>
  <div ref="refAppImageCropperV2" class="app-image-cropper-v2" :style="appImageCropperV2Style">
    <img :src="imageSrc" />
    <button class="cropper-edge-button" ref="refNWButton" :style="nwButtonStyle" @mousedown="onMouseDown('nw-button')">
      x
    </button>
    <button class="cropper-edge-button" ref="refSEButton" :style="seButtonStyle" @mousedown="onMouseDown('se-button')">
      x
    </button>

    <div class="cropper-box" ref="refCropperBox" :style="cropperBoxStyle" @mousedown="onMouseDown('cropper-box')" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
})

const nwButtonStyle = ref({ cursor: 'nw-resize', left: '0px', top: '0px' })
const seButtonStyle = ref({ cursor: 'se-resize', right: '0px', bottom: '0px' })
const cropperBoxStyle = computed(() => {
  const { left, top } = nwButtonStyle.value
  const { right, bottom } = seButtonStyle.value

  return {
    left,
    top,
    right,
    bottom,
  }
})

const mouseDownedType = ref('')
const appImageCropperV2Style = computed(() => {
  if (mouseDownedType.value === 'nw-button') {
    return {
      cursor: 'nw-resize',
    }
  }

  if (mouseDownedType.value === 'se-button') {
    return {
      cursor: 'se-resize',
    }
  }

  return {}
})

const onMouseDown = (type) => {
  mouseDownedType.value = type
}

onMounted(() => {
  boundingClientRects.value = {
    refAppImageCropperV2: refAppImageCropperV2.value.getBoundingClientRect(),
    refNWButton: refNWButton.value.getBoundingClientRect(),
    refSEButton: refSEButton.value.getBoundingClientRect(),
  }

  setTimeout(() => {
    boundingClientRects.value.refAppImageCropperV2 = refAppImageCropperV2.value.getBoundingClientRect()
  }, 400)
})

const refAppImageCropperV2 = ref()
const refNWButton = ref()
const refSEButton = ref()
const refCropperBox = ref()
const boundingClientRects = ref({})
const minCropperBoxSize = 50

const getMaxPositions = (nwRectName, seRectName) => {
  const { left, top } = boundingClientRects.value[nwRectName]
  const { right, bottom } = boundingClientRects.value[seRectName]

  return {
    left,
    top,
    right,
    bottom,
  }
}

const refineSquarePosition = (val01, val02) => (val01 > val02 ? val01 : val02)

const onMouseMove = (e) => {
  if (!mouseDownedType.value) return
  const { clientX, clientY } = e

  if (mouseDownedType.value === 'nw-button') {
    const {
      left: maxLeft,
      top: maxTop,
      right: seButtonRight,
      bottom: seButtonBottom,
    } = getMaxPositions('refAppImageCropperV2', 'refSEButton')
    const maxRight = seButtonRight - minCropperBoxSize
    const maxBottom = seButtonBottom - minCropperBoxSize

    const getNewPosition = (client, min, max) => {
      if (client < min) {
        return 0
      } else if (client > max) {
        return max - min
      } else {
        return client - min
      }
    }

    const newLeft = getNewPosition(clientX, maxLeft, maxRight)
    const newTop = getNewPosition(clientY, maxTop, maxBottom)

    const newPos = refineSquarePosition(newLeft, newTop)

    nwButtonStyle.value.left = `${newPos}px`
    nwButtonStyle.value.top = `${newPos}px`

    boundingClientRects.value.refNWButton = refNWButton.value.getBoundingClientRect()
    return
  }

  if (mouseDownedType.value === 'se-button') {
    const {
      right: maxRight,
      bottom: maxBottom,
      left: nwButtonLeft,
      top: nwButtonTop,
    } = getMaxPositions('refNWButton', 'refAppImageCropperV2')
    const maxLeft = nwButtonLeft + minCropperBoxSize
    const maxTop = nwButtonTop + minCropperBoxSize

    const getNewPosition = (client, min, max) => {
      if (client > max) {
        return 0
      } else if (client < min) {
        return min - max
      } else {
        return client - max
      }
    }

    const newRight = getNewPosition(clientX, maxLeft, maxRight)
    const newBottom = getNewPosition(clientY, maxTop, maxBottom)

    const newPos = refineSquarePosition(newRight, newBottom)

    seButtonStyle.value.right = `${-newPos}px`
    seButtonStyle.value.bottom = `${-newPos}px`

    boundingClientRects.value.refSEButton = refSEButton.value.getBoundingClientRect()
    return
  }

  if (mouseDownedType.value === 'cropper-box') {
    return
  }
}

const onMouseUp = () => {
  if (mouseDownedType.value) {
    mouseDownedType.value = ''
  }
}

watch(
  () => mouseDownedType.value,
  () => {
    if (mouseDownedType.value) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }
)

defineExpose({
  cropperBoxStyle,
})
</script>

<style lang="scss" scoped>
.app-image-cropper-v2 {
  display: flex;
  position: relative;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  height: fit-content;
  border: 1px solid black;

  img {
    z-index: -1;
    width: 100%;
  }

  .cropper-edge-button {
    z-index: 1;
    position: absolute;
    border: none;
    width: 25px;
    height: 25px;
    background-color: #0eb36c;
  }

  .cropper-box {
    z-index: 0;
    position: absolute;
    border: 2px solid #0eb36c;
    cursor: move;
  }
}
</style>
