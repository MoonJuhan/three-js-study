<template>
  <button
    class="image-cropper-button"
    :style="{
      top: `${topNumber}px`,
      left: `${leftNumber}px`,
    }"
    @mousedown="onMouseDown"
  >
    X
  </button>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const emit = defineEmits(['set-watch-mousemove'])

const props = defineProps({
  wrapperRectInfo: {
    type: Object,
    default: () => ({}),
  },
  initTopNumber: {
    type: Number,
    default: 0,
  },
  initLeftNumber: {
    type: Number,
    default: 0,
  },
})

const isMouseDowned = ref(false)
const onMouseDown = () => {
  isMouseDowned.value = true
}

const topNumber = ref(0)
const leftNumber = ref(0)

const onMouseMove = (e) => {
  if (isMouseDowned.value) {
    const { clientX, clientY } = e
    const { left: wrapperLeft, right: wrapperRight, top: wrapperTop, bottom: wrapperBottom } = props.wrapperRectInfo

    const buttonSize = 25
    if (clientX <= wrapperLeft) {
      leftNumber.value = 0
    } else if (clientX >= wrapperRight - buttonSize) {
      leftNumber.value = wrapperRight - wrapperLeft - buttonSize
    } else {
      leftNumber.value = clientX - wrapperLeft
    }

    if (clientY <= wrapperTop) {
      topNumber.value = 0
    } else if (clientY >= wrapperBottom - buttonSize) {
      topNumber.value = wrapperBottom - wrapperTop - buttonSize
    } else {
      topNumber.value = clientY - wrapperTop
    }
  }
}

const onMouseUp = () => {
  if (isMouseDowned.value) {
    isMouseDowned.value = false
  }
}

watch(
  () => isMouseDowned.value,
  () => {
    if (isMouseDowned.value) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      emit('set-watch-mousemove', true)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      emit('set-watch-mousemove', false)
    }
  }
)

onMounted(() => {
  topNumber.value = props.initTopNumber
  leftNumber.value = props.initLeftNumber
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})

defineExpose({
  topNumber,
  leftNumber,
})
</script>

<style lang="scss" scoped>
.image-cropper-button {
  z-index: 1;
  position: absolute;
  border: none;
  background-color: #0eb36c;
  cursor: pointer;
  width: 25px;
  height: 25px;
}
</style>
