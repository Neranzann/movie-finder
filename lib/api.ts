import type { Movie, TMDbSearchResponse } from "@/types/movie"

// TMDb API Configuration
const TMDB_API_KEY = "1fc707a99c5f083d08d614ca30622702"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

/**
 * Advanced movie search that uses multiple strategies to find movies
 * from the complete TMDb database (which includes most IMDb movies).
 * Includes robust error handling and logging.
 */
export async function searchMoviesAdvanced(query: string): Promise<Movie[]> {
  console.log(`[API] Initiating advanced search for query: "${query}"`)

  // Validate API key before making any requests
  if (!TMDB_API_KEY || TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
    console.error("[API Error] TMDb API key is not configured.")
    throw new Error("TMDb API key is not configured. Please add your key to lib/api.ts.")
  }

  try {
    const allResults: Movie[] = []

    // Strategy 1: Direct search with original query
    console.log("[API Strategy] Running direct search with full query.")
    const directResults = await searchMoviesDirect(query)
    allResults.push(...directResults)

    // Strategy 2: Search with individual meaningful keywords
    console.log("[API Strategy] Running keyword search.")
    const keywords = extractMeaningfulKeywords(query)
    for (const keyword of keywords) {
      if (keyword.length > 2) {
        const keywordResults = await searchMoviesDirect(keyword)
        allResults.push(...keywordResults)
      }
    }

    // Strategy 3: Search with theme-based keywords (e.g., "ship sinks" -> "titanic")
    console.log("[API Strategy] Running theme-based search.")
    const themeKeywords = getThemeBasedKeywords(query)
    for (const theme of themeKeywords) {
      const themeResults = await searchMoviesDirect(theme)
      allResults.push(...themeResults)
    }

    // Strategy 4: Search with synonyms and related terms
    console.log("[API Strategy] Running synonym search.")
    const synonyms = getSynonyms(query)
    for (const synonym of synonyms) {
      const synonymResults = await searchMoviesDirect(synonym)
      allResults.push(...synonymResults)
    }

    // Remove duplicates and rank by relevance
    const uniqueMovies = removeDuplicateMovies(allResults)
    const rankedMovies = rankMoviesByRelevance(uniqueMovies, query)

    console.log(`[API Result] Found ${rankedMovies.length} unique and ranked results.`)
    return rankedMovies.slice(0, 20) // Return top 20 most relevant movies
  } catch (error) {
    console.error("[API Error] Advanced search failed:", error)
    throw error // Re-throw to be handled by the component
  }
}

/**
 * Performs a direct search against the TMDb API and filters for English original language.
 */
async function searchMoviesDirect(query: string): Promise<Movie[]> {
  try {
    const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`)
    searchUrl.searchParams.append("api_key", TMDB_API_KEY)
    searchUrl.searchParams.append("query", query)
    searchUrl.searchParams.append("include_adult", "false")
    searchUrl.searchParams.append("language", "en-US") // Request results in English
    searchUrl.searchParams.append("page", "1") // Fetch first page of results

    console.log(`[API Call] Fetching: ${searchUrl.toString()}`)
    const response = await fetch(searchUrl.toString())
    console.log(`[API Response] Status: ${response.status}, OK: ${response.ok}`)

    if (!response.ok) {
      const errorBody = await response.text() // Get raw error body for more info
      console.error(`[API Error] Response not OK: ${response.status} ${response.statusText}. Body: ${errorBody}`)
      if (response.status === 401) {
        throw new Error("Invalid TMDb API key. Please check your key in lib/api.ts.")
      }
      throw new Error(`TMDb API error: ${response.status} ${response.statusText} - ${errorBody.substring(0, 100)}...`)
    }

    const data: TMDbSearchResponse = await response.json()
    console.log(`[API Data] Received ${data.results.length} results from direct search for "${query}".`)

    // Filter out movies that lack essential display data (title, overview)
    // AND filter to only include movies with original_language 'en' for "Hollywood" focus
    const filteredMovies = data.results.filter(
      (movie) => movie.title && movie.overview && movie.original_language === "en",
    )
    console.log(`[API Filter] After 'en' language filter, ${filteredMovies.length} movies remain.`)
    return filteredMovies
  } catch (error) {
    console.error(`[API Error] Direct search failed for query "${query}":`, error)
    return [] // Return empty array on direct search failure
  }
}

/**
 * Extracts meaningful keywords from a given description by removing common stop words.
 */
function extractMeaningfulKeywords(description: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "about",
    "movie",
    "film",
    "where",
    "when",
    "who",
    "what",
    "how",
    "there",
    "their",
    "they",
    "them",
    "this",
    "that",
    "these",
    "those",
    "he",
    "she",
    "it",
    "his",
    "her",
    "him",
    "from",
    "up",
    "out",
    "down",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "scene",
    "plot",
    "character",
    "description",
    "story",
    "about",
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "if",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "like",
    "of",
    "off",
    "on",
    "out",
    "over",
    "through",
    "to",
    "up",
    "with",
    "while",
    "what",
    "where",
    "when",
    "who",
    "whom",
    "whose",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
  ])

  return description
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter((word) => word.length > 2 && !stopWords.has(word)) // Filter out short words and stop words
    .slice(0, 10) // Limit to top 10 keywords for efficiency
}

/**
 * Maps common descriptive phrases to specific movie-related keywords for better search hits.
 */
function getThemeBasedKeywords(description: string): string[] {
  const desc = description.toLowerCase()
  const themes: string[] = []

  const themeMap: Record<string, string[]> = {
    // Disaster/Survival
    ship: ["titanic", "boat", "ocean", "sea"],
    iceberg: ["titanic"],
    sinking: ["titanic"],
    survival: ["cast away", "the revenant", "gravity"],

    // Fantasy/Magic
    wizard: ["harry potter", "magic", "hogwarts", "fantasy"],
    magic: ["harry potter", "lord of the rings", "doctor strange"],
    wand: ["harry potter"],
    ring: ["lord of the rings"],
    dragon: ["how to train your dragon", "game of thrones"],

    // Sci-Fi/Future
    space: ["star wars", "star trek", "interstellar", "gravity", "alien", "apollo 13"],
    alien: ["alien", "et", "independence day", "men in black", "arrival"],
    robot: ["wall-e", "terminator", "transformers", "i robot", "ex machina"],
    future: ["back to the future", "blade runner", "minority report"],
    "time travel": ["back to the future", "looper", "about time", "interstellar"],
    dystopian: ["blade runner", "matrix", "hunger games"],

    // Animation/Family
    toys: ["toy story", "animated", "pixar"],
    animals: ["lion king", "finding nemo", "zootopia", "kung fu panda"],
    princess: ["frozen", "beauty and the beast", "cinderella", "moana"],
    disney: ["frozen", "lion king", "moana"],

    // Action/Adventure
    superhero: ["batman", "superman", "spider-man", "avengers", "marvel", "dc"],
    spy: ["james bond", "mission impossible", "bourne identity"],
    heist: ["oceans eleven", "inception", "heat"],
    car: ["fast and furious", "mad max", "baby driver"],

    // Crime/Thriller
    mafia: ["godfather", "goodfellas", "scarface", "irishman"],
    gangster: ["godfather", "pulp fiction", "casino"],
    detective: ["sherlock holmes", "zodiac", "seven"],
    prison: ["shawshank redemption", "green mile", "escape from alcatraz"],

    // Drama/Romance
    love: ["titanic", "notebook", "la la land", "casablanca"],
    romance: ["notebook", "pride and prejudice", "when harry met sally"],
    historical: ["gladiator", "braveheart", "schindler's list"],

    // Horror/Thriller
    scary: ["exorcist", "halloween", "it", "conjuring", "hereditary"],
    ghost: ["ghostbusters", "sixth sense", "conjuring"],
    zombie: ["dawn of the dead", "zombieland", "world war z"],

    // Comedy
    funny: ["dumb and dumber", "anchorman", "hangover", "step brothers"],
    comedy: ["anchorman", "superbad", "bridesmaids"],

    // Specific plot points
    "dreams within dreams": ["inception"],
    "clown fish lost": ["finding nemo"],
    "robot cleans earth": ["wall-e"],
    "dinosaurs theme park": ["jurassic park"],
    "time travel car": ["back to the future"],
    "mafia family new york": ["the godfather"],
    "boy wizard": ["harry potter"],
    "ship sinks": ["titanic"],
    "toys alive": ["toy story"],
    "blue aliens": ["avatar"],
    "prison escape": ["shawshank redemption"],
  }

  // Check for theme matches
  Object.entries(themeMap).forEach(([key, keywords]) => {
    if (desc.includes(key)) {
      themes.push(...keywords)
    }
  })

  return [...new Set(themes)] // Return unique theme keywords
}

/**
 * Provides a list of synonyms for common words to broaden search queries.
 */
function getSynonyms(query: string): string[] {
  const synonyms: string[] = []
  const queryLower = query.toLowerCase()

  const synonymMap: Record<string, string[]> = {
    ship: ["vessel", "boat", "cruise"],
    scary: ["horror", "frightening", "terrifying"],
    funny: ["comedy", "hilarious", "amusing"],
    love: ["romance", "romantic", "relationship"],
    fight: ["battle", "combat", "war"],
    car: ["automobile", "vehicle", "auto"],
    house: ["home", "mansion", "building"],
    school: ["university", "college", "academy"],
    child: ["kid", "boy", "girl", "youngster"],
    man: ["guy", "male", "gentleman"],
    woman: ["lady", "female", "girl"],
    old: ["elderly", "aged", "ancient"],
    young: ["youth", "teenage", "juvenile"],
    big: ["large", "huge", "giant", "massive"],
    small: ["little", "tiny", "mini", "petite"],
    lost: ["missing", "misplaced"],
    journey: ["adventure", "quest", "expedition"],
    planet: ["world", "orb"],
    alien: ["extraterrestrial", "et"],
    robot: ["android", "cyborg"],
    magic: ["sorcery", "enchantment"],
    wizard: ["sorcerer", "magician"],
    king: ["monarch", "ruler"],
    queen: ["monarch", "ruler"],
    prince: ["royal"],
    princess: ["royal"],
    detective: ["investigator", "sleuth"],
    crime: ["felony", "offense"],
    war: ["conflict", "battle"],
    hero: ["protagonist", "champion"],
    villain: ["antagonist", "evil"],
  }

  Object.entries(synonymMap).forEach(([word, syns]) => {
    if (queryLower.includes(word)) {
      synonyms.push(...syns)
    }
  })

  return synonyms
}

/**
 * Removes duplicate movie entries based on their unique ID.
 */
function removeDuplicateMovies(movies: Movie[]): Movie[] {
  const seen = new Set<number>()
  return movies.filter((movie) => {
    if (seen.has(movie.id)) {
      return false
    }
    seen.add(movie.id)
    return true
  })
}

/**
 * Ranks movies by their relevance to the original search query.
 */
function rankMoviesByRelevance(movies: Movie[], originalQuery: string): Movie[] {
  const queryWords = originalQuery.toLowerCase().split(/\s+/)
  const originalQueryLower = originalQuery.toLowerCase()

  return movies
    .map((movie) => ({
      ...movie,
      relevanceScore: calculateRelevanceScore(movie, queryWords, originalQueryLower),
    }))
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
}

/**
 * Calculates a relevance score for a movie based on how well it matches the query.
 */
function calculateRelevanceScore(movie: Movie, queryWords: string[], originalQueryLower: string): number {
  let score = 0
  const title = movie.title.toLowerCase()
  const overview = movie.overview.toLowerCase()

  // Highest boost for exact title match
  if (title === originalQueryLower) {
    score += 200
  }

  // Strong boost if title contains the full query phrase
  if (title.includes(originalQueryLower)) {
    score += 100
  }

  // Very strong boost if overview contains the full query phrase (most important for descriptions)
  if (overview.includes(originalQueryLower)) {
    score += 150 // Increased weight for overview match
  }

  // Boost for individual word matches in title
  queryWords.forEach((word) => {
    if (word.length > 2) {
      if (title.includes(word)) {
        score += 30 // Increased weight
      }
      if (overview.includes(word)) {
        score += 25 // Increased weight
      }
    }
  })

  // Boost score based on popularity and average vote
  score += Math.log(movie.popularity + 1) * 3 // Increased popularity boost
  score += movie.vote_average * 3 // Increased rating boost

  // Slight boost for newer movies
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 0
  if (releaseYear > 2000) {
    score += (releaseYear - 2000) * 0.2 // Small boost per year
  }

  return score
}

/**
 * Fetches popular movies from TMDb as a general fallback or for initial display.
 * Filters for English original language.
 */
export async function getPopularMovies(): Promise<Movie[]> {
  console.log("[API Fallback] Attempting to fetch popular movies.")
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`)

    if (!response.ok) {
      console.error(`[API Error] Failed to fetch popular movies: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch popular movies: ${response.status}`)
    }

    const data: TMDbSearchResponse = await response.json()
    console.log(`[API Fallback] Found ${data.results.length} popular movies.`)
    // Filter for movies with at least a poster and overview, and original_language 'en'
    const filteredPopularMovies = data.results.filter(
      (movie) => movie.poster_path && movie.overview && movie.original_language === "en",
    )
    console.log(
      `[API Fallback Filter] After 'en' language filter, ${filteredPopularMovies.length} popular movies remain.`,
    )
    return filteredPopularMovies
  } catch (error) {
    console.error("[API Error] getPopularMovies failed:", error)
    return [] // Return an empty array if even popular movies fail
  }
}

/**
 * Get movie details by ID (not directly used in search, but good for future features)
 */
export async function getMovieDetails(movieId: number): Promise<Movie> {
  console.log(`[API Call] Fetching details for movie ID: ${movieId}`)
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`)

    if (!response.ok) {
      console.error(`[API Error] Failed to fetch movie details: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch movie details: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Data] Received details for movie ID: ${movieId}`)
    return data
  } catch (error) {
    console.error(`[API Error] getMovieDetails failed for ID ${movieId}:`, error)
    throw error
  }
}
