<template>
  <div class="view-basic">
    <h1>ViewBasic</h1>
    <RouterLink to="/">Home</RouterLink>

    <ThdModelJSONUploader @set-thd-model-json="setNewThdModelJSON" />

    <div class="images-component-wrapper">
      <SceneImages :thdModelJSON="thdModelJSON || {}" />

      <SampleImages :thdModelJSON="thdModelJSON || {}" :targetIndex="0" @set-thd-model-json="setThdModelJSON" />
      <SampleImages :thdModelJSON="thdModelJSON || {}" :targetIndex="1" @set-thd-model-json="setThdModelJSON" />
      <SampleImages :thdModelJSON="thdModelJSON || {}" :targetIndex="2" @set-thd-model-json="setThdModelJSON" />
    </div>

    <h2 @click="test()">3D Viewer</h2>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
// import sample01 from '@/assets/json/sample01.json'
import { RouterLink } from 'vue-router'
import ThdModelJSONUploader from './ThdModelJSONUploader'
import SceneImages from './SceneImages'
import SampleImages from './SampleImages'
import useThreeJsViewer from '@/hooks/three-js-viewer'

const { load, setThdViewerSize, dom, thdViewerPlay, thdViewerScene, setThdViewerScene, resetRenderer } =
  useThreeJsViewer()

const refThdViewer = ref(null)

const setPlayerSize = () => {
  const { width, height } = refThdViewer.value.getBoundingClientRect()
  setThdViewerSize(width, height)
}

const removeChild = () => {
  resetRenderer()

  refThdViewer.value.childNodes.forEach((child) => {
    refThdViewer.value.removeChild(child)
  })
}

const initThdViewer = (json) => {
  removeChild()
  load(json)
  setPlayerSize()
  thdViewerPlay()
  refThdViewer.value.appendChild(dom)
}

const updateThdViewer = () => {
  removeChild()
  thdViewerPlay()
  refThdViewer.value.appendChild(dom)
}

const thdModelJSON = ref()
const setNewThdModelJSON = (json) => {
  thdModelJSON.value = null

  setTimeout(() => {
    thdModelJSON.value = json
  }, 1000)
}

const setThdModelJSON = ({ url, targetIndex }) => {
  const changeSceneImage = (scene, targetIndex, url) => {
    const sceneImages = scene.images

    if (sceneImages.length <= targetIndex) {
      return
    }

    sceneImages[targetIndex].url = url
  }

  changeSceneImage(thdModelJSON.value.scene, targetIndex, url)
  setThdViewerScene(thdModelJSON.value.scene)
  updateThdViewer()
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

const test = () => {
  console.log(thdModelJSON.value.scene)
  console.log(thdViewerScene)
}
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

  .images-component-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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

  h2 {
    margin: 0;
  }
}
</style>
