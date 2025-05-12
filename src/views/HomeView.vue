<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="big header">Transform Your Code Changes Into Clear Documentation</h1>
      <p class="mt-1 mb-2">Lucent automatically generates how-to articles from your GitHub commits, making it easier for developers to understand and document code changes.</p>
      <div class="button" @click="navigateToLogin">Sign in with GitHub</div>
    </div>

    <div class="features-section mt-2">
      <div class="feature">
        <h2 class="title">Seamless GitHub Integration</h2>
        <p>Connect your GitHub account, select a repository, and let Lucent analyze your commits.</p>
      </div>

      <div class="feature">
        <h2 class="title">AI-Powered Documentation</h2>
        <p>Lucent uses Google Gemini API to generate comprehensive how-to articles based on your code changes.</p>
      </div>

      <div class="feature">
        <h2 class="title">Edit and Refine</h2>
        <p>Review, edit, and refine the generated articles before sharing them with your team.</p>
      </div>
    </div>

    <div class="cta-section mt-2">
      <h2 class="title">Ready to simplify your documentation process?</h2>
      <div class="button ghost mt-1" @click="navigateToLogin">Get Started Now</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";

.home-container {
  display: flex;
  flex-direction: column;
  gap: $paddingLg;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 800px;
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $paddingMed;
}

.feature {
  padding: $padding;
  border: 1px solid #eee;
}

.cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $paddingLg 0;
}
</style>
