<template>
  <div class="view-change-map-color">
    <h1>Change Map Color</h1>
    <RouterLink to="/">Home</RouterLink>

    <MapControls :imageSrc="baseImage" @change-map="changeMap" />

    <div class="thd-viewer" ref="refThdViewer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import MapControls from './MapControls'
import baseImage from '@/assets/sample-base-map/sample-base-01-1.png'
import sample_background_01 from '@/assets/sample-hdri-background/sample-hdri-background-01.png'

const refThdViewer = ref()

let camera, scene, renderer, sphere, geometry, textureEquirec

const setTextureDefaultOptions = (texture) => {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
}

const setMaterialDefaultOptions = (material) => {
  material.map.repeat.set(2, 2)
  material.envMap = textureEquirec
  material.envMapIntensity = 5
}

const init = () => {
  const container = document.createElement('div')
  refThdViewer.value.appendChild(container)
  const { width, height } = refThdViewer.value.getBoundingClientRect()

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 100000)
  camera.position.z = 3

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.physicallyCorrectLights = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  container.appendChild(renderer.domElement)

  new OrbitControls(camera, renderer.domElement)

  geometry = new THREE.SphereGeometry(1, 256, 256)

  const loader = new THREE.TextureLoader()
  const texture = loader.load(baseImage)
  setTextureDefaultOptions(texture)

  textureEquirec = loader.load(sample_background_01)
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping
  textureEquirec.encoding = THREE.sRGBEncoding

  const material = new THREE.MeshStandardMaterial()
  material.map = texture
  setMaterialDefaultOptions(material)

  scene.background = textureEquirec

  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  texture.dispose()
  material.dispose()
}

const animation = ref()
const animate = () => {
  animation.value = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  animate()
})

const changeMap = (canvas) => {
  const newTexture = new THREE.CanvasTexture(canvas)
  setTextureDefaultOptions(newTexture)

  const newMaterial = new THREE.MeshStandardMaterial({
    map: newTexture,
  })
  setMaterialDefaultOptions(newMaterial)

  sphere.material = newMaterial
  newTexture.dispose()
  newMaterial.dispose()
}

onUnmounted(() => {
  cancelAnimationFrame(animation.value)
  geometry.dispose()
  textureEquirec.dispose()
  renderer.dispose()
})
</script>

<style lang="scss" scoped>
.view-change-map-color {
  .thd-viewer {
    width: 80%;
    aspect-ratio: 16 / 9;
  }
}
</style>
