Can you understand the code below?

<template>
  <div class="view-simple-sphere">
    <h1>Simple Sphere</h1>
    <RouterLink to="/">Home</RouterLink>

    <div class="controls">
      <AppSlider
        :currentValue="cameraZoom"
        @update-current-value="setCameraZoom"
        :minNumber="0"
        :maxNumber="10"
        label="Camera Zoom"
      />
      <AppSlider
        :currentValue="heightScale"
        @update-current-value="setHeightScale"
        :minNumber="0"
        :maxNumber="0.5"
        :fixedPoint="2"
        label="Height Scale"
      />
      <AppSlider
        :currentValue="roughness"
        @update-current-value="setRoughness"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="1"
        label="Roughness"
      />
      <AppSlider
        :currentValue="normalScaleVector01"
        @update-current-value="setNormalScaleVector01"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="1"
        label="normalScaleVector01"
      />
      <AppSlider
        :currentValue="normalScaleVector02"
        @update-current-value="setNormalScaleVector02"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="1"
        label="normalScaleVector02"
      />
      <AppSlider
        :currentValue="scaleSize"
        @update-current-value="setScaleSize"
        :minNumber="0"
        :maxNumber="2"
        :fixedPoint="2"
        label="Scale Size"
      />
    </div>

    <div class="controls">
      <button @click="onClickRemove()" class="re-render-button">Remove</button>
      <button @click="onClickReRender()" class="re-render-button">Re Render</button>
      <button @click="isRotate = !isRotate" class="re-render-button">Rotate {{ !isRotate ? 'On' : 'Off' }}</button>
    </div>

    <div ref="refThdViewer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { RouterLink } from 'vue-router'
import sample_base from '@/assets/sample-6-type-map/sample-base.png'
import sample_disp from '@/assets/sample-6-type-map/sample-disp.png'
import sample_lt from '@/assets/sample-6-type-map/sample-lt.png'
import sample_mtl from '@/assets/sample-6-type-map/sample-mtl.png'
import sample_normal from '@/assets/sample-6-type-map/sample-normal.png'
import sample_rough from '@/assets/sample-6-type-map/sample-rough.png'
import AppSlider from './AppSlider.vue'

let camera, scene, renderer, sphere

const refThdViewer = ref()

const cameraZoom = ref(3)
const setCameraZoom = (value) => {
  cameraZoom.value = value
}
const heightScale = ref(0.01)
const setHeightScale = (value) => {
  heightScale.value = value
}

const roughness = ref(0.3)
const setRoughness = (value) => {
  roughness.value = value
}

const normalScaleVector01 = ref(1)
const setNormalScaleVector01 = (value) => {
  normalScaleVector01.value = value
}

const normalScaleVector02 = ref(1)
const setNormalScaleVector02 = (value) => {
  normalScaleVector02.value = value
}

const scaleSize = ref(0.1)
const setScaleSize = (value) => {
  scaleSize.value = value
}

const init = () => {
  const container = document.createElement('div')
  refThdViewer.value.appendChild(container)

  scene = new THREE.Scene()
  // scene.background = new THREE.Color(0xc4c4c4)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 3

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)
}

const render = () => {
  var light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(1, 1, 1)
  scene.add(light)

  // add some lights to the scene
  const light1 = new THREE.PointLight(0xffffff, 1, 100)
  light1.position.set(0, 5, 0)
  scene.add(light1)

  const light2 = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(light2)
}

let geometry, baseColorMap, displacementMap, metalnessMap, normalMap, roughnessMap, aoMap, material

const renderSphere = () => {
  geometry = new THREE.SphereGeometry(1, 64, 64)

  const loader = new THREE.TextureLoader()
  baseColorMap = loader.load(sample_base)
  displacementMap = loader.load(sample_disp)
  metalnessMap = loader.load(sample_mtl)
  normalMap = loader.load(sample_normal)
  roughnessMap = loader.load(sample_rough)
  aoMap = loader.load(sample_lt)

  material = new THREE.MeshStandardMaterial({
    map: baseColorMap,
    displacementMap,
    displacementScale: heightScale.value,
    metalnessMap,
    normalMap,
    normalScale: new THREE.Vector2(normalScaleVector01.value, normalScaleVector02.value),
    roughnessMap,
    roughness: roughness.value,
    aoMap,
  })

  sphere = new THREE.Mesh(geometry, material)
  sphere.material.map.repeat.set(scaleSize.value, scaleSize.value)

  scene.add(sphere)
}

const removeSphere = () => {
  scene.remove(sphere)

  geometry.dispose()

  baseColorMap.dispose()
  displacementMap.dispose()
  metalnessMap.dispose()
  normalMap.dispose()
  roughnessMap.dispose()
  aoMap.dispose()
  material.dispose()

  renderer.info.reset()
}

const onClickReRender = () => {
  removeSphere()
  camera.position.z = cameraZoom.value
  renderSphere()
}

watch(
  () => [
    cameraZoom.value,
    heightScale.value,
    roughness.value,
    normalScaleVector01.value,
    normalScaleVector02.value,
    scaleSize.value,
  ],
  () => {
    onClickReRender()
  }
)

const onClickRemove = () => {
  removeSphere()
}

const animation = ref()

const isRotate = ref(false)

const animate = function () {
  animation.value = requestAnimationFrame(animate)

  if (isRotate.value) {
    sphere.rotation.x += 0.005
    sphere.rotation.y += 0.005
  }

  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  render()
  renderSphere()
  animate()
})

const resetVariables = () => {
  camera = null
  scene = null
  renderer = null
}

onUnmounted(() => {
  cancelAnimationFrame(animation.value)
  removeSphere()
  resetVariables()
})
</script>

<style lang="scss" scoped>
.view-simple-sphere {
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  > a {
    width: fit-content;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(5, 240px);
    column-gap: 10px;
  }

  .control {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .re-render-button {
    font-size: 18px;
  }
}
</style>
