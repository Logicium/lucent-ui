<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Article } from '../types/interfaces'

const router = useRouter()
const articles = ref<Article[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')

// Fetch all articles (commits with generated articles)
const fetchArticles = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/commits`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }

    articles.value = await response.json()
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred while fetching articles'
  } finally {
    isLoading.value = false
  }
}

// Navigate to article detail page (which is the commit detail page)
const viewArticle = (id: string): void => {
  router.push(`/commit/${id}`)
}

// Filter articles based on search query
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value

  const query = searchQuery.value.toLowerCase()
  return articles.value.filter(article =>
    article.message.toLowerCase().includes(query) ||
    (article.repository && article.repository.name.toLowerCase().includes(query))
  )
})

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="articles-container">
    <div class="articles-header">
      <h1 class="header">Your Generated Articles</h1>
      <p>View and edit articles generated from your commits.</p>

      <div class="search-container mt-1 mb-2">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search articles..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading articles...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
      <div class="button ghost mt-1" @click="fetchArticles">Try Again</div>
    </div>

    <div v-else-if="filteredArticles.length === 0" class="empty-container">
      <p v-if="searchQuery">No articles found matching "{{ searchQuery }}"</p>
      <p v-else>No articles have been generated yet.</p>
      <p class="mt-1">Go to a repository, select a commit, and generate an article to get started.</p>
      <div class="button ghost mt-1" @click="router.push('/repositories')">Browse Repositories</div>
    </div>

    <div v-else class="articles-list">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card"
        @click="viewArticle(article.id)"
      >
        <div class="article-header">
          <h2 class="article-title">{{ article.message }}</h2>
          <span class="article-date small" v-if="article.updatedAt">{{ formatDate(article.updatedAt) }}</span>
        </div>

        <div class="article-meta">
          <span class="repository-name small" v-if="article.repository">
            Repository: {{ article.repository.name }}
          </span>
          <span class="commit-sha small" v-if="article.sha">
            Commit: {{ article.sha.substring(0, 7) }}
          </span>
        </div>

        <div class="article-preview" v-if="article.articleContent">
          <p>{{ article.articleContent.substring(0, 150) }}{{ article.articleContent.length > 150 ? '...' : '' }}</p>
        </div>

        <div class="article-footer">
          <div class="button empty">View & Edit</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";

.articles-container {
  display: flex;
  flex-direction: column;
}

.articles-header {
  margin-bottom: $paddingMed;
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

.articles-list {
  display: flex;
  flex-direction: column;
  gap: $paddingMed;
}

.article-card {
  border: 2px solid #eee;
  padding: $paddingMed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  border-color: black;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $padding;
}

.article-title {
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.article-date {
  color: #666;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: $padding;
  color: #666;
}

.article-preview {
  margin: $padding 0;
  color: #333;
}

.article-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: $padding;
  padding-top: $padding;
  border-top: 2px solid #eee;
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
