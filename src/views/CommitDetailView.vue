<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VueMarkdownRender from 'vue-markdown-render'

const router = useRouter()
const route = useRoute()
const commitId = route.params.id
const commit = ref(null)
const isLoading = ref(true)
const isGenerating = ref(false)
const errorMessage = ref('')
const editedArticle = ref('')
const showRenderedMarkdown = ref(true)

// Fetch commit details from the API
const fetchCommitDetails = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/commits/${commitId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch commit details')
    }

    commit.value = await response.json()

    // If article is already generated, set it as the edited article
    if (commit.value.articleGenerated && commit.value.articleContent) {
      editedArticle.value = commit.value.articleContent
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while fetching commit details'
  } finally {
    isLoading.value = false
  }
}

// Generate article for this commit
const generateArticle = async () => {
  isGenerating.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/commits/${commitId}/generate-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to generate article')
    }

    const updatedCommit = await response.json()
    commit.value = updatedCommit
    editedArticle.value = updatedCommit.articleContent
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while generating the article'
  } finally {
    isGenerating.value = false
  }
}

// Save edited article
const saveArticle = async () => {
  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/commits/${commitId}/update-article`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        articleContent: editedArticle.value
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save article')
    }

    // Show success message or update UI
    alert('Article saved successfully')
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while saving the article'
  }
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Go back to repository detail page
const goBack = () => {
  if (commit.value && commit.value.repository) {
    router.push(`/repository/${commit.value.repository.id}`)
  } else {
    router.push('/repositories')
  }
}

onMounted(() => {
  fetchCommitDetails()
})
</script>

<template>
  <div class="commit-detail-container">
    <div class="back-link mb-1" @click="goBack">
      ← Back to repository
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading commit details...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
      <div class="button ghost mt-1" @click="fetchCommitDetails">Try Again</div>
    </div>

    <template v-else>
      <div class="commit-header">
        <h1 class="header">{{ commit.message }}</h1>
        <div class="commit-meta">
          <p v-if="commit.authorName" class="small">
            By {{ commit.authorName }} <span v-if="commit.authorEmail">({{ commit.authorEmail }})</span>
          </p>
          <p class="small">{{ formatDate(commit.date) }}</p>
          <p class="small">Commit: {{ commit.sha }}</p>
        </div>
      </div>

      <div class="article-section mt-2">
        <div class="article-header">
          <h2 class="title">How-to Article</h2>

          <div v-if="!commit.articleGenerated" class="article-actions">
            <div
              class="button"
              @click="generateArticle"
              :class="{ 'disabled': isGenerating }"
            >
              <span v-if="isGenerating">Generating...</span>
              <span v-else>Generate Article</span>
            </div>
          </div>

          <div v-else class="article-actions">
            <div class="button" @click="saveArticle">Save Changes</div>
          </div>
        </div>

        <div v-if="!commit.articleGenerated && !isGenerating" class="article-placeholder">
          <p>No article has been generated for this commit yet.</p>
          <p>Click the "Generate Article" button to create a how-to article based on this commit's changes.</p>
        </div>

        <div v-else-if="isGenerating" class="article-placeholder">
          <p>Generating article...</p>
          <p>This may take a moment as we analyze the code changes and create a comprehensive guide.</p>
        </div>

        <div v-else class="article-editor">
          <textarea
            v-model="editedArticle"
            class="article-textarea"
            placeholder="Article content will appear here"
          ></textarea>

          <div class="article-preview">
            <div class="preview-header">
              <h3 class="title">Preview</h3>
              <div class="toggle-button" @click="showRenderedMarkdown = !showRenderedMarkdown">
                {{ showRenderedMarkdown ? 'Show Raw' : 'Show Rendered' }}
              </div>
            </div>
            <div class="markdown-preview">
              <pre v-if="!showRenderedMarkdown">{{ editedArticle }}</pre>
<!--              <VueMarkdownRender v-else :text="editedArticle" />-->
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import "../assets/Main.scss";

.commit-detail-container {
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

.commit-header {
  margin-bottom: $paddingMed;
  padding-bottom: $paddingMed;
  border-bottom: 1px solid #eee;
}

.commit-meta {
  margin-top: $padding;
  color: #666;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $paddingMed;
}

.article-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  border: 1px solid #eee;
  padding: $paddingMed;
}

.article-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $paddingMed;
}

.article-textarea {
  width: 100%;
  min-height: 500px;
  padding: $padding;
  border: 1px solid #eee;
  font-family: monospace;
  font-size: $fontNormal;
  resize: vertical;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $padding;
}

.toggle-button {
  cursor: pointer;
  padding: $padding/2 $padding;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: $fontSmall;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #e0e0e0;
}

.markdown-preview {
  border: 1px solid #eee;
  padding: $padding;
  min-height: 500px;
  overflow-y: auto;
}

.button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

@media (max-width: 768px) {
  .article-editor {
    grid-template-columns: 1fr;
  }
}
</style>
