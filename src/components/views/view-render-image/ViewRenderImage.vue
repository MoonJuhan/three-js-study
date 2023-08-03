<template>
  <div class="view-render-image flex">
    <h1>Render Image</h1>
    <RouterLink to="/">Home</RouterLink>
    <div class="buttons">
      <button @click="onClickDownload()">Download</button>
      <button v-for="camera in cameras" :key="camera.uuid" @click="onClickCamera(camera)">{{ camera.name }}</button>
    </div>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from '@/helpers/OrbitControls'
import { RouterLink } from 'vue-router'

const refThdViewer = ref()

let camera, scene, renderer, sphere

const fileLoader = new THREE.FileLoader()

const loadJSON = (json) => {
  const { project, scene, camera } = json

  const { shadows, shadowType, toneMapping, toneMappingExposure } = project

  if (shadows) renderer.shadowMap.enabled = shadows

  if (shadowType) renderer.shadowMap.type = shadowType

  if (toneMapping) renderer.toneMapping = toneMapping

  if (toneMappingExposure) renderer.toneMappingExposure = toneMappingExposure

  const objectLoader = new THREE.ObjectLoader()

  const jsonScene = objectLoader.parse(json.scene)
  const jsonCamera = objectLoader.parse(json.camera)
  return { jsonScene, jsonCamera }
}

const animate = () => {
  renderer.render(scene, camera)
}

const play = () => {
  renderer.setAnimationLoop(animate)
}

const init = async () => {
  const { width, height } = refThdViewer.value.getBoundingClientRect()
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(width, height)

  refThdViewer.value.appendChild(renderer.domElement)

  fileLoader.load('app.json', function (text) {
    const { jsonScene, jsonCamera } = loadJSON(JSON.parse(text))
    scene = jsonScene
    camera = jsonCamera

    scene.children[1].material.normalScale = new THREE.Vector2(1, 1)

    scene.children[2].intensity = 1
    scene.children[3].intensity = 1

    setCameras(scene)
    renderer.render(scene, camera)
    // new OrbitControls(camera, renderer.domElement)
    // play()
  })
}
onMounted(init)

const onClickDownload = () => {
  renderer.render(scene, camera)

  var link = document.createElement('a')
  link.download = 'filename.png'
  link.href = refThdViewer.value.childNodes[0].toDataURL()
  link.click()
}

const setCameras = (targetScene) => {
  const childrens = targetScene.children[0].children

  cameras.value = childrens.filter((children) => ['OrthographicCamera', 'PerspectiveCamera'].includes(children.type))
}
const cameras = ref()

const onClickCamera = (targetCamera) => {
  camera = targetCamera
  renderer.render(scene, camera)
}
</script>

<style lang="scss" scoped>
.view-render-image {
  .buttons {
    display: flex;
    gap: 8px;
  }

  .thd-viewer {
    background-color: red;
    width: 100%;
    // height: 4096px;
    // aspect-ratio: 16 / 9;
    aspect-ratio: 1809 / 1000;
  }
}
</style>
