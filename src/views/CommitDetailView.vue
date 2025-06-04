<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VueMarkdownRender from 'vue-markdown-render'
import type { Commit, Repository } from '../types/interfaces'

const router = useRouter()
const route = useRoute()
const commitId = route.params.id
const commit = ref<Commit | null>(null)
const isLoading = ref(true)
const isGenerating = ref(false)
const errorMessage = ref('')
const editedArticle = ref('')
const viewMode = ref('splitview') // 'editor', 'markdown', or 'splitview'
const selectedDocType = ref('article') // Default to step-by-step article

// Document type options
const docTypeOptions = [
  { value: 'article', label: 'Step-by-Step Article' },
  { value: 'api', label: 'API Documentation' },
  { value: 'faq', label: 'FAQs' },
  { value: 'slides', label: 'Presentation Slides' },
  { value: 'video', label: 'Video Script' },
  { value: 'release', label: 'Release Notes' },
  { value: 'review', label: 'Code Review' },
  { value: 'roast', label: 'Roast (Experimental)' }
]

// Fetch commit details from the API
const fetchCommitDetails = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL
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
    if (commit.value && commit.value.articleGenerated && commit.value.articleContent) {
      editedArticle.value = commit.value.articleContent
    }
  } catch (error:any) {
    errorMessage.value = error.message || 'An error occurred while fetching commit details'
  } finally {
    isLoading.value = false
  }
}

// Generate article for this commit
const generateArticle = async (forceRegenerate: boolean = false): Promise<void> => {
  isGenerating.value = true
  errorMessage.value = ''

  try {
    const backendUrl = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${backendUrl}/commits/${commitId}/generate-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docType: selectedDocType.value,
        forceRegenerate: forceRegenerate
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate article')
    }

    const updatedCommit = await response.json()
    commit.value = updatedCommit
    editedArticle.value = updatedCommit.articleContent
  } catch (error:any) {
    errorMessage.value = error.message || 'An error occurred while generating the article'
  } finally {
    isGenerating.value = false
  }
}

// Save edited article
const saveArticle = async (): Promise<void> => {
  try {
    const backendUrl = import.meta.env.VITE_API_URL
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
  } catch (error:any) {
    errorMessage.value = error.message || 'An error occurred while saving the article'
  }
}

// Format date for display
const formatDate = (dateString: string): string => {
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
const goBack = (): void => {
  if (commit.value && commit.value.repository && commit.value.repository.id) {
    router.push(`/repository/${commit.value.repository.id}`)
  } else {
    router.push('/repositories')
  }
}

// Get the label for the selected document type
const getDocTypeLabel = (): string => {
  const option = docTypeOptions.find(opt => opt.value === selectedDocType.value)
  return option ? option.label : 'Document'
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

    <template v-else-if="commit">
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
          <h2 class="title">{{ getDocTypeLabel() }}</h2>

          <div class="article-actions">
            <div v-if="commit && !commit.articleGenerated" class="doc-type-selector">
              <label for="docType">Document Type:</label>
              <select id="docType" v-model="selectedDocType" class="doc-type-select">
                <option v-for="option in docTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <div
                class="button"
                @click="generateArticle(false)"
                :class="{ 'disabled': isGenerating }"
              >
                <span v-if="isGenerating">Generating...</span>
                <span v-else>Generate {{ getDocTypeLabel() }}</span>
              </div>
            </div>

            <div v-else-if="commit && commit.articleGenerated" class="doc-actions">
              <div class="button-group">
                <div class="doc-type-selector">
                  <select id="docType" v-model="selectedDocType" class="doc-type-select">
                    <option v-for="option in docTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="button" @click="generateArticle(true)" :class="{ 'disabled': isGenerating }">
                  <span v-if="isGenerating">Regenerating...</span>
                  <span v-else>Regenerate</span>
                </div>
                <div class="button" @click="saveArticle">Save Changes</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="commit && !commit.articleGenerated && !isGenerating" class="article-placeholder">
          <p>No {{ getDocTypeLabel().toLowerCase() }} has been generated for this commit yet.</p>
          <p>Click the "Generate {{ getDocTypeLabel() }}" button to create documentation based on this commit's changes.</p>
        </div>

        <div v-else-if="isGenerating" class="article-placeholder">
          <p>Generating {{ getDocTypeLabel().toLowerCase() }}...</p>
          <p>This may take a moment as we analyze the code changes and create comprehensive documentation.</p>
        </div>

        <div v-else-if="commit">
          <div class="view-mode-buttons">
            <div class="view-mode-button" :class="{ active: viewMode === 'editor' }" @click="viewMode = 'editor'">
              Editor
            </div>
            <div class="view-mode-button" :class="{ active: viewMode === 'markdown' }" @click="viewMode = 'markdown'">
              Markdown
            </div>
            <div class="view-mode-button" :class="{ active: viewMode === 'splitview' }" @click="viewMode = 'splitview'">
              Split View
            </div>
          </div>

          <div class="article-editor" :class="viewMode">
            <textarea
              v-model="editedArticle"
              class="article-textarea"
              placeholder="Article content will appear here"
              v-show="viewMode === 'editor' || viewMode === 'splitview'"
            ></textarea>

            <div
              class="article-preview"
              v-show="viewMode === 'markdown' || viewMode === 'splitview'"
              style="width: 100%; box-sizing: border-box;"
            >
              <div class="markdown-preview">
                <VueMarkdownRender :source="editedArticle" />
              </div>
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
  border-bottom: 2px solid #eee;
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

.article-actions {
  display: flex;
  flex-direction: column;
  gap: $padding;
}

.doc-type-selector {
  display: flex;
  align-items: center;
  gap: $padding;
}

.doc-type-select {
  padding: 8px;
  border: 2px solid #eee;
  height: 45px;
  font-size: $fontNormal;
}

.doc-actions {
  display: flex;
  flex-direction: column;
  gap: $padding;
}

.button-group {
  display: flex;
  gap: $padding;
}

.article-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  border: 2px solid #eee;
  padding: $paddingMed;
}

.article-editor {
  display: grid;
  gap: $paddingMed;
}

.article-editor.splitview {
  grid-template-columns: 50% 50%;
  width: 100%;
}

.article-editor.editor,
.article-editor.markdown {
  grid-template-columns: 1fr;
}

.view-mode-buttons {
  display: flex;
  gap: $padding;
  margin-bottom: $paddingMed;
}

.view-mode-button {
  cursor: pointer;
  padding: $padding/2 $padding;
  background-color: #f5f5f5;
  font-size: $fontSmall;
  transition: background-color 0.2s, border-color 0.2s;
  border: 2px solid transparent;
}

.view-mode-button:hover {
  background-color: #e0e0e0;
}

.view-mode-button.active {
  background-color: #e0e0e0;
  border-color: #ccc;
  font-weight: 500;
}

.article-textarea {
  width: 100%;
  min-height: 500px;
  padding: $padding;
  border: 2px solid #eee;
  font-family: monospace;
  font-size: $fontNormal;
  resize: vertical;
  box-sizing: border-box;
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
  border: 2px solid #eee;
  padding: $padding;
  min-height: 500px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
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
  .article-editor.splitview {
    grid-template-columns: 1fr;
  }

  .view-mode-buttons {
    flex-wrap: wrap;
  }
}
</style>
