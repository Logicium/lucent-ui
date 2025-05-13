<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

// Function to handle GitHub login
const loginWithGithub = () => {
  isLoading.value = true
  errorMessage.value = ''

  // In a real implementation, we would redirect to the backend's GitHub auth endpoint
  // For now, we'll simulate this by redirecting to a mock URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  window.location.href = `${backendUrl}/auth/github/login`
}

// Check if we're returning from GitHub OAuth flow
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  if (token) {
    // Store the token and redirect to repositories page
    localStorage.setItem('auth_token', token)
    router.push('/repositories')
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="header">Sign in to Lucent</h1>
      <p class="mb-2">Connect with GitHub to start generating documentation from your code.</p>

      <div v-if="errorMessage" class="error-message mb-1">
        {{ errorMessage }}
      </div>

      <div class="button" @click="loginWithGithub" :class="{ 'disabled': isLoading }">
        <span v-if="isLoading">Connecting...</span>
        <span v-else>Sign in with GitHub</span>
      </div>

      <p class="small mt-2">
        By signing in, you agree to allow Lucent to access your GitHub repositories.
        We only use this access to generate documentation from your code.
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.login-card {
  max-width: 500px;
  padding: $paddingLg;
  border: 2px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-message {
  color: #d32f2f;
  padding: $padding;
  background-color: #ffebee;
  width: 100%;
}

.button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
