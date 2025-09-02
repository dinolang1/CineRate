import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, Star, Calendar, Edit2, Trash2, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { fetchUserReviews, fetchMovies, deleteReview, getMoviePosterUrl } from "@/lib/movies";
import { ProfileUpload } from "@/components/profile-upload";
import { Movie, Review } from "@shared/schema";
import { convertRatingFromStorage } from "@/lib/ratings";

export default function Profile() {
  const [reviewFilter, setReviewFilter] = React.useState<"all" | "recent" | "highest" | "lowest">("all");
  const [currentUser, setCurrentUser] = React.useState(authService.getAuthState().user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authState = authService.getAuthState();

  React.useEffect(() => {
    if (!authState.isAuthenticated) {
      window.location.href = "/";
    }
  }, [authState.isAuthenticated]);

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/reviews/user", authState.user?.id],
    queryFn: () => fetchUserReviews(authState.user!.id),
    enabled: !!authState.user?.id,
  });

  const { data: movies } = useQuery({
    queryKey: ["/api/movies"],
    queryFn: () => fetchMovies(),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user", authState.user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/";
  };

  if (!authState.user) {
    return null;
  }

  const getMovieForReview = (movieId: string): Movie | undefined => {
    return movies?.find(movie => movie.id === movieId);
  };

  const filteredReviews = React.useMemo(() => {
    if (!reviews) return [];

    let filtered = [...reviews];

    switch (reviewFilter) {
      case "recent":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return filtered;
  }, [reviews, reviewFilter]);

  const userStats = React.useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        reviewCount: 0,
        averageRating: 0,
        favoriteGenre: "N/A",
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + convertRatingFromStorage(review.rating), 0);
    const averageRating = totalRating / reviews.length;

    const genreCounts: Record<string, number> = {};
    reviews.forEach(review => {
      const movie = getMovieForReview(review.movieId);
      if (movie) {
        movie.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      reviewCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      favoriteGenre,
    };
  }, [reviews, movies]);

  return (
    <div className="bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-300 hover:text-yellow-400 bg-transparent hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <ProfileUpload 
                    currentImageUrl={currentUser?.profilePicture || undefined}
                    onImageUploaded={(imageUrl) => {
                      if (currentUser) {
                        const updatedUser = { 
                          ...currentUser, 
                          profilePicture: imageUrl 
                        };
                        authService.updateUser(updatedUser);
                        setCurrentUser(updatedUser);
                        toast({
                          title: "Profile Updated",
                          description: "Your profile picture has been updated!",
                        });
                      }
                    }}
                  />
                  <h2 className="text-xl font-semibold text-white mt-4">{currentUser?.username}</h2>
                  <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reviews Written:</span>
                    <span className="text-yellow-400 font-semibold">{userStats.reviewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Rating:</span>
                    <span className="text-yellow-400 font-semibold">
                      {userStats.averageRating > 0 ? `${userStats.averageRating}/5` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorite Genre:</span>
                    <span className="text-yellow-400 font-semibold">{userStats.favoriteGenre}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full mt-6"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* My Reviews */}
          <div className="md:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    My Reviews
                  </CardTitle>
                  <Select value={reviewFilter} onValueChange={(value: any) => setReviewFilter(value)}>
                    <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-600">All Reviews</SelectItem>
                      <SelectItem value="recent" className="text-white hover:bg-gray-600">Recent</SelectItem>
                      <SelectItem value="highest" className="text-white hover:bg-gray-600">Highest Rated</SelectItem>
                      <SelectItem value="lowest" className="text-white hover:bg-gray-600">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-4 p-4">
                        <Skeleton className="w-16 h-24 bg-gray-700" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3 bg-gray-700" />
                          <Skeleton className="h-3 w-1/4 bg-gray-700" />
                          <Skeleton className="h-16 w-full bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredReviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredReviews.map((review) => {
                      const movie = getMovieForReview(review.movieId);
                      if (!movie) return null;

                      return (
                        <div key={review.id} className="flex gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                          <Link href={`/movie/${movie.id}`}>
                            <img
                              src={getMoviePosterUrl(movie.posterPath)}
                              alt={`${movie.title} poster`}
                              className="w-16 h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link href={`/movie/${movie.id}`}>
                                  <h4 className="text-white font-semibold hover:text-yellow-400 transition-colors cursor-pointer">
                                    {movie.title}
                                  </h4>
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <div className="flex items-center text-yellow-400">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    <span>{convertRatingFromStorage(review.rating).toFixed(1)}/5</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>
                                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/movie/${movie.id}`}>
                                  <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-red-400 hover:text-red-300"
                                  disabled={deleteReviewMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {review.reviewText && (
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {review.reviewText}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                    <p className="text-gray-400 mb-4">Start watching and reviewing movies!</p>
                    <Link href="/">
                      <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                        Browse Movies
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
