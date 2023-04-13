<template>
  <div class="view-image-control">
    <h1>Image Control</h1>
    <RouterLink to="/">Home</RouterLink>

    <div class="image-contents">
      <span>Original Image</span>

      <AppImageCropper :imageSrc="baseImage" />
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import baseImage from '@/assets/sample-6-type-map/sample-base.jpg'
import AppImageCropper from '@/components/app/app-image-cropper/AppImageCropper.vue'
</script>

<style lang="scss" scoped>
.view-image-control {
}
</style>
