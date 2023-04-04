import * as THREE from 'three'
import { OrbitControls } from '@/helpers/OrbitControls'
import { VRButton } from '@/helpers/VRButton'
import { ref } from 'vue'

const initRenderer = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputEncoding = THREE.sRGBEncoding

  const loader = new THREE.ObjectLoader()

  const vrButton = VRButton.createButton(renderer) // eslint-disable-line no-undef

  const dom = document.createElement('div')
  dom.appendChild(renderer.domElement)

  return {
    renderer,
    loader,
    vrButton,
    dom,
  }
}

const dispatch = (array, event) => {
  array.forEach((item) => item(event))
}

const useThreeJsViewer = () => {
  const { renderer, loader, dom } = initRenderer()

  const width = ref(500)
  const height = ref(500)

  const load = (json) => {
    setRendererProjectSetting(json)
    setThdViewerScene(json.scene)
    setCamera(loader.parse(json.camera), width.value, height.value)

    new OrbitControls(thdViewerCamera, renderer.domElement)

    setEvent(json)
  }

  const setRendererProjectSetting = ({ project }) => {
    if (project.vr !== undefined) renderer.xr.enabled = project.vr

    if (project.shadows !== undefined) renderer.shadowMap.enabled = project.shadows

    if (project.shadowType !== undefined) renderer.shadowMap.type = project.shadowType

    if (project.toneMapping !== undefined) renderer.toneMapping = project.toneMapping

    if (project.toneMappingExposure !== undefined) renderer.toneMappingExposure = project.toneMappingExposure

    if (project.physicallyCorrectLights !== undefined) {
      renderer.physicallyCorrectLights = project.physicallyCorrectLights
    }
  }

  const renderFunc = () => {
    renderer.render(thdViewerScene, thdViewerCamera)
  }

  let thdViewerScene
  const setThdViewerScene = (value) => {
    thdViewerScene = loader.parse(value)
  }

  let thdViewerCamera

  const setCamera = (value, width, height) => {
    thdViewerCamera = value
    thdViewerCamera.aspect = width / height
    thdViewerCamera.updateProjectionMatrix()
  }

  const events = {
    init: [],
    start: [],
    stop: [],
    keydown: [],
    keyup: [],
    pointerdown: [],
    pointerup: [],
    pointermove: [],
    update: [],
  }

  const setEvent = ({ scripts }) => {
    const scriptWrapParams = ['player', 'renderer', 'scene', 'camera']

    const eventKeys = Object.keys(events)
    eventKeys.forEach((key) => scriptWrapParams.push(key))
    const scriptWrapResult = `{${eventKeys.map((key) => `${key}:${key}`).join(',')}}`

    for (let uuid in scripts) {
      const object = thdViewerScene.getObjectByProperty('uuid', uuid, true)

      if (object === undefined) {
        console.warn('APP.Player: Script without object.', uuid)
        continue
      }

      for (var i = 0; i < scripts[uuid].length; i++) {
        const { source } = scripts[uuid][i]

        // const functions = (scriptWrapParams, source + '\nreturn ' + scriptWrapResult + ';')
        const functions = new Function(scriptWrapParams, source + '\nreturn ' + scriptWrapResult + ';').bind(object)(
          this,
          renderer,
          thdViewerScene,
          thdViewerCamera
        )

        for (var name in functions) {
          if (functions[name] === undefined) continue

          if (events[name] === undefined) {
            console.warn('APP.Player: Event type not supported (', name, ')')
            continue
          }

          events[name].push(functions[name].bind(object))
        }
      }
    }

    dispatch(events.init, arguments)
  }

  const setThdViewerSize = (newWidth, newHeight) => {
    width.value = newWidth
    height.value = newHeight

    if (thdViewerCamera) {
      thdViewerCamera.aspect = newWidth / newHeight
      thdViewerCamera.updateProjectionMatrix()
    }

    if (renderer) {
      renderer.setSize(newWidth, newHeight)
    }
  }

  const startTime = ref()
  const prevTime = ref()

  const animate = () => {
    const time = performance.now()

    try {
      dispatch(events.update, {
        time: time - startTime.value,
        delta: time - prevTime.value,
      })
    } catch (e) {
      console.error(e.message || e, e.stack || '')
    }

    renderFunc()

    prevTime.value = time
  }

  const thdViewerPlay = () => {
    if (renderer.xr.enabled) dom.append(vrButton)

    startTime.value = prevTime.value = performance.now()

    // document.addEventListener('keydown', onKeyDown)
    // document.addEventListener('keyup', onKeyUp)
    // document.addEventListener('pointerdown', onPointerDown)
    // document.addEventListener('pointerup', onPointerUp)
    // document.addEventListener('pointermove', onPointerMove)

    dispatch(events.start, arguments)

    renderer.setAnimationLoop(animate)
  }

  const resetRenderer = () => {
    if (!thdViewerScene?.children) return

    thdViewerScene.children.forEach((c) => {
      thdViewerScene.remove(c)
    })

    console.log(thdViewerScene)
  }

  return {
    load,
    setThdViewerSize,
    dom,
    thdViewerPlay,
    renderer,
    thdViewerScene,
    renderFunc,
    setThdViewerScene,
    resetRenderer,
  }
}

export default useThreeJsViewer
