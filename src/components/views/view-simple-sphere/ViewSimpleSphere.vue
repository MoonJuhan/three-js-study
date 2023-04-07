Can you understand the code below?

<template>
  <div class="view-simple-sphere">
    <h1>Simple Sphere</h1>
    <RouterLink to="/">Home</RouterLink>

    <SimpleSphereControls
      @re-render-sphere="reRenderSphere"
      @re-render-background="renderBackground"
      :isRotate="isRotate"
      @change-is-rotate="
        () => {
          isRotate = !isRotate
        }
      "
    />

    <div ref="refThdViewer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from '@/helpers/OrbitControls'
import { RouterLink } from 'vue-router'
import sample_base from '@/assets/sample-6-type-map/sample-base.png'
import sample_disp from '@/assets/sample-6-type-map/sample-disp.png'
import sample_lt from '@/assets/sample-6-type-map/sample-lt.png'
import sample_mtl from '@/assets/sample-6-type-map/sample-mtl.png'
import sample_normal from '@/assets/sample-6-type-map/sample-normal.png'
import sample_rough from '@/assets/sample-6-type-map/sample-rough.png'
import sample_background_01 from '@/assets/sample-hdri-background/sample-hdri-background-01.png'
import SimpleSphereControls from './SimpleSphereControls'

let camera, scene, renderer, sphere

const refThdViewer = ref()

const init = () => {
  const container = document.createElement('div')
  refThdViewer.value.appendChild(container)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 3

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  new OrbitControls(camera, renderer.domElement)

  loadGeometryAndTexture()
  renderLight()
  renderSphere()
  renderBackground()
}

const loadGeometryAndTexture = async () => {
  geometry = new THREE.SphereGeometry(1, 64, 64)

  const loader = new THREE.TextureLoader()
  baseColorMap = loader.load(sample_base)
  displacementMap = loader.load(sample_disp)
  metalnessMap = loader.load(sample_mtl)
  normalMap = loader.load(sample_normal)
  roughnessMap = loader.load(sample_rough)
  aoMap = loader.load(sample_lt)
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

let geometry, baseColorMap, displacementMap, metalnessMap, normalMap, roughnessMap, aoMap, material

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

const renderSphere = (
  options = {
    heightScale: 0.01,
    roughness: 0.3,
    normalScaleVector01: 1,
    normalScaleVector02: 1,
    scaleSize: 1,
  }
) => {
  const { heightScale, normalScaleVector01, normalScaleVector02, roughness, scaleSize, envMapIntensity } = options

  material = new THREE.MeshStandardMaterial({
    map: baseColorMap,
    displacementMap,
    displacementScale: heightScale,
    metalnessMap,
    normalMap,
    normalScale: new THREE.Vector2(normalScaleVector01, normalScaleVector02),
    roughnessMap,
    roughness,
    aoMap,
  })

  if (textureEquirec) {
    material.envMap = textureEquirec
    material.envMapIntensity = envMapIntensity || 5
  }

  sphere = new THREE.Mesh(geometry, material)
  sphere.material.map.repeat.set(scaleSize, scaleSize)

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
}
</style>
