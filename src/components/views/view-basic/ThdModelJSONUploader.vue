<template>
  <div class="thd-model-json-uploader">
    <h2>3d modeling file uploader</h2>

    <div class="input-wrapper">
      <span>3D Modeling File</span>
      <input type="file" @change="handleFileChange" />
    </div>

    <span class="description">
      Upload the json file among the results published by the
      <a href="https://threejs.org/editor/">threejs editor.</a>
    </span>
  </div>
</template>

<script setup>
const emit = defineEmits(['set-thd-model-json'])

const handleFileChange = (e) => {
  const reader = new FileReader()

  reader.onload = (e) => {
    emit('set-thd-model-json', JSON.parse(e.target.result))
  }

  reader.readAsText(e.target.files[0])
}
</script>

<style lang="scss" scoped>
.thd-model-json-uploader {
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;

  .input-wrapper {
    margin-bottom: 8px;

    span {
      margin-right: 20px;
    }
  }
}
</style>
