<template>
  <div class="simple-sphere-controls">
    <div class="controls-header">
      <span class="controls-label">Rotate Animation Controls</span>
      <button
        @click="
          () => {
            isFolded[0] = !isFolded[0]
          }
        "
      >
        {{ isFolded[0] ? 'Open' : 'Fold' }}
      </button>
    </div>

    <div v-if="!isFolded[0]" class="controls">
      <button @click="emit('change-is-rotate')">Rotate {{ !isRotate ? 'On' : 'Off' }}</button>
    </div>

    <div class="controls-header">
      <span class="controls-label">Geometry Controls</span>
      <button
        @click="
          () => {
            isFolded[1] = !isFolded[1]
          }
        "
      >
        {{ isFolded[1] ? 'Open' : 'Fold' }}
      </button>
    </div>

    <div v-if="!isFolded[1]" class="controls">
      <div class="control">
        <span>Segments</span>

        <select v-model="selectedSegments">
          <option v-for="name in segmentsOptions.map(({ name }) => name)" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>
    </div>

    <div class="controls-header">
      <span class="controls-label">Map Controls</span>
      <button
        @click="
          () => {
            isFolded[2] = !isFolded[2]
          }
        "
      >
        {{ isFolded[2] ? 'Open' : 'Fold' }}
      </button>
    </div>

    <div v-if="!isFolded[2]" class="controls">
      <AppSlider
        :currentValue="heightScale"
        @update-current-value="setHeightScale"
        :minNumber="-0.5"
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
        :currentValue="normalScale"
        @update-current-value="setNormalScale"
        :minNumber="-1"
        :maxNumber="1"
        :fixedPoint="1"
        label="Normal Scale"
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
    <div v-if="!isFolded[2]" class="controls">
      <div class="control">
        <span>Map On / Off</span>
        <input type="checkbox" v-model="isUseMap" />
      </div>
      <div class="control">
        <span>Displacement Map On / Off</span>
        <input type="checkbox" v-model="isUseDisplacementMap" />
      </div>
      <div class="control">
        <span>Normal Map On / Off</span>
        <input type="checkbox" v-model="isUseNormalMap" />
      </div>
      <div class="control">
        <span>Roughness Map On / Off</span>
        <input type="checkbox" v-model="isUseRoughnessMap" />
      </div>
    </div>
    <div v-if="!isFolded[2]" class="controls">
      <AppSlider
        :currentValue="hsl01"
        @update-current-value="setHsl01"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="2"
        label="HSL 01"
      />
      <AppSlider
        :currentValue="hsl02"
        @update-current-value="setHsl02"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="2"
        label="HSL 02"
      />
      <AppSlider
        :currentValue="hsl03"
        @update-current-value="setHsl03"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="2"
        label="HSL 03"
      />
    </div>

    <div class="controls-header">
      <span class="controls-label">Background Controls</span>
      <button
        @click="
          () => {
            isFolded[3] = !isFolded[3]
          }
        "
      >
        {{ isFolded[3] ? 'Open' : 'Fold' }}
      </button>
    </div>

    <div v-if="!isFolded[3]" class="controls">
      <div class="control">
        <span>HDRI Background</span>

        <select v-model="selectedBackground">
          <option v-for="name in backgroundOptions.map(({ name }) => name)" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <AppSlider
        :currentValue="envMapIntensity"
        @update-current-value="setEnvMapIntensity"
        :minNumber="0"
        :maxNumber="10"
        :fixedPoint="0"
        label="Env Map Intensity"
      />

      <AppSlider
        :currentValue="toneMappingExpose"
        @update-current-value="setToneMappingExpose"
        :minNumber="0"
        :maxNumber="2"
        :fixedPoint="1"
        label="Tone Mapping Exposure"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppSlider from '@/components/app/AppSlider.vue'
import sample_background_01 from '@/assets/sample-hdri-background/sample-hdri-background-01.png'
import sample_background_02 from '@/assets/sample-hdri-background/sample-hdri-background-02.png'
import sample_background_03 from '@/assets/sample-hdri-background/sample-hdri-background-03.png'
import sample_background_04 from '@/assets/sample-hdri-background/sample-hdri-background-04.png'
import sample_background_05 from '@/assets/sample-hdri-background/sample-hdri-background-05.jpg'
import sample_background_06 from '@/assets/sample-hdri-background/sample-hdri-background-06.jpg'

const emit = defineEmits([
  'set-options',
  're-render-geometry',
  're-render-sphere',
  're-render-map',
  're-render-background',
  'change-is-rotate',
])

const props = defineProps({
  isRotate: Boolean,
})

const heightScale = ref(0.01)
const setHeightScale = (value) => {
  heightScale.value = value
}

const roughness = ref(0.3)
const setRoughness = (value) => {
  roughness.value = value
}

const normalScale = ref(1)
const setNormalScale = (value) => {
  normalScale.value = value
}

const scaleSize = ref(1)
const setScaleSize = (value) => {
  scaleSize.value = value
}

const envMapIntensity = ref(5)
const setEnvMapIntensity = (value) => {
  envMapIntensity.value = value
}

const isUseMap = ref(true)
const isUseDisplacementMap = ref(true)
const isUseNormalMap = ref(true)
const isUseRoughnessMap = ref(true)

const selectedBackground = ref('sample_background_01')
const backgroundOptions = [
  { name: 'sample_background_01', src: sample_background_01 },
  { name: 'sample_background_02', src: sample_background_02 },
  { name: 'sample_background_03', src: sample_background_03 },
  { name: 'sample_background_04', src: sample_background_04 },
  { name: 'sample_background_05', src: sample_background_05 },
  { name: 'sample_background_06', src: sample_background_06 },
]

const toneMappingExpose = ref(1)
const setToneMappingExpose = (value) => {
  toneMappingExpose.value = value
}

const hsl01 = ref(1)
const setHsl01 = (value) => {
  hsl01.value = value
}

const hsl02 = ref(1)
const setHsl02 = (value) => {
  hsl02.value = value
}

const hsl03 = ref(1)
const setHsl03 = (value) => {
  hsl03.value = value
}

watch(
  () => [
    hsl01.value,
    hsl02.value,
    hsl03.value,
    normalScale.value,
    scaleSize.value,
    heightScale.value,
    roughness.value,
    envMapIntensity.value,
    toneMappingExpose.value,
  ],
  (oldVal, newVal) => {
    const isDiff = (oldValue, newValue) => oldValue !== newValue

    const options = {}

    if (isDiff(oldVal[0], newVal[0]) || isDiff(oldVal[1], newVal[1]) || isDiff(oldVal[2], newVal[2])) {
      options.hsl01 = hsl01.value
      options.hsl02 = hsl02.value
      options.hsl03 = hsl03.value
    }

    if (isDiff(oldVal[3], newVal[3])) {
      options.normalScale = normalScale.value
    }

    if (isDiff(oldVal[4], newVal[4])) {
      options.scaleSize = scaleSize.value
    }

    if (isDiff(oldVal[5], newVal[5])) {
      options.heightScale = heightScale.value
    }

    if (isDiff(oldVal[6], newVal[6])) {
      options.roughness = roughness.value
    }

    if (isDiff(oldVal[7], newVal[7])) {
      options.envMapIntensity = envMapIntensity.value
    }

    if (isDiff(oldVal[8], newVal[8])) {
      options.toneMappingExpose = toneMappingExpose.value
    }

    emit('re-render-sphere', options)
  }
)

watch(
  () => [isUseMap.value, isUseDisplacementMap.value, isUseNormalMap.value, isUseRoughnessMap.value],
  () => {
    emit('re-render-map', {
      isUseMap: isUseMap.value,
      isUseDisplacementMap: isUseDisplacementMap.value,
      isUseNormalMap: isUseNormalMap.value,
      isUseRoughnessMap: isUseRoughnessMap.value,
    })
  }
)

watch(
  () => selectedBackground.value,
  () => {
    emit('re-render-background', backgroundOptions.find(({ name }) => name === selectedBackground.value).src)
  }
)

const selectedSegments = ref('64')
const segmentsOptions = [
  { name: '64', value: 64 },
  { name: '128', value: 128 },
  { name: '256', value: 256 },
  { name: '512', value: 512 },
  { name: '1024', value: 1024 },
]

watch(
  () => selectedSegments.value,
  () => {
    emit('re-render-geometry', { segments: segmentsOptions.find(({ name }) => name === selectedSegments.value).value })
  }
)

const isFolded = ref([false, false, false, false])
</script>

<style lang="scss" scoped>
.simple-sphere-controls {
  display: flex;
  flex-direction: column;
  row-gap: 40px;
  margin-bottom: 20px;

  .controls-header {
    display: flex;
    align-items: center;
    column-gap: 8px;
    margin-bottom: -32px;
  }

  .controls-label {
    font-weight: 500;
    font-size: 20px;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(5, 240px);
    column-gap: 10px;
    row-gap: 20px;

    > button {
      font-size: 16px;
      border: 1px solid black;
      cursor: pointer;
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
}
</style>
