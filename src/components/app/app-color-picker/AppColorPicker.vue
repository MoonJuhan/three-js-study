<template>
  <div class="app-color-picker">
    {{ modelValue }}

    <ColorPalette :hue="hue" :saturation="saturation" :lightness="lightness" @set-hsl="setHSL" />
    <HuePalette :hue="hue" @set-hsl="setHSL" />

    <div class="color-controls">
      <div class="color-inputs">
        <div class="color-input">
          <span>Hue</span>
          <input type="number" v-model="hue" min="0" max="360" @input="inInputHSL = true" />
        </div>

        <div class="color-input">
          <span>Saturation</span>
          <input type="number" v-model="saturation" min="0" max="100" @input="inInputHSL = true" />
        </div>

        <div class="color-input">
          <span>Lightness</span>
          <input type="number" v-model="lightness" min="0" max="100" @input="inInputHSL = true" />
        </div>
      </div>
      <div class="color-preview" :style="{ backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` }"></div>

      <div class="color-inputs">
        <div class="color-input">
          <span>Red</span>
          <input type="number" v-model="red" min="0" max="255" @input="inInputRGB = true" />
        </div>

        <div class="color-input">
          <span>Green</span>
          <input type="number" v-model="green" min="0" max="255" @input="inInputRGB = true" />
        </div>

        <div class="color-input">
          <span>Blue</span>
          <input type="number" v-model="blue" min="0" max="255" @input="inInputRGB = true" />
        </div>
      </div>
      <div class="color-preview" :style="{ backgroundColor: color }"></div>

      <div class="color-inputs">
        <div class="color-input">
          <span>Hex</span>
          <input type="text" v-model="hex" @input="isInputHex = true" />
        </div>
      </div>
      <div class="color-preview" :style="{ backgroundColor: `#${hex}` }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import HuePalette from './HuePalette.vue'
import ColorPalette from './ColorPalette.vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const getPropsHex = () => {
  const modelHex = props.modelValue.replaceAll('#', '')

  if (modelHex !== hex.value) {
    hex.value = modelHex
    updateColor('hex')
  }
}

watch(
  () => props.modelValue,
  () => getPropsHex
)
onMounted(getPropsHex)

const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)

const setHSL = ({ h, s, l }) => {
  if (typeof h === 'number') {
    hue.value = h
  }

  if (typeof s === 'number') {
    saturation.value = s
  }

  if (typeof l === 'number') {
    lightness.value = l
  }

  updateColor('hsl')
}

const red = ref(255)
const green = ref(0)
const blue = ref(0)

const hex = ref('FF0000')

const color = computed(() => `rgb(${red.value}, ${green.value}, ${blue.value})`)

const updateColor = (type) => {
  if (type === 'hsl') {
    const { r, g, b } = HSLToRGB(hue.value, saturation.value, lightness.value)
    red.value = r
    green.value = g
    blue.value = b

    hex.value = RGBToHex(red.value, green.value, blue.value)
  }

  if (type === 'rgb') {
    const { h, s, l } = RGBToHSL(red.value, green.value, blue.value)
    hue.value = h
    saturation.value = s
    lightness.value = l

    hex.value = RGBToHex(red.value, green.value, blue.value)
  }

  if (type === 'hex') {
    const { r, g, b } = hexToRGB(hex.value)
    red.value = r
    green.value = g
    blue.value = b

    const { h, s, l } = RGBToHSL(red.value, green.value, blue.value)
    hue.value = h
    saturation.value = s
    lightness.value = l
  }

  emit('update:modelValue', `#${hex.value}`)
}

const HSLToRGB = (h, s, l) => {
  const newLightness = l / 100

  const k = (n) => (n + h / 30) % 12

  const a = (s / 100) * Math.min(newLightness, 1 - newLightness)

  const calculateRGBValue = (n) =>
    Math.round((newLightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255)

  return { r: calculateRGBValue(0), g: calculateRGBValue(8), b: calculateRGBValue(4) }
}

const hexToRGB = (hex) => {
  let h = hex

  if (![6, 3].includes(h.length)) {
    return {
      r: red.value,
      g: green.value,
      b: blue.value,
    }
  }

  if (h.length === 3) {
    h = [...h].map((x) => x + x).join('')
  }

  h = parseInt(h, 16)

  return { r: h >>> 16, g: (h & 0x00ff00) >>> 8, b: (h & 0x0000ff) >>> 0 }
}

const RGBToHex = (r, g, b) => ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0')

const RGBToHSL = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (diff !== 0) {
    s = diff / (1 - Math.abs(2 * l - 1))

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / diff + 2) * 60
        break
      case b:
        h = ((r - g) / diff + 4) * 60
        break
    }

    h = Math.round(h)
    s = Math.round(s * 100)
    l = Math.round(l * 100)
  } else {
    l = Math.round(r * 100)
  }

  return { h, s, l }
}

const inInputHSL = ref(false)
watch(
  () => [hue.value, saturation.value, lightness.value],
  (newHSL, oldHSL) => {
    if (!inInputHSL.value) return

    inInputHSL.value = false
    const regex = /^[0-9]+$/i

    if (
      newHSL.map((value) => regex.test(value)).includes(false) ||
      hue.value > 360 ||
      saturation.value > 100 ||
      lightness.value > 100
    ) {
      hue.value = oldHSL[0]
      saturation.value = oldHSL[1]
      lightness.value = oldHSL[2]
      return
    }

    updateColor('hsl')
  }
)

const inInputRGB = ref(false)
watch(
  () => [red.value, green.value, blue.value],
  (newRGB, oldRGB) => {
    if (!inInputRGB.value) return

    inInputRGB.value = false
    const regex = /^[0-9]+$/i

    if (
      newRGB.map((value) => regex.test(value)).includes(false) ||
      red.value > 255 ||
      green.value > 255 ||
      blue.value > 255
    ) {
      red.value = oldRGB[0]
      green.value = oldRGB[1]
      blue.value = oldRGB[2]
      return
    }

    updateColor('rgb')
  }
)

const isInputHex = ref(false)
watch(
  () => hex.value,
  (newHex, oldHex) => {
    if (!isInputHex.value) return

    isInputHex.value = false
    const regex = /^[0-9A-F]+$/i

    if (newHex.length > 6 || !regex.test(newHex)) {
      hex.value = oldHex
      return
    }

    if ([6, 3].includes(newHex.length)) {
      updateColor('hex')
    }
  }
)
</script>

<style lang="scss" scoped>
.app-color-picker {
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  .color-controls {
    display: flex;
    flex-direction: column;
  }

  .color-inputs {
    display: flex;
    column-gap: 2px;

    .color-input {
      display: flex;
      flex-direction: column;
      row-gap: 4px;

      > span {
        font-size: 12px;
      }

      > input {
        width: 100%;
      }
    }
  }

  .color-preview {
    width: 3rem;
    height: 3rem;
    border: 1px solid black;
    margin-top: 0.5rem;
  }
}
</style>
