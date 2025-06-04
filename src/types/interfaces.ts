// Define interface for Repository
export interface Repository {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

// Define interface for Commit
export interface Commit {
  id: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  date: string;
  sha: string;
  articleGenerated: boolean;
  articleContent?: string;
  repository?: Repository;
  updatedAt?: string;
}

// Define interface for Article (which is essentially a Commit with an article)
export interface Article extends Commit {
  articleContent: string;
}
