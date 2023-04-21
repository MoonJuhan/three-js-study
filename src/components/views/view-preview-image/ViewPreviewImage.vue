<template>
  <div class="view-preview-image">
    <div>
      <h1>Preview Image</h1>
      <RouterLink to="/">Home</RouterLink>
    </div>

    <span>4 Maps</span>
    <div class="images">
      <img v-for="image in images" :src="image" :key="image" />
    </div>

    <div class="controls">
      <button @click="onClickMake()">Make</button>
    </div>

    <div class="previews">
      <div>
        <span>viewer</span>
        <div ref="refThdViewer" class="contents-wrapper" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as THREE from 'three'
import baseImage from '@/assets/sample-6-type-map/sample-base.jpg'
import dispImage from '@/assets/sample-6-type-map/sample-disp.jpg'
import normalImage from '@/assets/sample-6-type-map/sample-normal.jpg'
import roughImage from '@/assets/sample-6-type-map/sample-rough.jpg'
import backgroundImage from '@/assets/sample-hdri-background/sample-hdri-background-01.png'

const images = [baseImage, dispImage, normalImage, roughImage]

const refThdViewer = ref()

let camera, scene, renderer, sphere, geometry, background

const textureLoader = new THREE.TextureLoader()

const loadTexture = (image) => {
  const texture = textureLoader.load(image)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return texture
}

const onClickMake = () => {
  const { width, height } = refThdViewer.value.getBoundingClientRect()

  background = textureLoader.load(backgroundImage)
  background.mapping = THREE.EquirectangularReflectionMapping
  background.encoding = THREE.sRGBEncoding

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 100000)
  camera.position.z = 2.2

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  geometry = new THREE.SphereGeometry(1, 32, 32)

  const material = new THREE.MeshStandardMaterial({
    map: loadTexture(baseImage),
    displacementMap: loadTexture(dispImage),
    displacementScale: 0.01,
    normalMap: loadTexture(normalImage),
    roughnessMap: loadTexture(roughImage),
    roughness: 0.3,
  })
  material.envMap = background
  material.envMapIntensity = 5

  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  setTimeout(() => {
    refThdViewer.value.appendChild(renderer.domElement)
    renderer.render(scene, camera)
  }, 400)

  material.dispose()
}

onUnmounted(() => {
  geometry.dispose()
  renderer.dispose()
})
</script>

<style lang="scss" scoped>
.view-preview-image {
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  .images {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    column-gap: 10px;

    img {
      width: 100%;
    }
  }

  .controls {
    display: flex;
  }

  .previews {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 10px;

    > div {
      width: 100%;
      display: flex;
      flex-direction: column;
      column-gap: 10px;
    }

    .contents-wrapper {
      width: 100%;
      aspect-ratio: 1 /1;
      border: 1px solid black;
    }
  }
}
</style>
