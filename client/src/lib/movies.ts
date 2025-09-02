import { Movie, Review, InsertReview } from "@shared/schema";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export const GENRES = [
  "all",
  "Action",
  "Adventure", 
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Horror",
  "Comedy",
  "Crime",
  "Sport"
] as const;

export type Genre = typeof GENRES[number];

export interface MovieFilters {
  genre: Genre;
  search?: string;
  sortBy: "newest" | "oldest" | "rating" | "title";
}

export const fetchMovies = async (filters?: MovieFilters): Promise<Movie[]> => {
  const params = new URLSearchParams();
  
  if (filters?.genre && filters.genre !== "all") {
    params.append("genre", filters.genre);
  }
  
  if (filters?.search) {
    params.append("search", filters.search);
  }

  const response = await fetch(`/api/movies?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch movies");
  }

  let movies = await response.json();

  if (filters?.sortBy) {
    movies.sort((a: Movie, b: Movie) => {
      switch (filters.sortBy) {
        case "newest":
          return b.year - a.year;
        case "oldest":
          return a.year - b.year;
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  return movies;
};

export const fetchMovie = async (id: string): Promise<Movie> => {
  const response = await fetch(`/api/movies/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch movie");
  }
  return response.json();
};

export const fetchUserReviews = async (userId: string): Promise<Review[]> => {
  const response = await fetch(`/api/reviews/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user reviews");
  }
  return response.json();
};

export const fetchMovieReviews = async (movieId: string): Promise<Review[]> => {
  const response = await fetch(`/api/reviews/movie/${movieId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch movie reviews");
  }
  return response.json();
};

export const fetchUserReviewForMovie = async (userId: string, movieId: string): Promise<Review | null> => {
  const response = await fetch(`/api/reviews/user/${userId}/movie/${movieId}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch user review");
  }
  return response.json();
};

export const createReview = async (reviewData: InsertReview): Promise<Review> => {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create review");
  }

  return response.json();
};

export const updateReview = async (reviewId: string, updates: { rating?: number; reviewText?: string }): Promise<Review> => {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update review");
  }

  return response.json();
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete review");
  }
};

export const getMoviePosterUrl = (posterPath: string): string => {
  if (posterPath.startsWith("http")) {
    return posterPath;
  }
  return `${TMDB_IMAGE_BASE}${posterPath}`;
};

export const formatRating = (rating: number): string => {
  return (rating / 20).toFixed(1);
};

export const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes("embed/")) {
    return url;
  }
  
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return url;
};
