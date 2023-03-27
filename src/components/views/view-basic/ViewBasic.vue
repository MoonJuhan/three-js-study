<template>
  <div class="view-basic">
    <h1>ViewBasic</h1>
    <!-- <div class="input-wrapper">
      <span>3D Modeling File</span>
      <input type="file" @change="handleFileChange" />
    </div>
    <span class="description">
      Upload the json file among the results published by the
      <a href="https://threejs.org/editor/">threejs editor.</a>
    </span> -->

    <SceneImages :thdModelJSON="thdModelJSON" />

    <SampleImages />

    <h2>3D Viewer</h2>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import sample01 from '@/assets/json/sample01.json'
import helpers from '@/helpers'
import SceneImages from './SceneImages'
import SampleImages from './SampleImages'

export default {
  components: {
    SceneImages,
    SampleImages,
  },
  setup() {
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

    const handleFileChange = (e) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        initThdViewer(JSON.parse(e.target.result))
        refineImages(JSON.parse(e.target.result))
      }

      reader.readAsText(e.target.files[0])
    }

    const thdModelJSON = ref()

    onMounted(() => {
      thdModelJSON.value = sample01
      initThdViewer(thdModelJSON.value)
    })

    return {
      refThdViewer,
      thdModelJSON,
      handleFileChange,
    }
  },
}
</script>

<style lang="scss">
.view-basic {
  .input-wrapper {
    margin-bottom: 20px;

    span {
      margin-right: 20px;
    }
  }

  .description {
    display: flex;
    margin-bottom: 20px;

    a {
      margin-left: 4px;
    }
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
