// Enhanced Movie interface with additional fields for better search
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  original_language: string
  original_title: string
  video: boolean
  // Additional field for relevance scoring
  relevanceScore?: number
}

// TMDb API search response structure
export interface TMDbSearchResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

// Enhanced error interface
export interface ApiError {
  success: boolean
  status_code: number
  status_message: string
}

// Search configuration interface
export interface SearchConfig {
  includeAdult: boolean
  language: string
  maxResults: number
  minRelevanceScore: number
}
