<template>
  <div class="sample-images">
    <h2>Sample Images</h2>

    <div class="image-grid">
      <div
        class="image-wrapper"
        v-for="sampleImage in sampleImages"
        :key="sampleImage.url"
        @click="onClickSampleImage(sampleImage)"
      >
        <img :src="sampleImage.url" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import sample_scene_image_01 from '@/assets/sample-images/sample_scene_image_01.png'
import sample_scene_image_02 from '@/assets/sample-images/sample_scene_image_02.png'
import sample_scene_image_03 from '@/assets/sample-images/sample_scene_image_03.png'

const sampleImages = ref([])

const initSampleImages = () => {
  const imageFiles = [sample_scene_image_01, sample_scene_image_02, sample_scene_image_03]

  imageFiles.forEach((imageFile) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.height = image.naturalHeight
      canvas.width = image.naturalWidth
      ctx.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL()

      sampleImages.value.push({ url: imageFile, base64: dataUrl })
    }

    image.src = imageFile
  })
}

onMounted(initSampleImages)

const onClickSampleImage = (sampleImage) => {
  console.log(sampleImage)
}
</script>

<style lang="scss" scoped>
.sample-images {
  display: flex;
  flex-direction: column;

  .image-wrapper {
    cursor: pointer;
  }
}
</style>
