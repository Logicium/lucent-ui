<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const repositoryId = route.params.id
const repository = ref(null)
const commits = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')

// Fetch repository and commits from the API
const fetchRepositoryAndCommits = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    // Fetch repository details
    const repoResponse = await fetch(`${backendUrl}/repositories/${repositoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository details')
    }

    repository.value = await repoResponse.json()

    // Fetch commits for this repository
    const commitsResponse = await fetch(`${backendUrl}/commits/repository/${repositoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!commitsResponse.ok) {
      throw new Error('Failed to fetch commits')
    }

    commits.value = await commitsResponse.json()
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while fetching data'
  } finally {
    isLoading.value = false
  }
}

// Navigate to commit detail page
const viewCommit = (id) => {
  router.push(`/commit/${id}`)
}

// Filter commits based on search query
const filteredCommits = computed(() => {
  if (!searchQuery.value) return commits.value

  const query = searchQuery.value.toLowerCase()
  return commits.value.filter(commit =>
    commit.message.toLowerCase().includes(query) ||
    (commit.authorName && commit.authorName.toLowerCase().includes(query))
  )
})

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Go back to repositories list
const goBack = () => {
  router.push('/repositories')
}

onMounted(() => {
  fetchRepositoryAndCommits()
})
</script>

<template>
  <div class="repository-detail-container">
    <div class="back-link mb-1" @click="goBack">
      ← Back to repositories
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading repository data...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
      <div class="button ghost mt-1" @click="fetchRepositoryAndCommits">Try Again</div>
    </div>

    <template v-else>
      <div class="repository-header">
        <h1 class="header">{{ repository.name }}</h1>
        <p v-if="repository.description" class="mb-1">{{ repository.description }}</p>
        <a :href="repository.url" target="_blank" class="repository-link">View on GitHub</a>
      </div>

      <div class="commits-section mt-2">
        <h2 class="title">Commits</h2>
        <p>Select a commit to generate a how-to article based on its changes.</p>

        <div class="search-container mt-1 mb-2">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search commits..."
            class="search-input"
          />
        </div>

        <div v-if="filteredCommits.length === 0" class="empty-container">
          <p v-if="searchQuery">No commits found matching "{{ searchQuery }}"</p>
          <p v-else>No commits found for this repository.</p>
        </div>

        <div v-else class="commits-list">
          <div
            v-for="commit in filteredCommits"
            :key="commit.id"
            class="commit-card"
            @click="viewCommit(commit.id)"
          >
            <div class="commit-header">
              <h3 class="commit-title">{{ commit.message }}</h3>
              <span class="commit-date small">{{ formatDate(commit.date) }}</span>
            </div>

            <div class="commit-info">
              <span v-if="commit.authorName" class="commit-author small">
                By {{ commit.authorName }}
              </span>
              <span class="commit-sha small">{{ commit.sha.substring(0, 7) }}</span>
            </div>

            <div class="commit-footer">
              <span v-if="commit.articleGenerated" class="article-badge">Article Available</span>
              <div class="button empty">Select</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";

.repository-detail-container {
  display: flex;
  flex-direction: column;
}

.back-link {
  cursor: pointer;
  margin-bottom: $paddingMed;
}

.back-link:hover {
  text-decoration: underline;
}

.repository-header {
  margin-bottom: $paddingMed;
  padding-bottom: $paddingMed;
  border-bottom: 2px solid #eee;
}

.repository-link {
  text-decoration: underline;
}

.search-container {
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: $padding;
  border: 2px solid #eee;
  font-size: $fontNormal;
}

.commits-list {
  display: flex;
  flex-direction: column;
  gap: $padding;
}

.commit-card {
  border: 2px solid #eee;
  padding: $paddingMed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.commit-card:hover {
  border-color: black;
}

.commit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $padding;
}

.commit-title {
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.commit-date {
  color: #666;
}

.commit-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: $padding;
}

.commit-author, .commit-sha {
  color: #666;
}

.commit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $padding;
  padding-top: $padding;
  border-top: 2px solid #eee;
}

.article-badge {
  background-color: black;
  color: white;
  padding: 4px 8px;
  font-size: $fontSmall;
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
