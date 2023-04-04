<template>
  <div class="view-memory-test">
    <h1>Memory Test</h1>
    <RouterLink to="/">Home</RouterLink>

    <div ref="refThdViewer" class="thd-viewer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { RouterLink } from 'vue-router'
import sample04 from '@/assets/json/sample04.json'

let camera, scene, renderer
let jsonScene

const isLoaded = ref(false)

const refThdViewer = ref()

const init = () => {
  const container = document.createElement('div')
  refThdViewer.value.appendChild(container)

  const loader = new THREE.ObjectLoader()

  jsonScene = loader.parse(sample04.scene, () => {
    isLoaded.value = true
  })

  camera = loader.parse(sample04.camera)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)
}

const render = () => {
  if (!isLoaded.value) {
    setTimeout(render, 400)
    return
  }

  const group = jsonScene.children[0].clone()
  scene.add(group)

  renderer.render(scene, camera)

  scene.remove(group)

  // clean up
  group.traverse((child) => {
    if (child.dispose) {
      child.dispose()
    }

    if (child.geometry) {
      child.geometry.dispose()
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mtrl) => {
          mtrl.dispose()
          if (mtrl.map) {
            mtrl.map.dispose()
          }
        })
      } else {
        child.material.dispose()
        if (child.material.map) {
          child.material.map.dispose()
        }
      }
    }
  })
}

const remove = () => {
  renderer.info.reset()
  renderer.render(scene, camera)
}

const interval = ref()

onMounted(() => {
  init()
  render()

  interval.value = setInterval(() => {
    remove()

    setTimeout(render, 1000)
  }, 2000)
})

onUnmounted(() => {
  clearInterval(interval.value)
  remove()
})
</script>
