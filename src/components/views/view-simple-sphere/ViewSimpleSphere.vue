Can you understand the code below?

<template>
  <div class="view-simple-sphere">
    <h1>Simple Sphere</h1>
    <RouterLink to="/">Home</RouterLink>

    <SimpleSphereControls
      @re-render-geometry="reRenderGeometry"
      @re-render-sphere="reRenderSphere"
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

  loadGeometryAndTexture()
  renderLight()
  renderSphere()
  renderBackground()
}

const loadGeometryAndTexture = async () => {
  // Sphere Geometry
  geometry = new THREE.SphereGeometry(1, 64, 64)

  // Box Geometry
  // geometry = new THREE.BoxGeometry(1, 1, 1)

  const loader = new THREE.TextureLoader()
  baseColorMap = loader.load(sample_base)
  baseColorMap.wrapS = THREE.RepeatWrapping
  baseColorMap.wrapT = THREE.RepeatWrapping

  displacementMap = loader.load(sample_disp)
  displacementMap.wrapS = THREE.RepeatWrapping
  displacementMap.wrapT = THREE.RepeatWrapping

  normalMap = loader.load(sample_normal)
  normalMap.wrapS = THREE.RepeatWrapping
  normalMap.wrapT = THREE.RepeatWrapping

  roughnessMap = loader.load(sample_rough)
  roughnessMap.wrapS = THREE.RepeatWrapping
  roughnessMap.wrapT = THREE.RepeatWrapping
}

const reRenderGeometry = ({ segments }) => {
  scene.remove(sphere)
  geometry.dispose()

  geometry = new THREE.SphereGeometry(1, segments, segments)
  sphere = new THREE.Mesh(geometry, material)

  scene.add(sphere)
}

const renderLight = () => {
  // var light = new THREE.DirectionalLight(0xffffff, 1)
  // light.position.set(1, 1, 1)
  // scene.add(light)
  // // add some lights to the scene
  // const light1 = new THREE.PointLight(0xffffff, 1, 100)
  // light1.position.set(0, 5, 0)
  // scene.add(light1)
  // const light2 = new THREE.AmbientLight(0xffffff, 0.2)
  // scene.add(light2)
}

let geometry, baseColorMap, displacementMap, normalMap, roughnessMap, material

const removeSphere = () => {
  scene.remove(sphere)

  geometry.dispose()

  baseColorMap.dispose()
  displacementMap.dispose()
  normalMap.dispose()
  roughnessMap.dispose()
  material.dispose()

  renderer.info.reset()
}

const renderSphere = (
  options = {
    heightScale: 0.01,
    roughness: 0.3,
    normalScaleVector01: 1,
    normalScaleVector02: 1,
    scaleSize: 1,
    envMapIntensity: 5,
    isUseMap: true,
    isUseDisplacementMap: true,
    isUseNormalMap: true,
    isUseRoughnessMap: true,
    toneMappingExpose: 1,
    hsl01: 1,
    hsl02: 1,
    hsl03: 1,
  }
) => {
  const {
    heightScale,
    normalScaleVector01,
    normalScaleVector02,
    roughness,
    scaleSize,
    envMapIntensity,
    isUseMap,
    isUseDisplacementMap,
    isUseNormalMap,
    isUseRoughnessMap,
    toneMappingExpose,
    hsl01,
    hsl02,
    hsl03,
  } = options

  material = new THREE.MeshStandardMaterial()

  if (isUseMap) {
    material.map = baseColorMap
    material.map.repeat.set(scaleSize, scaleSize)
  }

  if (isUseDisplacementMap) {
    material.displacementMap = displacementMap
    material.displacementMap.repeat.set(scaleSize, scaleSize)
    material.displacementScale = heightScale
  }

  if (isUseNormalMap) {
    material.normalMap = normalMap
    material.normalMap.repeat.set(scaleSize, scaleSize)
    material.normalScale = new THREE.Vector2(normalScaleVector01, normalScaleVector02)
  }

  if (isUseRoughnessMap) {
    material.roughnessMap = roughnessMap
    material.roughnessMap.repeat.set(scaleSize, scaleSize)
    material.roughness = roughness
  }

  if (textureEquirec) {
    material.envMap = textureEquirec
    material.envMapIntensity = envMapIntensity || 5
  }

  const color = new THREE.Color()
  color.setHSL(hsl01, hsl02, hsl03)
  material.color = color

  sphere = new THREE.Mesh(geometry, material)
  renderer.toneMappingExposure = toneMappingExpose

  scene.add(sphere)
}

const reRenderSphere = (options) => {
  removeSphere()
  renderSphere(options)
}

let textureEquirec

const renderBackground = (src = sample_background_01) => {
  const textureLoader = new THREE.TextureLoader()

  textureEquirec = textureLoader.load(src)
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping
  textureEquirec.encoding = THREE.sRGBEncoding

  scene.background = textureEquirec
  material.envMap = textureEquirec
  material.envMapIntensity = 5
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
