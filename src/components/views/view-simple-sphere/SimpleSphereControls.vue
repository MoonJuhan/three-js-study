<template>
  <div class="simple-sphere-controls">
    <span class="controls-label">Rotate Animation Controls</span>
    <div class="controls">
      <button @click="emit('change-is-rotate')">Rotate {{ !isRotate ? 'On' : 'Off' }}</button>
    </div>

    <span class="controls-label">Map Controls</span>
    <div class="controls">
      <AppSlider
        :currentValue="heightScale"
        @update-current-value="setHeightScale"
        :minNumber="0"
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
        :currentValue="normalScaleVector01"
        @update-current-value="setNormalScaleVector01"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="1"
        label="normalScaleVector01"
      />
      <AppSlider
        :currentValue="normalScaleVector02"
        @update-current-value="setNormalScaleVector02"
        :minNumber="0"
        :maxNumber="1"
        :fixedPoint="1"
        label="normalScaleVector02"
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

    <span class="controls-label">Background Controls</span>
    <div class="controls">
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

const emit = defineEmits(['set-options', 're-render-sphere', 're-render-background', 'change-is-rotate'])

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

const normalScaleVector01 = ref(1)
const setNormalScaleVector01 = (value) => {
  normalScaleVector01.value = value
}

const normalScaleVector02 = ref(1)
const setNormalScaleVector02 = (value) => {
  normalScaleVector02.value = value
}

const scaleSize = ref(1)
const setScaleSize = (value) => {
  scaleSize.value = value
}

const envMapIntensity = ref(5)
const setEnvMapIntensity = (value) => {
  envMapIntensity.value = value
}

const selectedBackground = ref('sample_background_01')
const backgroundOptions = [
  { name: 'sample_background_01', src: sample_background_01 },
  { name: 'sample_background_02', src: sample_background_02 },
  { name: 'sample_background_03', src: sample_background_03 },
  { name: 'sample_background_04', src: sample_background_04 },
]

watch(
  () => [
    heightScale.value,
    roughness.value,
    normalScaleVector01.value,
    normalScaleVector02.value,
    scaleSize.value,
    envMapIntensity.value,
  ],
  () => {
    emit('re-render-sphere', {
      heightScale: heightScale.value,
      roughness: roughness.value,
      normalScaleVector01: normalScaleVector01.value,
      normalScaleVector02: normalScaleVector02.value,
      scaleSize: scaleSize.value,
      envMapIntensity: envMapIntensity.value,
    })
  }
)

watch(
  () => selectedBackground.value,
  () => {
    emit('re-render-background', backgroundOptions.find(({ name }) => name === selectedBackground.value).src)
  }
)
</script>

<style lang="scss" scoped>
.simple-sphere-controls {
  display: flex;
  flex-direction: column;
  row-gap: 40px;

  .controls-label {
    font-weight: 500;
    font-size: 20px;
    margin-bottom: -32px;
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
