<template>
  <div class="view-game-test">
    <div ref="refCanvasWrapper" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

let keydownCode
let keydownItensity = 0

const onkeydown = ({ code }) => {
  keydownCode = code
}

const onkeyup = (e) => {
  keydownItensity = 0
  keydownCode = null
}

let camera, scene, renderer, cube

const refCanvasWrapper = ref()
const init = () => {
  document.addEventListener('keydown', onkeydown)
  document.addEventListener('keyup', onkeyup)
  const { width, height } = refCanvasWrapper.value.getBoundingClientRect()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.OrthographicCamera(width / -200, width / 200, height / 200, height / -200, 1, 1000)
  camera.position.z = 2

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  refCanvasWrapper.value.appendChild(renderer.domElement)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const texture = new THREE.TextureLoader().load('purp.png')
  const material = new THREE.MeshBasicMaterial({ map: texture })

  cube = new THREE.Mesh(geometry, material)

  // const light = new THREE.AmbientLight(0xffffff, 1)
  // scene.add(light)

  scene.add(cube)

  geometry.dispose()
  material.dispose()

  animate()
}

const checkRotate = () => {
  if (cube.scale.x === 1) {
    cube.rotation.z -= 0.04
  } else {
    cube.rotation.z += 0.04
  }
}
const checkMove = () => {
  if (keydownItensity < 100) {
    keydownItensity += 1
  }

  if (keydownCode === 'ArrowUp') {
    cube.position.y += 0.01
    return
  }

  if (keydownCode === 'ArrowDown') {
    cube.position.y -= 0.01
    return
  }

  if (keydownCode === 'ArrowLeft') {
    cube.scale.x = -1
    cube.position.x -= 0.001 * keydownItensity
    return
  }

  if (keydownCode === 'ArrowRight') {
    cube.scale.x = 1
    cube.position.x += 0.001 * keydownItensity
    return
  }
}

const animation = ref()
const animate = () => {
  animation.value = requestAnimationFrame(animate)

  checkRotate()
  checkMove()

  renderer.render(scene, camera)
}

onMounted(init)

onUnmounted(() => {
  document.removeEventListener('keydown', onkeydown)
  document.removeEventListener('keyup', onkeyup)

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
