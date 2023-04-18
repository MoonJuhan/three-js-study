<template>
  <div class="view-change-model">
    <h1>Change Map Color</h1>
    <RouterLink to="/">Home</RouterLink>

    <div class="controls-wrapper">
      <span>Model Controls</span>
      <div class="buttons">
        <button v-for="model in modelControls.map(({ name }) => name)" :key="model" @click="modelType = model">
          {{ model }} {{ modelType === model ? '(Selected)' : '' }}
        </button>
      </div>

      <span>Texture Controls</span>
      <div class="buttons">
        <button v-for="texture in textureControls" :key="texture" @click="textureType = texture">
          {{ texture }} {{ textureType === texture ? '(Selected)' : '' }}
        </button>
      </div>
    </div>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import sampleBackground from '@/assets/sample-hdri-background/sample-hdri-background-01.png'

const refThdViewer = ref()
let scene
const background = ref()
const camera = ref()
const renderer = ref()

const initThdViewer = () => {
  const { width, height } = refThdViewer.value.getBoundingClientRect()

  const textureLoader = new THREE.TextureLoader()
  background.value = textureLoader.load(sampleBackground)
  background.value.mapping = THREE.EquirectangularReflectionMapping
  background.value.encoding = THREE.sRGBEncoding

  scene = new THREE.Scene()
  scene.background = background.value
  camera.value = new THREE.PerspectiveCamera(70, width / height, 1, 100000)
  camera.value.position.z = 3

  renderer.value = new THREE.WebGLRenderer({ antialias: true })
  renderer.value.setSize(width, height)
  renderer.value.outputEncoding = THREE.sRGBEncoding
  renderer.value.toneMapping = THREE.ACESFilmicToneMapping
  refThdViewer.value.appendChild(renderer.value.domElement)

  // eslint-disable-next-line no-new
  new OrbitControls(camera.value, renderer.value.domElement)

  animate()
}

const animation = ref()
const animate = () => {
  animation.value = requestAnimationFrame(animate)
  renderer.value.render(scene, camera.value)
}

let gltfModel

const setModel = async (type) => {
  textureType.value = ''
  scene.remove(gltfModel)
  materials.value = []

  try {
    const gltfLoader = new GLTFLoader()

    gltfLoader.load(`/sample-gltf/${type.replaceAll(' ', '_')}.gltf`, (gltf) => {
      const { scale, position } = modelControls.find(({ name }) => name === modelType.value)
      if (scale) {
        gltf.scene.scale.set(scale, scale, scale)
      }

      if (position) {
        gltf.scene.position.set(position.x, position.y, position.z)
      }

      gltfModel = gltf.scene

      gltfModel.traverse((object) => {
        if (
          object instanceof THREE.Mesh &&
          materials.value.findIndex((material) => material.uuid === object.material.uuid) === -1
        ) {
          object.material.envMap = background.value
          materials.value.push(object.material)
        }
      })

      scene.add(gltfModel)
    })
  } catch (error) {
    console.log(error)
    console.log('Error')
  }
}

const materials = ref([])

const setTexture = async (type) => {
  console.log(`setTexture ${type}`)

  const { textureTargetIndex } = modelControls.find(({ name }) => name === modelType.value)
  if (type === 'type a') {
    setMaterial(materials.value[textureTargetIndex])
  }
}

const setMaterial = async (material) => {
  const textureLoader = new THREE.TextureLoader()

  const loadTexture = async (srcName, oldMap) => {
    const textureSrc = await import(`@/assets/sample-6-type-map/${srcName}.jpg`)

    const texture = textureLoader.load(textureSrc.default)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    const { x, y } = oldMap?.repeat || { x: 0.01, y: 0.01 }
    texture.repeat.set(x, y)

    return texture
  }

  const baseMap = await loadTexture('sample-base', material.map)
  material.map = baseMap

  if (material.displacementMap) {
    const displacementMap = await loadTexture('sample-disp', material.displacementMap)
    material.displacementMap = displacementMap
  }

  const normalMap = await loadTexture('sample-normal', material.normalMap)
  material.normalMap = normalMap

  const roughnessMap = await loadTexture('sample-rough', material.roughnessMap)
  material.roughnessMap = roughnessMap

  material.needsUpdate = true
}

onMounted(() => {
  initThdViewer()
  setModel(modelType.value)
})

const modelType = ref('type a')
const modelControls = [
  { name: 'type a', scale: 15, position: { x: -0.5, y: -3.8, z: -2.5 }, textureTargetIndex: 0 },
  { name: 'type b', scale: 10, position: { x: -0.5, y: -3.8, z: -2.5 }, textureTargetIndex: 0 },
  { name: 'type c', scale: 0.01, textureTargetIndex: 0 },
]

watch(
  () => modelType.value,
  (modelType) => {
    setModel(modelType)
  }
)

const textureType = ref('')
const textureControls = ['type a']

watch(
  () => textureType.value,
  (textureType) => {
    setTexture(textureType)
  }
)

onUnmounted(() => {
  cancelAnimationFrame(animation.value)
})
</script>

<style lang="scss" scoped>
.view-change-model {
  .controls-wrapper {
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    .buttons {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      column-gap: 10px;

      button {
        cursor: pointer;
      }
    }
  }

  .thd-viewer {
    aspect-ratio: 16 / 9;
  }
}
</style>
