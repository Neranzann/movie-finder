"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, AlertCircle, CheckCircle, Database, Lightbulb } from "lucide-react"
import MovieCard from "./movie-card"
import { searchMoviesAdvanced, getPopularMovies } from "@/lib/api"
import type { Movie } from "@/types/movie"

export default function MovieSearch() {
  const [description, setDescription] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false) // Tracks if a search has been attempted
  const [apiConfigured, setApiConfigured] = useState(false)

  // Check API key status on component mount
  useEffect(() => {
    const checkApiKeyStatus = async () => {
      try {
        // Attempt a small API call (e.g., popular movies) to verify the key
        // We don't set movies here, just check if the API call succeeds
        await getPopularMovies()
        setApiConfigured(true)
        console.log("[App Init] TMDb API key verified.")
      } catch (e: any) {
        console.error("[App Init] API key check failed:", e.message)
        setApiConfigured(false)
        setError("TMDb API key is not configured or invalid. Please check lib/api.ts.")
      }
    }
    checkApiKeyStatus()
  }, [])

  const handleSearch = async () => {
    if (!description.trim()) {
      setError("Please enter a movie description")
      return
    }

    setLoading(true)
    setError(null) // Clear previous errors
    setHasSearched(true) // Indicate that a search has been attempted

    try {
      console.log("[Search Handler] Calling searchMoviesAdvanced with:", description.trim())
      const results = await searchMoviesAdvanced(description.trim())
      console.log("[Search Handler] SearchMoviesAdvanced returned:", results.length, "movies.")
      setMovies(results)

      if (results.length === 0) {
        setError(
          "No movies found matching your description. Try using different keywords, character names, or plot details.",
        )
        // Attempt to load popular movies as a fallback if the search yields no results
        try {
          console.log("[Search Handler] Attempting to load popular movies as fallback due to no search results.")
          const popular = await getPopularMovies()
          if (popular.length > 0) {
            setMovies(popular.slice(0, 6)) // Show some popular movies
            setError((prev) =>
              prev ? prev + " Displaying popular movies instead." : "Displaying popular movies as fallback.",
            )
          }
        } catch (popErr) {
          console.error("[Search Handler] Failed to load popular movies fallback:", popErr)
        }
      }
    } catch (err: any) {
      console.error("[Search Handler] Error during search:", err)
      // Display specific error messages based on the error type
      if (err.message.includes("API key")) {
        setError("TMDb API key is not configured or invalid. Please check lib/api.ts.")
        setApiConfigured(false) // Update API status
      } else {
        setError("Search failed. Please check your internet connection and try again.")
      }
      // Always attempt to load popular movies as a fallback if the search fails
      try {
        console.log("[Search Handler] Attempting to load popular movies as fallback due to search error.")
        const popular = await getPopularMovies()
        if (popular.length > 0) {
          setMovies(popular.slice(0, 6)) // Show some popular movies
          setError((prev) =>
            prev ? prev + " Displaying popular movies instead." : "Displaying popular movies as fallback.",
          )
        }
      } catch (popErr) {
        console.error("[Search Handler] Failed to load popular movies fallback:", popErr)
      }
    } finally {
      setLoading(false)
      console.log("[Search Handler] Search process completed.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSearch()
    }
  }

  const tryExample = (example: string) => {
    setDescription(example)
    setError(null)
    setMovies([]) // Clear previous results when trying a new example
    setHasSearched(false) // Reset search state for new example
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* API Status Indicator */}
      <div
        className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${apiConfigured ? "bg-green-900/20 border border-green-500/30" : "bg-red-900/20 border border-red-500/30"}`}
      >
        {apiConfigured ? (
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        )}
        <div className={apiConfigured ? "text-green-300" : "text-red-300"}>
          <p className="font-medium mb-1">
            {apiConfigured ? "✅ Full Database Access Enabled" : "⚠️ API Key Configuration Required"}
          </p>
          <p className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {apiConfigured
              ? "Connected to TMDb database with 1M+ movies from around the world."
              : "Please ensure your TMDb API key is correctly set in lib/api.ts to enable full search functionality. (Current key: 1fc707a99c5f083d08d614ca30622702)"}
          </p>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-slate-700/50 shadow-2xl">
        <div className="space-y-4">
          <Textarea
            placeholder="Describe any movie from the complete database...

Examples that work great:
• 'A ship hits an iceberg and sinks' → Titanic
• 'Boy wizard goes to magic school' → Harry Potter
• 'Toys come alive when owner leaves' → Toy Story
• 'Dreams within dreams' → Inception
• 'Blue aliens on planet Pandora' → Avatar
• 'Clown fish gets lost in ocean' → Finding Nemo
• 'Time travel using a car' → Back to the Future
• 'Mafia family in New York' → The Godfather
• 'Robot cleans up Earth alone' → WALL-E
• 'Dinosaurs in a theme park' → Jurassic Park

The more specific you are, the better the results!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[180px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 resize-none text-base focus:border-blue-500 focus:ring-blue-500/20"
            disabled={loading}
          />

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Button
              onClick={handleSearch}
              disabled={loading || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-11 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching 1M+ Movies...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Complete Database
                </>
              )}
            </Button>

            <p className="text-sm text-slate-400">
              Press <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd/Ctrl + Enter</kbd> to search
            </p>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Try these examples:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "ship hits iceberg and sinks",
            "boy wizard with glasses",
            "toys come alive at night",
            "blue aliens on Pandora",
            "dreams within dreams",
            "robot cleans up Earth",
            "dinosaurs in theme park",
            "mafia family New York",
            "time travel DeLorean car",
            "clown fish lost ocean",
          ].map((example) => (
            <button
              key={example}
              onClick={() => tryExample(example)}
              className="text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-slate-500 transition-colors text-slate-300 hover:text-white text-sm"
              disabled={loading}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched || movies.length > 0 ? ( // Show results if searched or if movies are loaded (e.g., fallback)
        <div>
          {movies.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {hasSearched
                    ? `Found ${movies.length} matching movie${movies.length !== 1 ? "s" : ""}`
                    : "Popular Movies (Fallback)"}
                </h2>
                <p className="text-slate-400 text-sm">Ranked by relevance</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </>
          ) : (
            !error && ( // Only show "No movies found" if there's no specific error message
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Try the example searches above or describe the movie with different keywords.
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        // Initial state before any search or fallback
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to find your movie?</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Enter a description, keywords, or plot details above to start your search.
          </p>
        </div>
      )}
    </div>
  )
}
