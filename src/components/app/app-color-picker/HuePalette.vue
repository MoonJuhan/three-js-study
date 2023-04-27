<template>
  <div class="hue-palette" @mousedown="pickHue">
    <div ref="refHueSpectrum" class="hue-spectrum" />
    <div class="hue-selector" :style="hueSelectorStyle" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['set-hsl'])

const props = defineProps({
  hue: {
    type: Number,
    required: true,
  },
})

watch(
  () => props.hue,
  () => {
    if (localHue.value !== props.hue) {
      localHue.value = props.hue
    }
  }
)

const localHue = ref(0)

const refHueSpectrum = ref()
const hueSpectrumRect = ref()
const pickHue = ({ clientX }) => {
  hueSpectrumRect.value = refHueSpectrum.value.getBoundingClientRect()
  moveHueSelector({ clientX })

  window.addEventListener('mousemove', moveHueSelector)
  window.addEventListener('mouseup', stopPickingHue)
}

const moveHueSelector = ({ clientX }) => {
  const { left, right } = hueSpectrumRect.value

  if (clientX <= left) {
    localHue.value = 0
  } else if (clientX >= right) {
    localHue.value = 360
  } else {
    localHue.value = Math.round(((clientX - left) / (right - left)) * 360)
  }
  emit('set-hsl', { h: localHue.value })
}

const stopPickingHue = () => {
  window.removeEventListener('mousemove', moveHueSelector)
  window.removeEventListener('mouseup', stopPickingHue)
}

const hueSelectorStyle = computed(() => {
  const width = hueSpectrumRect.value?.width || refHueSpectrum.value?.getBoundingClientRect().width

  return {
    left: `${(localHue.value / 360) * width}px`,
    backgroundColor: `hsl(${localHue.value}, 100%, 50%)`,
  }
})
</script>

<style lang="scss" scoped>
.hue-palette {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px 10px;

  .hue-spectrum {
    border-radius: 2px;
    width: 100%;
    height: 10px;
    background-image: linear-gradient(to right, red, yellow, green, cyan, blue, violet, red);
  }

  .hue-selector {
    transform: translateX(calc(-50% + 10px));
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: transparent;
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
}
</style>
