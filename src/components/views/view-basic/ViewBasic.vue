<template>
  <div class="view-basic">
    <h1>ViewBasic</h1>
    <RouterLink to="/">Home</RouterLink>

    <ThdModelJSONUploader @set-thd-model-json="setThdModelJSON" />

    <SceneImages :thdModelJSON="thdModelJSON || {}" />

    <SampleImages :thdModelJSON="thdModelJSON || {}" @set-thd-model-json="setThdModelJSON" />

    <h2>3D Viewer</h2>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
// import sample01 from '@/assets/json/sample01.json'
import ThdModelJSONUploader from './ThdModelJSONUploader'
import SceneImages from './SceneImages'
import SampleImages from './SampleImages'
import useThreeJsViewer from '@/hooks/three-js-viewer'

const { load, setThdViewerSize, dom, thdViewerPlay } = useThreeJsViewer()

const refThdViewer = ref(null)

const player = ref()

const setPlayerSize = () => {
  const { width, height } = refThdViewer.value.getBoundingClientRect()
  setThdViewerSize(width, height)
}

const initThdViewer = (json) => {
  const removeChild = () => {
    refThdViewer.value.childNodes.forEach((child) => {
      refThdViewer.value.removeChild(child)
    })
  }
  removeChild()

  load(json)
  setPlayerSize()
  thdViewerPlay()
  refThdViewer.value.appendChild(dom)
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

onMounted(() => {
  // For Test
  // thdModelJSON.value = sample01

  window.addEventListener('resize', () => {
    setPlayerSize()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    setPlayerSize()
  })
})
</script>

<style lang="scss">
.view-basic {
  .thd-viewer {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

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
