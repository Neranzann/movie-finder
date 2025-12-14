import Image from "next/image"
import { Calendar, Star, Users, TrendingUp } from "lucide-react"
import type { Movie } from "@/types/movie"

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500&text=No+Poster"

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-[1.02] shadow-xl">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={`${movie.title} poster`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>
        )}

        {/* Popularity Indicator */}
        {movie.popularity > 100 && (
          <div className="absolute top-3 left-3 bg-green-600/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">Popular</span>
          </div>
        )}

        {/* Vote Count */}
        {movie.vote_count > 1000 && (
          <div className="absolute bottom-3 left-3 bg-blue-600/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">{Math.round(movie.vote_count / 1000)}k</span>
          </div>
        )}
      </div>

      {/* Movie Information */}
      <div className="p-5">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight">{movie.title}</h3>

        {/* Release Year */}
        <div className="flex items-center gap-1 mb-3 text-slate-300">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{releaseYear}</span>
        </div>

        {/* Movie Overview */}
        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {movie.overview || "No description available for this movie."}
        </p>

        {/* Additional Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>TMDb ID: {movie.id}</span>
          </div>
          {movie.original_language !== "en" && (
            <div className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
              {movie.original_language.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
