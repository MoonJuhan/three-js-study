<template>
  <div class="view-basic">
    <h1>ViewBasic</h1>
    <div class="input-wrapper">
      <span>3D Modeling File</span>
      <input type="file" @change="handleFileChange" />
    </div>
    <span class="description">
      Upload the json file among the results published by the
      <a href="https://threejs.org/editor/">threejs editor.</a>
    </span>
    <div ref="refThdViewer" />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import tv from '../../assets/json/tv.json'
import helpers from '../../helpers'

export default {
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
      }

      reader.readAsText(e.target.files[0])
    }

    onMounted(() => {
      initThdViewer(tv)
    })

    return {
      refThdViewer,
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
}
</style>
