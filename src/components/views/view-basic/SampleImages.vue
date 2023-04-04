<template>
  <div class="sample-images">
    <h2>Sample Images: Target Index {{ targetIndex }}</h2>

    <div class="image-grid">
      <div
        class="image-wrapper"
        v-for="sampleImage in sampleImages"
        :key="sampleImage.url"
        @click="onClickSampleImage(targetIndex, sampleImage)"
      >
        <img :src="sampleImage.url" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import sample000 from '@/assets/sample-images/000.png'
import sample001 from '@/assets/sample-images/001.png'
import sample002 from '@/assets/sample-images/002.png'
import sample100 from '@/assets/sample-images/100.png'
import sample101 from '@/assets/sample-images/101.png'
import sample102 from '@/assets/sample-images/102.png'
import sample300 from '@/assets/sample-images/300.png'
import sample301 from '@/assets/sample-images/301.png'
import sample302 from '@/assets/sample-images/302.png'

const emit = defineEmits(['set-thd-model-json'])

const props = defineProps({
  targetIndex: {
    type: Number,
    required: true,
  },
  thdModelJSON: {
    type: Object,
    required: true,
  },
})

const sampleImages = ref([])

const initSampleImages = () => {
  const imageFiles =
    props.targetIndex === 0
      ? [sample000, sample100, sample300]
      : props.targetIndex === 1
      ? [sample001, sample101, sample301]
      : [sample002, sample102, sample302]

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

const onClickSampleImage = (targetIndex, { base64 }) => {
  emit('set-thd-model-json', { url: base64, targetIndex })
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
