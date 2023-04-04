<template>
  <div class="view-home">
    <h1>ViewHome</h1>
    <ul>
      <li v-for="link in links" :key="link">
        <RouterLink :to="link" v-html="link" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
const router = useRouter()

const links = computed(() => router.options.routes.map(({ path }) => path).filter((link) => !link.includes(':')))
</script>
