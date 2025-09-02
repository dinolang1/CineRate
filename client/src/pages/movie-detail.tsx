import React from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar, Clock, Star, Play, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/ui/star-rating";
import { AuthModal } from "@/components/auth-modal";
import { authService } from "@/lib/auth";
import { Link } from "wouter";
import {
  fetchMovie,
  fetchUserReviewForMovie,
  createReview,
  updateReview,
  deleteReview,
  getMoviePosterUrl,
  getYouTubeEmbedUrl,
} from "@/lib/movies";
import { 
  convertRatingToStorage, 
  convertRatingFromStorage, 
  convertMovieRating, 
  formatRating 
} from "@/lib/ratings";

const reviewSchema = z.object({
  rating: z.number().min(1).max(50),
  reviewText: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function MovieDetail() {
  const [, params] = useRoute("/movie/:id");
  const movieId = params?.id;
  const [isEditing, setIsEditing] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authState, setAuthState] = React.useState(authService.getAuthState());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listen for auth changes
  React.useEffect(() => {
    const unsubscribe = authService.onAuthChange(() => {
      setAuthState(authService.getAuthState());
    });
    
    return unsubscribe;
  }, []);

  const { data: movie, isLoading: movieLoading, error: movieError } = useQuery({
    queryKey: ["/api/movies", movieId],
    queryFn: () => fetchMovie(movieId!),
    enabled: !!movieId,
  });

  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ["/api/reviews/user", authState.user?.id, "movie", movieId],
    queryFn: () => fetchUserReviewForMovie(authState.user!.id, movieId!),
    enabled: !!authState.user?.id && !!movieId,
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || convertRatingToStorage(1),
      reviewText: existingReview?.reviewText || "",
    },
  });

  React.useEffect(() => {
    if (existingReview) {
      form.reset({
        rating: existingReview.rating,
        reviewText: existingReview.reviewText || "",
      });
    }
  }, [existingReview, form]);

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Your review has been saved successfully.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/reviews/user", authState.user?.id, "movie", movieId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/movies", movieId] 
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, updates }: { reviewId: string; updates: Partial<ReviewFormData> }) =>
      updateReview(reviewId, updates),
    onSuccess: () => {
      toast({
        title: "Review updated!",
        description: "Your review has been updated successfully.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/reviews/user", authState.user?.id, "movie", movieId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/movies", movieId] 
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/reviews/user", authState.user?.id, "movie", movieId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/movies", movieId] 
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = async (data: ReviewFormData) => {
    if (!authState.user || !movieId) return;

    if (existingReview) {
      updateReviewMutation.mutate({
        reviewId: existingReview.id,
        updates: data,
      });
    } else {
      createReviewMutation.mutate({
        userId: authState.user.id,
        movieId,
        ...data,
      });
    }
  };

  const handleDeleteReview = () => {
    if (!existingReview) return;
    
    if (confirm("Are you sure you want to delete your review?")) {
      deleteReviewMutation.mutate(existingReview.id);
    }
  };

  if (!movieId) {
    return <div>Movie not found</div>;
  }

  if (movieError) {
    return (
      <div className="bg-gray-900 flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Movie not found</h2>
          <p className="text-gray-400 mb-4">The movie you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go back to movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (movieLoading) {
    return (
      <div className="bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8 bg-gray-800" />
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full bg-gray-800" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4 bg-gray-800" />
              <Skeleton className="h-4 w-1/2 bg-gray-800" />
              <Skeleton className="h-24 w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="bg-gray-900">
      {/* Hero Section with Movie Background */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-30"
          style={{ backgroundImage: `url(${getMoviePosterUrl(movie.posterPath)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 pt-20">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-gray-300 hover:text-yellow-400 bg-transparent hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
          
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <img
                src={getMoviePosterUrl(movie.posterPath)}
                alt={`${movie.title} poster`}
                className="w-full rounded-xl shadow-2xl border-2 border-yellow-400/30"
              />
            </div>
            
            {/* Movie Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>{movie.year}</span>
                  </div>
                  {movie.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                      <span>{movie.duration}min</span>
                    </div>
                  )}
                  {movie.averageRating && movie.averageRating > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-xl font-semibold text-yellow-400">{convertMovieRating(movie.averageRating).toFixed(1)}</span>
                        <span className="text-sm text-gray-400">/5</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        ({movie.reviewCount} review{movie.reviewCount !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <Badge
                      key={genre}
                      className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Plot</h3>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Cast</h3>
                <p className="text-gray-300">{movie.cast.join(", ")}</p>
              </div>

              {movie.director && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Director</h3>
                  <p className="text-gray-300">{movie.director}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trailer & Review Section */}
      <div className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trailer */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <Play className="w-6 h-6 mr-2 text-yellow-400" />
                Trailer
              </h3>
              {movie.trailerUrl ? (
                <div className="trailer-container">
                  <iframe
                    src={getYouTubeEmbedUrl(movie.trailerUrl)}
                    title={`${movie.title} Trailer`}
                    allowFullScreen
                    className="rounded-xl"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">No trailer available</p>
                </div>
              )}
            </div>
            
            {/* Rating & Review Form */}
            <div>
              {authState.isAuthenticated ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Rate This Movie</span>
                      {existingReview && !isEditing && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDeleteReview}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {existingReview && !isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-medium">{convertRatingFromStorage(existingReview.rating).toFixed(1)}</span>
                            <span className="text-sm text-gray-400">/5</span>
                          </div>
                        </div>
                        {existingReview.reviewText && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Your Review:</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {existingReview.reviewText}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-6">
                        <div>
                          <label className="block text-gray-300 mb-2">Your Rating</label>
                          <div className="flex items-center space-x-4">
                            <StarRating
                              rating={convertRatingFromStorage(form.watch("rating"))}
                              onRatingChange={(rating) => form.setValue("rating", convertRatingToStorage(rating))}
                              allowHalfStars={true}
                              showValue={true}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Your Review (Optional)</label>
                          <Textarea
                            placeholder="Share your thoughts about this movie..."
                            rows={4}
                            className="bg-gray-700 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-400"
                            {...form.register("reviewText")}
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                            className="bg-yellow-400 text-black hover:bg-yellow-500"
                          >
                            {createReviewMutation.isPending || updateReviewMutation.isPending
                              ? "Submitting..."
                              : existingReview
                              ? "Update Review"
                              : "Submit Review"
                            }
                          </Button>
                          {existingReview && isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-400 mb-4">Sign in to rate and review this movie</p>
                    <Button 
                      onClick={() => setAuthModalOpen(true)}
                      className="bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Auth state će se automatski ažurirati putem listener-a
        }}
      />
    </div>
  );
}
