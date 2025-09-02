import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovieCard } from "@/components/movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMovies, GENRES, type Genre, type MovieFilters } from "@/lib/movies";

export default function Home() {
  const [filters, setFilters] = React.useState<MovieFilters>({
    genre: "all",
    search: "",
    sortBy: "newest",
  });
  const [searchInput, setSearchInput] = React.useState("");

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ["/api/movies", filters],
    queryFn: () => fetchMovies(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput.trim() }));
  };

  const handleGenreChange = (genre: string) => {
    setFilters(prev => ({ ...prev, genre: genre as Genre }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as MovieFilters["sortBy"] }));
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilters(prev => ({ ...prev, search: "" }));
  };

  if (error) {
    return (
      <div className="bg-gray-900 flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">Failed to load movies. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-yellow-400" />
                Discover Movies
              </h1>
              <p className="text-gray-400">Rate and review your favorite films</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-400 pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">
              Search
            </Button>
            {filters.search && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearSearch}
                className="border-gray-600 text-white bg-transparent hover:bg-transparent hover:border-yellow-400 hover:text-yellow-400"
              >
                Clear
              </Button>
            )}
          </form>

          {/* Genre and Sort Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filters.genre} onValueChange={handleGenreChange}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre} className="text-white hover:bg-gray-700">
                      {genre === "all" ? "All Genres" : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="newest" className="text-white hover:bg-gray-700">Newest First</SelectItem>
                <SelectItem value="oldest" className="text-white hover:bg-gray-700">Oldest First</SelectItem>
                <SelectItem value="rating" className="text-white hover:bg-gray-700">Highest Rated</SelectItem>
                <SelectItem value="title" className="text-white hover:bg-gray-700">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.genre !== "all") && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Filters:</span>
              {filters.search && (
                <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.genre !== "all" && (
                <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                  Genre: {filters.genre}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-80 w-full bg-gray-800" />
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-3 w-1/2 bg-gray-800" />
              </div>
            ))}
          </div>
        ) : movies && movies.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-400">
              {movies.length} movie{movies.length !== 1 ? "s" : ""} found
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No movies found</h3>
              <p>Try adjusting your search criteria or browse all movies.</p>
            </div>
            {(filters.search || filters.genre !== "all") && (
              <Button
                onClick={() => {
                  setFilters({ genre: "all", search: "", sortBy: "newest" });
                  setSearchInput("");
                }}
                variant="outline"
                className="mt-4 border-gray-600 text-white bg-transparent hover:bg-transparent hover:border-yellow-400 hover:text-yellow-400"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
