import { type User, type InsertUser, type Movie, type InsertMovie, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Movie methods
  getAllMovies(): Promise<Movie[]>;
  getMovie(id: string): Promise<Movie | undefined>;
  getMoviesByGenre(genre: string): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;

  // Review methods
  getReviewsByUser(userId: string): Promise<Review[]>;
  getReviewsByMovie(movieId: string): Promise<Review[]>;
  getUserReviewForMovie(userId: string, movieId: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private movies: Map<string, Movie>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.reviews = new Map();
    this.seedMovies();
  }

  private seedMovies() {
    const seedMovies: Movie[] = [
      {
        id: "1",
        title: "Avengers: Endgame",
        description: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
        posterPath: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
        trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
        year: 2019,
        duration: 181,
        genres: ["Action", "Adventure", "Sci-Fi"],
        cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
        director: "Anthony Russo, Joe Russo",
        averageRating: 84,
        reviewCount: 0,
      },
      {
        id: "2",
        title: "Joker",
        description: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.",
        posterPath: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
        trailerUrl: "https://www.youtube.com/embed/zAGVQLHvwOY",
        year: 2019,
        duration: 122,
        genres: ["Crime", "Drama", "Thriller"],
        cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz", "Frances Conroy"],
        director: "Todd Phillips",
        averageRating: 84,
        reviewCount: 0,
      },
      {
        id: "3",
        title: "Avatar",
        description: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.",
        posterPath: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
        trailerUrl: "https://www.youtube.com/embed/5PSNL1qE6VY",
        year: 2009,
        duration: 162,
        genres: ["Sci-Fi", "Adventure", "Action"],
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang"],
        director: "James Cameron",
        averageRating: 79,
        reviewCount: 0,
      },
      {
        id: "4",
        title: "Fight Club",
        description: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground 'fight clubs' forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
        posterPath: "/a26cQPRhJPX6GbWfQbvZdrrp9j9.jpg",
        trailerUrl: "https://www.youtube.com/embed/qtRKdVHc-cE",
        year: 1999,
        duration: 139,
        genres: ["Drama", "Thriller"],
        cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"],
        director: "David Fincher",
        averageRating: 88,
        reviewCount: 0,
      },
      {
        id: "5",
        title: "F1",
        description: "Racing legend Sonny Hayes is coaxed out of retirement to lead a struggling Formula 1 team—and mentor a young hotshot driver—while chasing one more chance at glory.",
        posterPath: "/9PXZIUsSDh4alB80jheWX4fhZmy.jpg",
        trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        year: 2025,
        duration: 140,
        genres: ["Drama", "Sport"],
        cast: ["Brad Pitt", "Damson Idris", "Kerry Condon", "Tobias Menzies"],
        director: "Joseph Kosinski",
        averageRating: 0,
        reviewCount: 0,
      },
      {
        id: "6",
        title: "M3GAN 2.0",
        description: "After the underlying tech for M3GAN is stolen and misused by a powerful defense contractor to create a military-grade weapon known as Amelia, M3GAN's creator Gemma realizes that the only option is to resurrect M3GAN and give her a few upgrades, making her faster, stronger, and more lethal.",
        posterPath: "/oekamLQrwlJjRNmfaBE4llIvkir.jpg",
        trailerUrl: "https://www.youtube.com/embed/IYLHdEzsk1s",
        year: 2025,
        duration: 102,
        genres: ["Horror", "Sci-Fi", "Thriller"],
        cast: ["Allison Williams", "Violet McGraw", "Amie Donald", "Jenna Davis"],
        director: "Gerard Johnstone",
        averageRating: 0,
        reviewCount: 0,
      },
    ];

    seedMovies.forEach(movie => {
      this.movies.set(movie.id, movie);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      profilePicture: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Movie methods
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: string): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    return Array.from(this.movies.values()).filter(movie => 
      movie.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  async searchMovies(query: string): Promise<Movie[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.movies.values()).filter(movie =>
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.description.toLowerCase().includes(lowercaseQuery) ||
      movie.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)) ||
      movie.cast.some(actor => actor.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = randomUUID();
    const movie: Movie = {
      ...insertMovie,
      id,
      averageRating: 0,
      reviewCount: 0,
    };
    this.movies.set(id, movie);
    return movie;
  }

  // Review methods
  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.userId === userId);
  }

  async getReviewsByMovie(movieId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.movieId === movieId);
  }

  async getUserReviewForMovie(userId: string, movieId: string): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      review => review.userId === userId && review.movieId === movieId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.set(id, review);
    
    // Update movie rating statistics
    await this.updateMovieRatingStats(insertReview.movieId);
    
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { 
      ...review, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.reviews.set(id, updatedReview);
    
    // Update movie rating statistics
    await this.updateMovieRatingStats(review.movieId);
    
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    this.reviews.delete(id);
    
    // Update movie rating statistics
    await this.updateMovieRatingStats(review.movieId);
    
    return true;
  }

  private async updateMovieRatingStats(movieId: string): Promise<void> {
    const movie = this.movies.get(movieId);
    if (!movie) return;

    const movieReviews = await this.getReviewsByMovie(movieId);
    const reviewCount = movieReviews.length;
    
    let averageRating = 0;
    if (reviewCount > 0) {
      const totalRating = movieReviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Math.round((totalRating / reviewCount) * 10); // Store as integer (84 for 8.4)
    }

    const updatedMovie = {
      ...movie,
      averageRating,
      reviewCount,
    };

    this.movies.set(movieId, updatedMovie);
  }
}

export const storage = new MemStorage();
