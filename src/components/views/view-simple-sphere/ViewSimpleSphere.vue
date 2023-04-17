Can you understand the code below?

<template>
  <div class="view-simple-sphere">
    <h1>Simple Sphere</h1>
    <RouterLink to="/">Home</RouterLink>

    <SimpleSphereControls
      @re-render-geometry="reRenderGeometry"
      @re-render-sphere="reRenderSphere"
      @re-render-map="reRenderMap"
      @re-render-background="renderBackground"
      :isRotate="isRotate"
      @change-is-rotate="
        () => {
          isRotate = !isRotate
        }
      "
    />

    <div class="thd-viewer" ref="refThdViewer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from '@/helpers/OrbitControls'
import { RouterLink } from 'vue-router'
import sample_base from '@/assets/sample-6-type-map/sample-base.jpg'
import sample_disp from '@/assets/sample-6-type-map/sample-disp.jpg'
import sample_normal from '@/assets/sample-6-type-map/sample-normal.jpg'
import sample_rough from '@/assets/sample-6-type-map/sample-rough.jpg'
import sample_background_01 from '@/assets/sample-hdri-background/sample-hdri-background-01.png'
import SimpleSphereControls from './SimpleSphereControls'

let camera, scene, renderer, sphere

const refThdViewer = ref()

let baseColorMap, displacementMap, normalMap, roughnessMap

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

  const geometry = new THREE.SphereGeometry(1, 64, 64)

  const loader = new THREE.TextureLoader()

  const loadMap = (src) => {
    const texture = loader.load(src)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    return texture
  }

  baseColorMap = loadMap(sample_base)
  displacementMap = loadMap(sample_disp)
  normalMap = loadMap(sample_normal)
  roughnessMap = loadMap(sample_rough)

  const material = new THREE.MeshStandardMaterial({
    map: baseColorMap,
    displacementMap: displacementMap,
    displacementScale: 0.01,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    roughness: 0.3,
  })

  sphere = new THREE.Mesh(geometry, material)
  renderer.toneMappingExposure = 1

  scene.add(sphere)

  renderBackground()
  geometry.dispose()
}

const reRenderGeometry = ({ segments }) => {
  sphere.geometry = new THREE.SphereGeometry(1, segments, segments)
}

const reRenderSphere = (options = {}) => {
  const keys = Object.keys(options)

  if (keys.includes('hsl01') && keys.includes('hsl02') && keys.includes('hsl03')) {
    const { hsl01, hsl02, hsl03 } = options

    const newColor = new THREE.Color()
    newColor.setHSL(hsl01, hsl02, hsl03)

    sphere.material.color = newColor
  }

  if (keys.includes('normalScale')) {
    const { normalScale } = options

    sphere.material.normalScale = new THREE.Vector2(normalScale, normalScale)
  }

  if (keys.includes('scaleSize')) {
    const { scaleSize } = options

    sphere.material.map?.repeat.set(scaleSize, scaleSize)
    sphere.material.displacementMap?.repeat.set(scaleSize, scaleSize)
    sphere.material.normalMap?.repeat.set(scaleSize, scaleSize)
    sphere.material.roughnessMap?.repeat.set(scaleSize, scaleSize)
  }

  if (keys.includes('heightScale')) {
    const { heightScale } = options

    sphere.material.displacementScale = heightScale
  }

  if (keys.includes('roughness')) {
    const { roughness } = options

    sphere.material.roughness = roughness
  }

  if (keys.includes('envMapIntensity')) {
    const { envMapIntensity } = options

    sphere.material.envMapIntensity = envMapIntensity
  }

  if (keys.includes('toneMappingExpose')) {
    const { toneMappingExpose } = options

    renderer.toneMappingExposure = toneMappingExpose
  }
}

const reRenderMap = ({ isUseMap, isUseDisplacementMap, isUseNormalMap, isUseRoughnessMap }) => {
  const { material } = sphere

  if (isUseMap && !material.map) {
    material.map = baseColorMap
  }

  if (!isUseMap) {
    material.map = null
  }

  if (isUseDisplacementMap && !material.displacementMap) {
    material.displacementMap = displacementMap
  }

  if (!isUseDisplacementMap) {
    material.displacementMap = null
  }

  if (isUseNormalMap && !material.normalMap) {
    material.normalMap = normalMap
  }

  if (!isUseNormalMap) {
    material.normalMap = null
  }

  if (isUseRoughnessMap && !material.roughnessMap) {
    material.roughnessMap = roughnessMap
  }

  if (!isUseRoughnessMap) {
    material.roughnessMap = null
  }

  material.needsUpdate = true
}

const renderBackground = (src = sample_background_01) => {
  const textureLoader = new THREE.TextureLoader()

  const textureEquirec = textureLoader.load(src)
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping
  textureEquirec.encoding = THREE.sRGBEncoding

  scene.background = textureEquirec
  sphere.material.envMap = textureEquirec
  sphere.material.envMapIntensity = 5

  textureEquirec.dispose()
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
  animate()
})

const removeSphere = () => {
  scene.remove(sphere)

  baseColorMap.dispose()
  displacementMap.dispose()
  normalMap.dispose()
  roughnessMap.dispose()

  renderer.info.reset()
}

const resetVariables = () => {
  camera = null
  scene = null
  renderer = null
  sphere = null
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
    row-gap: 20px;

    > button {
      border: 1px solid black;
    }
  }

  .control {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    > span {
      font-size: 18px;
    }
  }

  .re-render-button {
    font-size: 18px;
  }

  .thd-viewer {
    width: 80%;
    aspect-ratio: 16 / 9;
  }
}
</style>
