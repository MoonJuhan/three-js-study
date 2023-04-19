<template>
  <div ref="refAppImageCropper" class="app-image-cropper" :style="appImageCropperStyle">
    <img :src="imageSrc" />
    <button
      class="cropper-edge-button"
      v-for="buttonType in buttonTypes"
      :key="buttonType"
      :style="buttonStyles[buttonType]"
      @mousedown="(e) => onMouseDown(buttonType, e)"
    />

    <div
      class="cropper-box"
      ref="refCropperBox"
      :style="cropperBoxStyle"
      @mousedown="(e) => onMouseDown('cropper-box', e)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
})

const buttonTypes = ['nw-button', 'ne-button', 'sw-button', 'se-button']
const buttonStyles = ref({
  'nw-button': { cursor: 'nw-resize', left: '0px', top: '0px', transform: 'translate(-50%, -50%)' },
  'ne-button': { cursor: 'ne-resize', right: '0px', top: '0px', transform: 'translate(50%, -50%)' },
  'sw-button': { cursor: 'sw-resize', left: '0px', bottom: '0px', transform: 'translate(-50%, 50%)' },
  'se-button': { cursor: 'se-resize', right: '0px', bottom: '0px', transform: 'translate(50%, 50%)' },
})
const cropperBoxStyle = computed(() => {
  const { left, top } = buttonStyles.value['nw-button']
  const { right, bottom } = buttonStyles.value['se-button']

  const cursor = buttonStyles.value[mouseDownedType.value]?.cursor || 'move'

  return {
    left,
    top,
    right,
    bottom,
    cursor,
  }
})
const appImageCropperStyle = computed(() => {
  if (mouseDownedType.value === 'cropper-box') {
    return {
      cursor: 'move',
    }
  }

  if (buttonTypes.includes(mouseDownedType.value)) {
    return {
      cursor: buttonStyles.value[mouseDownedType.value]?.cursor,
    }
  }

  return {}
})

const mouseDownedType = ref('')
const refAppImageCropper = ref()
const firstPositions = ref({})
const minBoxSize = 60

const refinePixelPostion = (value) => parseInt(value.replace('px', ''), 10)

const onMouseDown = (type, { clientX, clientY }) => {
  mouseDownedType.value = type

  const { width, height } = refAppImageCropper.value.getBoundingClientRect()

  firstPositions.value = {
    cursorX: clientX,
    cursorY: clientY,
    wrapperWidth: width,
    wrapperHeight: height,
    firstLeft: refinePixelPostion(buttonStyles.value['nw-button'].left),
    firstTop: refinePixelPostion(buttonStyles.value['nw-button'].top),
    firstRight: refinePixelPostion(buttonStyles.value['se-button'].right),
    firstBottom: refinePixelPostion(buttonStyles.value['se-button'].bottom),
  }
}

const refineNewPosition = (value, min, max) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

const onMouseMove = ({ clientX, clientY }) => {
  if (!mouseDownedType.value) return

  const { cursorX, cursorY, wrapperWidth, wrapperHeight, firstLeft, firstTop, firstRight, firstBottom } =
    firstPositions.value
  const moveX = clientX - cursorX
  const moveY = clientY - cursorY

  const symmetricAbsMove = (() => {
    if (mouseDownedType.value === 'nw-button') return moveX > moveY ? moveX : moveY

    if (mouseDownedType.value === 'ne-button') return moveX < -moveY ? moveX : -moveY

    if (mouseDownedType.value === 'sw-button') return moveX > -moveY ? moveX : -moveY

    if (mouseDownedType.value === 'se-button') return moveX < moveY ? moveX : moveY
  })()

  if (['nw-button', 'sw-button'].includes(mouseDownedType.value)) {
    const newLeft = refineNewPosition(firstLeft + symmetricAbsMove, 0, wrapperWidth - firstRight - minBoxSize)

    buttonStyles.value['nw-button'].left = `${newLeft}px`
    buttonStyles.value['sw-button'].left = `${newLeft}px`
  }

  if (['ne-button', 'se-button'].includes(mouseDownedType.value)) {
    const newRight = refineNewPosition(firstRight - symmetricAbsMove, 0, wrapperWidth - firstLeft - minBoxSize)

    buttonStyles.value['ne-button'].right = `${newRight}px`
    buttonStyles.value['se-button'].right = `${newRight}px`
  }

  if (['nw-button', 'ne-button'].includes(mouseDownedType.value)) {
    const newTop = refineNewPosition(
      firstTop + (mouseDownedType.value === 'nw-button' ? symmetricAbsMove : -symmetricAbsMove),
      0,
      wrapperHeight - firstBottom - minBoxSize
    )

    buttonStyles.value['nw-button'].top = `${newTop}px`
    buttonStyles.value['ne-button'].top = `${newTop}px`
  }

  if (['sw-button', 'se-button'].includes(mouseDownedType.value)) {
    const newBottom = refineNewPosition(
      firstBottom + (mouseDownedType.value === 'sw-button' ? symmetricAbsMove : -symmetricAbsMove),
      0,
      wrapperHeight - firstTop - minBoxSize
    )

    buttonStyles.value['sw-button'].bottom = `${newBottom}px`
    buttonStyles.value['se-button'].bottom = `${newBottom}px`
  }

  if (mouseDownedType.value !== 'cropper-box') return

  const newLeft = refineNewPosition(firstLeft + moveX, 0, firstRight + firstLeft)
  buttonStyles.value['sw-button'].left = `${newLeft}px`
  buttonStyles.value['nw-button'].left = `${newLeft}px`

  const newTop = refineNewPosition(firstTop + moveY, 0, firstBottom + firstTop)
  buttonStyles.value['nw-button'].top = `${newTop}px`
  buttonStyles.value['ne-button'].top = `${newTop}px`

  const newRight = refineNewPosition(firstRight - moveX, 0, firstRight + firstLeft)
  buttonStyles.value['se-button'].right = `${newRight}px`
  buttonStyles.value['ne-button'].right = `${newRight}px`

  const newBottom = refineNewPosition(firstBottom - moveY, 0, firstBottom + firstTop)
  buttonStyles.value['sw-button'].bottom = `${newBottom}px`
  buttonStyles.value['se-button'].bottom = `${newBottom}px`
}

const onMouseUp = () => {
  if (!mouseDownedType.value) return

  mouseDownedType.value = ''
  firstPositions.value = {}
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
.app-image-cropper {
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
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.24);
  }

  .cropper-box {
    z-index: 0;
    position: absolute;
    border: 2px solid white;
  }
}
</style>
