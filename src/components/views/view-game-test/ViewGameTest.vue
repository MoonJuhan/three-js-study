<template>
  <div class="view-game-test">
    <div ref="refCanvasWrapper" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import sample_background_01 from '@/assets/sample-hdri-background/sample-hdri-background-01.png'

const onkeydown = ({ code }) => {
  if (code === 'ArrowUp') {
    camera.position.y += 0.1
    return
  }

  if (code === 'ArrowDown') {
    camera.position.y -= 0.1
    return
  }

  if (code === 'ArrowLeft') {
    camera.position.x -= 0.1
    return
  }

  if (code === 'ArrowRight') {
    camera.position.x += 0.1
    return
  }

  if (code === 'KeyZ') {
    camera.position.z -= 0.1
    return
  }

  if (code === 'KeyX') {
    camera.position.z += 0.1
    return
  }

  console.log(code)
}

let camera, scene, renderer, textureEquirec

const refCanvasWrapper = ref()
const init = () => {
  document.addEventListener('keydown', onkeydown)
  const { width, height } = refCanvasWrapper.value.getBoundingClientRect()

  scene = new THREE.Scene()

  camera = new THREE.OrthographicCamera(width / -200, width / 200, height / 200, height / -200, 1, 1000)
  camera.position.z = 2

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  refCanvasWrapper.value.appendChild(renderer.domElement)

  const loader = new THREE.TextureLoader()

  textureEquirec = loader.load(sample_background_01)
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping
  textureEquirec.encoding = THREE.sRGBEncoding

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  material.envMap = textureEquirec
  material.envMapIntensity = 5
  const cube = new THREE.Mesh(geometry, material)

  scene.add(cube)

  geometry.dispose()
  material.dispose()

  animate()
}

const animation = ref()
const animate = () => {
  animation.value = requestAnimationFrame(animate)
  renderer.render(scene, camera)
  //   console.log(camera)
}

onMounted(init)

onUnmounted(() => {
  document.removeEventListener('keydown', onkeydown)
  cancelAnimationFrame(animation.value)
  renderer.dispose()
})
</script>

<style lang="scss" scoped>
.view-game-test {
  display: flex;

  > div {
    border: 1px solid black;
    width: 100%;
    aspect-ratio: 16 / 9;
  }
}
</style>
