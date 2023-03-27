<template>
  <div class="view-basic">
    <h1>ViewBasic</h1>

    <ThdModelJSONUploader @set-thd-model-json="setThdModelJSON" />

    <SceneImages :thdModelJSON="thdModelJSON || {}" />

    <SampleImages :thdModelJSON="thdModelJSON || {}" @set-thd-model-json="setThdModelJSON" />

    <h2>3D Viewer</h2>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
// import sample01 from '@/assets/json/sample01.json'
import helpers from '@/helpers'
import ThdModelJSONUploader from './ThdModelJSONUploader'
import SceneImages from './SceneImages'
import SampleImages from './SampleImages'

const refThdViewer = ref(null)

const initThdViewer = (json) => {
  const removeChild = () => {
    refThdViewer.value.childNodes.forEach((child) => {
      refThdViewer.value.removeChild(child)
    })
  }
  removeChild()

  const player = new helpers.app.Player()
  player.load(json)
  player.setSize(window.innerWidth, window.innerHeight)
  player.play()

  refThdViewer.value.appendChild(player.dom)

  window.addEventListener('resize', function () {
    player.setSize(window.innerWidth, window.innerHeight)
  })
}

const thdModelJSON = ref()
const setThdModelJSON = (json) => {
  thdModelJSON.value = json
}

watch(
  () => thdModelJSON.value,
  (json) => {
    initThdViewer(json)
  }
)

// For Test
// onMounted(() => {
//   thdModelJSON.value = sample01
// })
</script>

<style lang="scss">
.view-basic {
  canvas {
    width: 100% !important;
  }

  .image-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .image-wrapper img {
      width: 100%;
      object-fit: contain;
    }
  }
}
</style>
