<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const repositories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')

// Fetch repositories from the API
const fetchRepositories = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/repositories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }

    const data = await response.json()
    repositories.value = data
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while fetching repositories'
  } finally {
    isLoading.value = false
  }
}

// Navigate to repository detail page
const viewRepository = (id) => {
  router.push(`/repository/${id}`)
}

// Filter repositories based on search query
const filteredRepositories = computed(() => {
  if (!searchQuery.value) return repositories.value

  const query = searchQuery.value.toLowerCase()
  return repositories.value.filter(repo =>
    repo.name.toLowerCase().includes(query) ||
    (repo.description && repo.description.toLowerCase().includes(query))
  )
})

onMounted(() => {
  fetchRepositories()
})
</script>

<template>
  <div class="repositories-container">
    <div class="repositories-header">
      <h1 class="header">Your GitHub Repositories</h1>
      <p>Select a repository to view its commits and generate documentation.</p>

      <div class="search-container mt-1 mb-2">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search repositories..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading repositories...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
      <div class="button ghost mt-1" @click="fetchRepositories">Try Again</div>
    </div>

    <div v-else-if="filteredRepositories.length === 0" class="empty-container">
      <p v-if="searchQuery">No repositories found matching "{{ searchQuery }}"</p>
      <p v-else>No repositories found. Connect a GitHub account with repositories.</p>
    </div>

    <div v-else class="repositories-grid">
      <div
        v-for="repo in filteredRepositories"
        :key="repo.id"
        class="repository-card"
        @click="viewRepository(repo.id)"
      >
        <h2 class="title">{{ repo.name }}</h2>
        <p v-if="repo.description" class="description">{{ repo.description }}</p>
        <p v-else class="description italic">No description</p>

        <div class="repository-footer">
          <span class="small">View commits</span>
          <div class="button empty">Select</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";
.repositories-container {
  display: flex;
  flex-direction: column;
}

.repositories-header {
  margin-bottom: $paddingMed;
}

.search-container {
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: $padding;
  border: 1px solid #eee;
  font-size: $fontNormal;
}

.repositories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $paddingMed;
}

.repository-card {
  border: 1px solid #eee;
  padding: $paddingMed;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.repository-card:hover {
  border-color: black;
}

.description {
  margin: $padding 0;
  flex-grow: 1;
}

.repository-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $padding;
  padding-top: $padding;
  border-top: 1px solid #eee;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}
</style>
