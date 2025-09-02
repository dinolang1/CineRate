import React from "react";
import { Star, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Movie } from "@shared/schema";
import { getMoviePosterUrl } from "@/lib/movies";
import { convertMovieRating } from "@/lib/ratings";
import { Link } from "wouter";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <Card className="movie-poster-hover cursor-pointer bg-gray-800 border-gray-700 overflow-hidden shadow-lg group">
        <div className="relative">
          <img
            src={getMoviePosterUrl(movie.posterPath)}
            alt={`${movie.title} poster`}
            className="w-full h-80 object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-1">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{movie.year}</span>
            </div>
            
            {movie.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{movie.duration}min</span>
              </div>
            )}
            
            {movie.averageRating && movie.averageRating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-medium">{convertMovieRating(movie.averageRating).toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-gray-700 text-yellow-400 text-xs px-2 py-1"
              >
                {genre}
              </Badge>
            ))}
            {movie.genres.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-gray-700 text-gray-400 text-xs px-2 py-1"
              >
                +{movie.genres.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
