<template>
  <div ref="refAppImageCropper" class="app-image-cropper">
    <img :src="imageSrc" />
    <ImageCropperButton
      ref="refImageCropperButton01"
      :wrapperRectInfo="wrapperRectInfo"
      :initTopNumber="10"
      :initLeftNumber="10"
      @set-watch-mousemove="setIsWatchMouseMove"
    />
    <ImageCropperButton
      ref="refImageCropperButton02"
      :wrapperRectInfo="wrapperRectInfo"
      :initTopNumber="565"
      :initLeftNumber="565"
      @set-watch-mousemove="setIsWatchMouseMove"
    />
    <div class="cropper-box-border" :style="cropperBoxStyle" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ImageCropperButton from './ImageCropperButton.vue'

const emit = defineEmits([''])

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
})

const refAppImageCropper = ref()
const wrapperRectInfo = ref({})

onMounted(() => {
  console.log('Loading Start')
  setTimeout(() => {
    wrapperRectInfo.value = refAppImageCropper.value.getBoundingClientRect()
    onMouseMove()
    console.log('Loading End')
  }, 400)
})

const isWatchMouseMove = ref(false)
const setIsWatchMouseMove = (value) => {
  isWatchMouseMove.value = value
}

const refImageCropperButton01 = ref()
const refImageCropperButton02 = ref()

const cropperBoxStyle = ref({})
const onMouseMove = () => {
  const { topNumber: topNumber01, leftNumber: leftNumber01 } = refImageCropperButton01.value
  const { topNumber: topNumber02, leftNumber: leftNumber02 } = refImageCropperButton02.value

  cropperBoxStyle.value = {
    top: `${topNumber01}px`,
    left: `${leftNumber01}px`,
    right: `${wrapperRectInfo.value.width - leftNumber02 - 25}px`,
    bottom: `${wrapperRectInfo.value.height - topNumber02 - 25}px`,
  }
}

watch(
  () => isWatchMouseMove.value,
  () => {
    if (isWatchMouseMove.value) {
      document.addEventListener('mousemove', onMouseMove)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
})

defineExpose({
  cropperBoxStyle,
})
</script>

<style lang="scss" scoped>
.app-image-cropper {
  display: flex;
  position: relative;
  max-width: 600px;
  height: fit-content;
  border: 1px solid black;

  img {
    z-index: -1;
    width: 100%;
  }

  .cropper-box-border {
    z-index: 0;
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 2px solid #0eb36c;
  }
}
</style>
