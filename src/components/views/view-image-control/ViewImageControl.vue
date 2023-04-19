<template>
  <div class="view-image-control">
    <h1>Image Control</h1>
    <RouterLink to="/">Home</RouterLink>

    <div class="grid">
      <div class="image-contents">
        <span>Original Image</span>

        <AppImageCropper ref="refAppImageCropper" :imageSrc="baseImage" />
      </div>

      <div class="image-contents">
        <span>Cropped Image Preview</span>

        <div class="preview-image-wrapper">
          <div class="preview-image" :style="previewImageStlye" />
        </div>
      </div>

      <div class="image-contents">
        <span>Original Image</span>

        <AppImageCropperV2 ref="refAppImageCropperV2" :imageSrc="baseImage" />
      </div>

      <div class="image-contents">
        <span>Cropped Image Preview</span>

        <div class="preview-image-wrapper">
          <div class="preview-image" :style="previewImageV2Stlye" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import baseImage from '@/assets/sample-6-type-map/sample-base.jpg'
import AppImageCropper from '@/components/app/app-image-cropper/AppImageCropper.vue'
import AppImageCropperV2 from '@/components/app/app-image-cropper/AppImageCropperV2.vue'

const refAppImageCropper = ref()
const refAppImageCropperV2 = ref()

const previewImageStlye = computed(() => {
  const { bottom, left, right, top } = refAppImageCropper.value?.cropperBoxStyle || {}

  return {
    backgroundImage: `url(${baseImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    clipPath: `polygon(${left} ${top}, calc(100% - ${right}) ${top}, calc(100% - ${right}) calc(100% - ${bottom}), ${left} calc(100% - ${bottom}))`,
  }
})

const previewImageV2Stlye = computed(() => {
  const { bottom, left, right, top } = refAppImageCropperV2.value?.cropperBoxStyle || {}

  return {
    backgroundImage: `url(${baseImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    clipPath: `polygon(${left} ${top}, calc(100% - ${right}) ${top}, calc(100% - ${right}) calc(100% - ${bottom}), ${left} calc(100% - ${bottom}))`,
  }
})
</script>

<style lang="scss" scoped>
.view-image-control {
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .image-contents {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  .preview-image-wrapper {
    width: 600px;
    aspect-ratio: 1 / 1;
    border: 1px solid black;

    .preview-image {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
