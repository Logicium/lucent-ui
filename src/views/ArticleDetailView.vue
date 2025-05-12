<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const articleId = route.params.id

// Redirect to the commit detail view, which handles article viewing/editing
onMounted(() => {
  router.replace(`/commit/${articleId}`)
})
</script>

<template>
  <div class="loading-container">
    <p>Redirecting to article...</p>
  </div>
</template>

<style scoped lang="scss">
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
