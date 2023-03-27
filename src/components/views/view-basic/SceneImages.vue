<template>
  <div class="scene-images">
    <h2>Scene Images</h2>

    <div class="image-grid">
      <div class="image-wrapper" v-for="sceneImage in sceneImages" :key="sceneImage.uuid">
        <img :src="sceneImage.url" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  thdModelJSON: {
    type: Object,
    required: true,
  },
})

const sceneImages = ref([])

const refineImages = (json = {}) => {
  const { images } = json.scene || {}

  sceneImages.value = images
}

watch(
  () => props.thdModelJSON,
  (json) => {
    refineImages(json)
  }
)
</script>

<style lang="scss" scoped>
.scene-images {
  display: flex;
  flex-direction: column;
}
</style>
