<template>
  <div class="view-video">
    <h1>ViewVideo</h1>
    <div class="input-wrapper">
      <span>3D Modeling File</span>
      <input type="file" @change="handleFileChange" />
    </div>

    <span class="description">
      Upload the json file among the results published by the
      <a href="https://threejs.org/editor/">threejs editor.</a>
    </span>

    <div class="input-wrapper">
      <span>Video</span>
      <input type="file" @change="handleVideoFileChange" multiple />
    </div>

    <span class="description"> Upload the videos you want to insert into the 3d model.</span>

    <div class="video-wrapper">
      <div class="video-container" v-for="(src, index) in videoList" :key="src">
        <video
          class="video"
          controlslist="nodownload"
          playsinline=""
          loop=""
          autoplay=""
          :src="src"
          :id="`video_${refineIndex(index + 1)}`"
        />
      </div>
    </div>

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

    const initThdViewer = () => {
      const removeChild = () => {
        refThdViewer.value.childNodes.forEach((child) => {
          refThdViewer.value.removeChild(child)
        })
      }

      removeChild()

      const player = new helpers.app.Player()
      player.load(thdModelJson.value)
      player.setSize(window.innerWidth, window.innerHeight)
      if (videoList.value.length) player.setVideo(videoList.value)
      player.play()

      refThdViewer.value.appendChild(player.dom)

      window.addEventListener('resize', function () {
        player.setSize(window.innerWidth, window.innerHeight)
      })
    }

    const thdModelJson = ref(null)

    const handleFileChange = (e) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        thdModelJson.value = JSON.parse(e.target.result)
        initThdViewer()
      }

      reader.readAsText(e.target.files[0])
    }

    onMounted(() => {
      thdModelJson.value = tv
      initThdViewer()
    })

    const videoList = ref([])

    const handleVideoFileChange = (e) => {
      for (const [key, value] of Object.entries(e.target.files)) {
        videoList.value.push(URL.createObjectURL(value))
      }

      setTimeout(() => {
        initThdViewer()
      }, 1000)
    }

    const refineIndex = (index) => {
      if (index < 10) return `0${index}`

      return index
    }

    return {
      refThdViewer,
      handleFileChange,
      handleVideoFileChange,
      videoList,
      refineIndex,
    }
  },
}
</script>

<style lang="scss">
.view-video {
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

  .video-wrapper {
    display: flex;
    margin-bottom: 20px;

    .video-container {
      width: 192px;
      height: 108px;
      position: relative;
      overflow: hidden;
      border: 1px solid black;
      margin-right: 20px;
      justify-content: center;
      align-items: center;

      .video {
        position: absolute;
        top: 0;
        height: 100%;
      }
    }
  }

  canvas {
    width: 100% !important;
  }
}
</style>
