import MovieSearch from "@/components/movie-search"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">🎬 Movie Finder</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Find any movie from just a description, plot detail, or character mention. Our advanced AI-powered search
            scans over 1 million movies from around the world.
          </p>
          {/* API status indicator will be handled by MovieSearch component */}
        </header>

        <MovieSearch />

        <footer className="text-center mt-16 text-slate-500">
          <p>
            Powered by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-300 underline"
            >
              The Movie Database (TMDb)
            </a>{" "}
            - The world's most comprehensive movie database
          </p>
        </footer>
      </div>
    </div>
  )
}
