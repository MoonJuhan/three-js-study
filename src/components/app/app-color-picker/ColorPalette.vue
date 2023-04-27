This is palette dom and style. how calcurate selector position with saturation and lightness?

<template>
  <div class="color-palette" @mousedown="pickColor">
    <div ref="refColorSpectrum" class="color-spectrum" :style="{ backgroundColor: `hsl(${hue}deg, 100%, 50%)` }" />
    <div class="color-spectrum white-background" />
    <div class="color-spectrum black-background" />
    <div class="color-selector" :style="colorSelectorStyle" />
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
  saturation: {
    type: Number,
    required: true,
  },
  lightness: {
    type: Number,
    required: true,
  },
})

watch(
  () => [props.saturation, props.lightness],
  () => {
    if (localSaturation.value !== props.saturation) {
      localSaturation.value = props.saturation
    }

    if (localLightness.value !== props.lightness) {
      localLightness.value = props.lightness
    }
  }
)

const localSaturation = ref(100)
const localLightness = ref(50)

const refColorSpectrum = ref()
const colorSpectrumRect = ref()
const pickColor = ({ clientX, clientY }) => {
  colorSpectrumRect.value = refColorSpectrum.value.getBoundingClientRect()
  moveColorSelector({ clientX, clientY })

  window.addEventListener('mousemove', moveColorSelector)
  window.addEventListener('mouseup', stopPickingColor)
}

const moveColorSelector = ({ clientX, clientY }) => {
  const { left, right, top, bottom } = colorSpectrumRect.value

  const newSaturation = Math.round(((clientX - left) / (right - left)) * 100)

  if (newSaturation <= 0) {
    localSaturation.value = 0
  } else if (newSaturation >= 100) {
    localSaturation.value = 100
  } else {
    localSaturation.value = newSaturation
  }

  const maxLightness = Math.round(100 - localSaturation.value / 2)
  const newLightness = Math.round((1 - (clientY - top) / (bottom - top)) * (100 - localSaturation.value / 2))

  if (newLightness <= 0) {
    localLightness.value = 0
  } else if (newLightness >= maxLightness) {
    localLightness.value = maxLightness
  } else {
    localLightness.value = newLightness
  }

  emit('set-hsl', { s: localSaturation.value, l: localLightness.value })
}

const stopPickingColor = () => {
  window.removeEventListener('mousemove', moveColorSelector)
  window.removeEventListener('mouseup', stopPickingColor)
}

const colorSelectorStyle = computed(() => {
  const { width, height } = colorSpectrumRect.value || refColorSpectrum.value?.getBoundingClientRect() || {}

  const backgroundColor = `hsl(${props.hue}, ${localSaturation.value}%, ${localLightness.value}%)`

  const getTop = (newTop, maxTop) => {
    if (newTop <= 0) {
      return 0
    } else if (newTop >= maxTop) {
      return maxTop
    } else {
      return newTop
    }
  }

  if (localLightness.value <= 50) {
    return {
      left: `${(localSaturation.value / 100) * width}px`,
      top: `${getTop(
        ((100 - localLightness.value - localSaturation.value / 2) / (100 - localSaturation.value / 2)) * height,
        height
      )}px`,
      backgroundColor,
    }
  }

  return {
    left: `${(localSaturation.value / 100) * width}px`,
    top: `${getTop(
      ((100 - localLightness.value - localSaturation.value / 2) / (100 - localSaturation.value / 2)) * height,
      height
    )}px`,
    backgroundColor,
  }
})
</script>

<style lang="scss" scoped>
.color-palette {
  aspect-ratio: 4 / 3;
  position: relative;
  display: flex;
  align-items: center;
  padding: 2px 10px;

  .color-spectrum {
    position: absolute;
    width: calc(100% - 14px);
    height: calc(100% - 4px);

    &.black-background {
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, black 100%);
    }

    &.white-background {
      background: linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%);
    }
  }

  .color-selector {
    transform: translate(calc(-50% + 10px), calc(-50% + 2px));
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
