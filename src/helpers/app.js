import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js'
import { VRButton } from './VRButton'

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
  for (var i = 0, l = array.length; i < l; i++) {
    array[i](event)
  }
}

const setCamera = (value, width, height) => {
  const camera = value

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  return camera
}

const renderFunc = (renderer, scene, camera) => {
  renderer.render(scene, camera)
}

const app = {
  Player: function () {
    const { renderer, loader, vrButton, dom } = initRenderer()

    var camera, scene

    var events = {}

    this.dom = dom

    this.width = 500
    this.height = 500

    this.load = function (json) {
      var project = json.project

      if (project.vr !== undefined) renderer.xr.enabled = project.vr
      if (project.shadows !== undefined) renderer.shadowMap.enabled = project.shadows
      if (project.shadowType !== undefined) renderer.shadowMap.type = project.shadowType
      if (project.toneMapping !== undefined) renderer.toneMapping = project.toneMapping
      if (project.toneMappingExposure !== undefined) renderer.toneMappingExposure = project.toneMappingExposure
      if (project.physicallyCorrectLights !== undefined)
        renderer.physicallyCorrectLights = project.physicallyCorrectLights

      this.setScene(loader.parse(json.scene))
      camera = setCamera(loader.parse(json.camera), this.width, this.height)

      new OrbitControls(camera, renderer.domElement)

      events = {
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

      var scriptWrapParams = 'player,renderer,scene,camera'
      var scriptWrapResultObj = {}

      for (var eventKey in events) {
        scriptWrapParams += ',' + eventKey
        scriptWrapResultObj[eventKey] = eventKey
      }

      // eslint-disable-next-line no-useless-escape
      var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '')

      for (var uuid in json.scripts) {
        var object = scene.getObjectByProperty('uuid', uuid, true)

        if (object === undefined) {
          console.warn('APP.Player: Script without object.', uuid)
          continue
        }

        var scripts = json.scripts[uuid]

        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i]

          var functions = new Function(scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';').bind(
            object
          )(this, renderer, scene, camera)

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

    this.setScene = function (value) {
      scene = value
    }

    this.setPixelRatio = function (pixelRatio) {
      renderer.setPixelRatio(pixelRatio)
    }

    this.setSize = function (width, height) {
      this.width = width
      this.height = height

      if (camera) {
        camera.aspect = this.width / this.height
        camera.updateProjectionMatrix()
      }

      if (renderer) {
        renderer.setSize(width, height)
      }
    }

    var time, startTime, prevTime

    function animate() {
      time = performance.now()

      try {
        dispatch(events.update, {
          time: time - startTime,
          delta: time - prevTime,
        })
      } catch (e) {
        console.error(e.message || e, e.stack || '')
      }

      renderFunc(renderer, scene, camera)

      prevTime = time
    }

    this.setVideo = (videoList) => {
      const getChildred = (list, name) => {
        if (list.find((el) => el.name === name)) {
          return list.find((el) => el.name === name)
        }
        const results = []
        list.forEach((el) => {
          if (el.children) results.push(getChildred(el.children, name))
        })
        return results[0]
      }

      const refineIndex = (index) => {
        if (index < 10) return `0${index}`

        return index
      }

      videoList.forEach((video, index) => {
        const id = `video_${refineIndex(index + 1)}`
        const ref = document.getElementById(id)

        const texture = new THREE.VideoTexture(ref)
        const material = new THREE.MeshBasicMaterial({ map: texture })

        const screen = getChildred(scene.children, id)

        if (screen) screen.material = material
      })
    }

    this.play = function () {
      if (renderer.xr.enabled) dom.append(vrButton)

      startTime = prevTime = performance.now()

      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('pointerup', onPointerUp)
      document.addEventListener('pointermove', onPointerMove)

      dispatch(events.start, arguments)

      renderer.setAnimationLoop(animate)
    }

    this.stop = function () {
      if (renderer.xr.enabled) vrButton.remove()

      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointermove', onPointerMove)

      dispatch(events.stop, arguments)

      renderer.setAnimationLoop(null)
    }

    this.render = function (time) {
      dispatch(events.update, { time: time * 1000, delta: 0 /* TODO */ })

      renderFunc(renderer, scene, camera)
    }

    this.dispose = function () {
      renderer.dispose()

      camera = undefined
      scene = undefined
    }

    const onKeyDown = (event) => {
      dispatch(events.keydown, event)
    }

    const onKeyUp = (event) => {
      dispatch(events.keyup, event)
    }

    const onPointerDown = (event) => {
      dispatch(events.pointerdown, event)
    }

    const onPointerUp = (event) => {
      dispatch(events.pointerup, event)
    }

    const onPointerMove = (event) => {
      dispatch(events.pointermove, event)
    }
  },
}

export { app }
