<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="header-container">
      <div class="logo-container">
        <div class="header">LUCENT</div>
        <p class="small">Generate how-to articles from your code</p>
      </div>

      <nav class="nav-container">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/repositories" class="nav-link">Repositories</RouterLink>
        <RouterLink to="/articles" class="nav-link">Articles</RouterLink>
      </nav>
    </header>

    <main class="main-container">
      <RouterView />
    </main>

    <footer class="footer-container">
      <p class="small">© 2025 Lucent - A developer tool for automatic documentation</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@import "./assets/Main.scss";

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 $paddingMed 0;
  border-bottom: 2px solid #eee;
  margin-bottom: $paddingMed;
}

.logo-container {
  display: flex;
  flex-direction: column;
}

.nav-container {
  display: flex;
  gap: $paddingMed;
}

.nav-link {
  position: relative;
  padding-bottom: 4px;
}

.nav-link.router-link-active {
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: black;
}

.main-container {
  flex: 1;
}

.footer-container {
  margin-top: $paddingLg;
  padding-top: $padding;
  border-top: 2px solid #eee;
  text-align: center;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: $padding;
  }

  .nav-container {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
