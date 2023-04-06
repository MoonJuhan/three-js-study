<template>
  <div class="app-slider">
    <span v-if="label" class="label">{{ label }} : {{ currentValue }}</span>

    <div class="slider-bar" ref="refSliderBar">
      <div class="progress-bar" :style="progressBarStyle" />
      <div class="slider-circle" :style="sliderCircleStyle" @mousedown="onMouseDownSilderCircle()" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update-current-value'])

const props = defineProps({
  currentValue: {
    type: Number,
    default: 0,
  },
  fixedPoint: {
    type: Number,
    default: 0,
  },
  minNumber: {
    type: Number,
    default: 0,
  },
  maxNumber: {
    type: Number,
    default: 100,
  },
  label: {
    type: String,
    default: '',
  },
})

const progressBarStyle = computed(() => {
  const percent = (props.currentValue - props.minNumber) / (props.maxNumber - props.minNumber)

  return {
    width: `${percent * 100}%`,
  }
})

const sliderCircleStyle = computed(() => {
  const percent = (props.currentValue - props.minNumber) / (props.maxNumber - props.minNumber)

  return {
    left: `${percent * 100}%`,
  }
})

const isMouseDowned = ref(false)

const onMouseDownSilderCircle = (e) => {
  isMouseDowned.value = true
}

const refSliderBar = ref()

const onMouseMove = (e) => {
  if (isMouseDowned.value) {
    const { minNumber, maxNumber, fixedPoint } = props
    const { left, right } = refSliderBar.value.getBoundingClientRect()

    const percent = (e.clientX - left) / (right - left)
    const value = parseFloat((minNumber + (maxNumber - minNumber) * percent).toFixed(fixedPoint))
    console.log(value)

    if (value <= minNumber) {
      emit('update-current-value', minNumber)
      return
    }

    if (value >= maxNumber) {
      emit('update-current-value', maxNumber)
      return
    }

    emit('update-current-value', value)
  }
}

const onMouseUp = () => {
  if (isMouseDowned.value) {
    isMouseDowned.value = false
  }
}

watch(
  () => isMouseDowned.value,
  () => {
    if (isMouseDowned.value) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    } else {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }
)
</script>

<style lang="scss" scoped>
.app-slider {
  width: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  padding: 0 8px;

  .label {
    margin: 0 -8px;
    font-size: 18px;
  }

  .slider-bar {
    position: relative;
    width: 100%;
    height: 5px;
    background-color: #ccc;
    border-radius: 5px;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #000;
    border-radius: 5px;
  }

  .slider-circle {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    background-color: #ccc;
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>
