<template>
  <div ref="refAppImageCropperV2" class="app-image-cropper-v2" :style="appImageCropperV2Style">
    <img :src="imageSrc" />
    <button
      class="cropper-edge-button"
      ref="refNWButton"
      :style="nwButtonStyle"
      @mousedown="(e) => onMouseDown('nw-button', e)"
    >
      x
    </button>
    <button
      class="cropper-edge-button"
      ref="refSEButton"
      :style="seButtonStyle"
      @mousedown="(e) => onMouseDown('se-button', e)"
    >
      x
    </button>

    <div
      class="cropper-box"
      ref="refCropperBox"
      :style="cropperBoxStyle"
      @mousedown="(e) => onMouseDown('cropper-box', e)"
    />
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

const onMouseDown = (type, { clientX, clientY }) => {
  mouseDownedType.value = type

  firstPosition.value = {
    clientX,
    clientY,
    nwButtonLeft: refinePositionNumber(nwButtonStyle.value.left),
    nwButtonTop: refinePositionNumber(nwButtonStyle.value.top),
    seButtonRight: refinePositionNumber(seButtonStyle.value.right),
    seButtonBottom: refinePositionNumber(seButtonStyle.value.bottom),
  }
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
const firstPosition = ref({})

const refinePositionNumber = (positon) => parseInt(positon.replaceAll('px', ''), 10)
const minCropperBoxSize = 50
const getSymmetryMovePostion = (value01, value02) => (value01 > value02 ? value01 : value02)
const getNewPosition = (movedPosition, minPosition, maxPosition) => {
  if (movedPosition < minPosition) {
    return minPosition
  }

  if (movedPosition > maxPosition) {
    return maxPosition
  }

  return movedPosition
}

const checkMoveable = ({ clientX: cursorX, clientY: cursorY }) => {
  const { clientX: newX, clientY: newY } = firstPosition.value

  const nwButtonLeft = refinePositionNumber(nwButtonStyle.value.left)
  const nwButtonTop = refinePositionNumber(nwButtonStyle.value.top)
  const seButtonRight = refinePositionNumber(seButtonStyle.value.right)
  const seButtonBottom = refinePositionNumber(seButtonStyle.value.bottom)

  const results = []
  if (cursorX - newX < 0 && nwButtonLeft <= 0) {
    results.push(false)
  }

  if (cursorX - newX > 0 && seButtonRight <= 0) {
    results.push(false)
  }

  if (cursorY - newY < 0 && nwButtonTop <= 0) {
    results.push(false)
  }

  if (cursorY - newY > 0 && seButtonBottom <= 0) {
    results.push(false)
  }

  return !results.includes(false)
}

const onMouseMove = (e) => {
  if (!mouseDownedType.value) return
  const { width: wrapperWidth, height: wrapperHeight } = boundingClientRects.value.refAppImageCropperV2
  const { clientX, clientY, nwButtonLeft, nwButtonTop, seButtonRight, seButtonBottom } = firstPosition.value

  if (mouseDownedType.value === 'cropper-box' && checkMoveable(e)) {
    nwButtonStyle.value.left = `${getNewPosition(
      nwButtonLeft + e.clientX - clientX,
      0,
      nwButtonLeft + e.clientX - clientX
    )}px`
    nwButtonStyle.value.top = `${getNewPosition(
      nwButtonTop + e.clientY - clientY,
      0,
      nwButtonTop + e.clientY - clientY
    )}px`
    seButtonStyle.value.right = `${getNewPosition(
      seButtonRight - e.clientX + clientX,
      0,
      seButtonRight - e.clientX + clientX
    )}px`
    seButtonStyle.value.bottom = `${getNewPosition(
      seButtonBottom - e.clientY + clientY,
      0,
      seButtonBottom - e.clientY + clientY
    )}px`
    return
  }
  const symmetryMovePostion = getSymmetryMovePostion(e.clientX - clientX, e.clientY - clientY)

  if (mouseDownedType.value === 'nw-button') {
    nwButtonStyle.value.left = `${getNewPosition(
      nwButtonLeft + symmetryMovePostion,
      0,
      wrapperWidth - minCropperBoxSize - seButtonRight
    )}px`
    nwButtonStyle.value.top = `${getNewPosition(
      nwButtonTop + symmetryMovePostion,
      0,
      wrapperHeight - minCropperBoxSize - seButtonBottom
    )}px`
    return
  }

  if (mouseDownedType.value === 'se-button') {
    seButtonStyle.value.right = `${getNewPosition(
      seButtonRight - symmetryMovePostion,
      0,
      wrapperWidth - minCropperBoxSize - nwButtonLeft
    )}px`
    seButtonStyle.value.bottom = `${getNewPosition(
      seButtonBottom - symmetryMovePostion,
      0,
      wrapperHeight - minCropperBoxSize - nwButtonTop
    )}px`
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
