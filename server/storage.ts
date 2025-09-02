import { type User, type InsertUser, type Movie, type InsertMovie, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  updateUserProfilePicture(id: string, profilePictureUrl: string): Promise<User | undefined>;

  getAllMovies(): Promise<Movie[]>;
  getMovie(id: string): Promise<Movie | undefined>;
  getMoviesByGenre(genre: string): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;

  getReview(id: string): Promise<Review | undefined>;
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
        posterPath: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
        year: 2019,
        duration: 181,
        genres: ["Action", "Adventure", "Drama"],
        cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
        director: "Anthony Russo, Joe Russo",
        averageRating: 83,
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
        posterPath: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
        trailerUrl: "https://www.youtube.com/embed/5PSNL1qE6VY",
        year: 2009,
        duration: 162,
        genres: ["Action", "Adventure", "Fantasy"],
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
        genres: ["Drama"],
        cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"],
        director: "David Fincher",
        averageRating: 88,
        reviewCount: 0,
      },
      {
        id: "5",
        title: "The Dark Knight",
        description: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
        year: 2008,
        duration: 152,
        genres: ["Action", "Crime", "Drama"],
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
        director: "Christopher Nolan",
        averageRating: 90,
        reviewCount: 0,
      },
      {
        id: "6",
        title: "Forrest Gump",
        description: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
        posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        trailerUrl: "https://www.youtube.com/embed/bLvqoHBptjg",
        year: 1994,
        duration: 142,
        genres: ["Comedy", "Drama", "Romance"],
        cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Mykelti Williamson"],
        director: "Robert Zemeckis",
        averageRating: 87,
        reviewCount: 0,
      },
      {
        id: "7",
        title: "Pulp Fiction",
        description: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
        posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        trailerUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
        year: 1994,
        duration: 154,
        genres: ["Crime", "Drama"],
        cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
        director: "Quentin Tarantino",
        averageRating: 89,
        reviewCount: 0,
      },
      {
        id: "8",
        title: "The Lord of the Rings: The Return of the King",
        description: "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron's forces. Meanwhile, Frodo and Sam take the ring closer to the heart of Mordor, the dark lord's realm.",
        posterPath: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
        trailerUrl: "https://www.youtube.com/embed/r5X-hFf6Bwo",
        year: 2003,
        duration: 201,
        genres: ["Adventure", "Drama", "Fantasy"],
        cast: ["Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Sean Astin"],
        director: "Peter Jackson",
        averageRating: 89,
        reviewCount: 0,
      },
      {
        id: "9",
        title: "Spider-Man: Into the Spider-Verse",
        description: "Struggling to find his place in the world while juggling school and family, Brooklyn teenager Miles Morales is unexpectedly bitten by a radioactive spider and develops incredible powers just like the one and only Spider-Man. When Wilson 'Kingpin' Fisk uses a super collider, others from across the Spider-Verse are transported to this dimension.",
        posterPath: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        trailerUrl: "https://www.youtube.com/embed/tg52up16eq0",
        year: 2018,
        duration: 117,
        genres: ["Action", "Adventure", "Animation"],
        cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"],
        director: "Bob Persichetti, Peter Ramsey, Rodney Rothman",
        averageRating: 84,
        reviewCount: 0,
      },
      {
        id: "10",
        title: "The Shawshank Redemption",
        description: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
        posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        trailerUrl: "https://www.youtube.com/embed/6hB3S9bIaco",
        year: 1994,
        duration: 142,
        genres: ["Drama"],
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
        director: "Frank Darabont",
        averageRating: 93,
        reviewCount: 0,
      },
      {
        id: "11",
        title: "Bohemian Rhapsody",
        description: "Singer Freddie Mercury, guitarist Brian May, drummer Roger Taylor and bass guitarist John Deacon take the music world by storm when they form the rock 'n' roll band Queen in 1970. Hit songs become instant classics. When Mercury's increasingly wild lifestyle starts to spiral out of control, Queen soon faces its greatest challenge yet – finding a way to keep the band together amid the success and excess.",
        posterPath: "/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg",
        trailerUrl: "https://www.youtube.com/embed/mP0VHJYFOAU",
        year: 2018,
        duration: 134,
        genres: ["Drama", "Music"],
        cast: ["Rami Malek", "Lucy Boynton", "Gwilym Lee", "Ben Hardy"],
        director: "Bryan Singer",
        averageRating: 80,
        reviewCount: 0,
      },
      {
        id: "12",
        title: "Avengers: Infinity War",
        description: "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
        posterPath: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        trailerUrl: "https://www.youtube.com/embed/6ZfuNTqbHE8",
        year: 2018,
        duration: 149,
        genres: ["Adventure", "Action", "Sci-Fi"],
        cast: ["Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo", "Chris Evans"],
        director: "Anthony Russo, Joe Russo",
        averageRating: 83,
        reviewCount: 0,
      },
      {
        id: "13",
        title: "Blade Runner 2049",
        description: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos. K's discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years.",
        posterPath: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        trailerUrl: "https://www.youtube.com/embed/gCcx85zbxz4",
        year: 2017,
        duration: 164,
        genres: ["Drama", "Sci-Fi", "Thriller"],
        cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks"],
        director: "Denis Villeneuve",
        averageRating: 80,
        reviewCount: 0,
      },
      {
        id: "14",
        title: "It",
        description: "In a small town in Maine, seven children known as The Losers Club come face to face with life problems, bullies and a monster that takes the shape of a clown called Pennywise.",
        posterPath: "/9E2y5Q7WlCVNEhP5GiVTjhEhx1o.jpg",
        trailerUrl: "https://www.youtube.com/embed/FnCdOQsX5kc",
        year: 2017,
        duration: 135,
        genres: ["Horror", "Thriller"],
        cast: ["Jaeden Martell", "Jeremy Ray Taylor", "Sophia Lillis", "Finn Wolfhard"],
        director: "Andy Muschietti",
        averageRating: 73,
        reviewCount: 0,
      },
      {
        id: "15",
        title: "The Lion King",
        description: "Simba idolizes his father, King Mufasa, and takes to heart his own royal destiny. But not everyone in the kingdom celebrates the new cub's arrival. Scar, Mufasa's brother—and former heir to the throne—has plans of his own. The battle for Pride Rock is ravaged with betrayal, tragedy and drama, ultimately resulting in Simba's exile. With help from a curious pair of newfound friends, Simba will have to figure out how to grow up and take back what is rightfully his.",
        posterPath: "/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg",
        trailerUrl: "https://www.youtube.com/embed/7TavVZMewpY",
        year: 2019,
        duration: 118,
        genres: ["Adventure", "Drama", "Family"],
        cast: ["Donald Glover", "Beyoncé", "James Earl Jones", "Chiwetel Ejiofor"],
        director: "Jon Favreau",
        averageRating: 68,
        reviewCount: 0,
      },
      {
        id: "16",
        title: "The Godfather",
        description: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
        posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        trailerUrl: "https://www.youtube.com/embed/sY1S34973zA",
        year: 1972,
        duration: 175,
        genres: ["Crime", "Drama"],
        cast: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
        director: "Francis Ford Coppola",
        averageRating: 92,
        reviewCount: 0,
      },
      {
        id: "17",
        title: "Inception",
        description: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: 'inception', the implantation of another person's idea into a target's subconscious.",
        posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
        year: 2010,
        duration: 148,
        genres: ["Action", "Sci-Fi", "Thriller"],
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
        director: "Christopher Nolan",
        averageRating: 87,
        reviewCount: 0,
      },
      {
        id: "18",
        title: "Interstellar",
        description: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
        year: 2014,
        duration: 169,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
        director: "Christopher Nolan",
        averageRating: 86,
        reviewCount: 0,
      },
      {
        id: "19",
        title: "Parasite",
        description: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
        posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
        year: 2019,
        duration: 132,
        genres: ["Comedy", "Drama", "Thriller"],
        cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
        director: "Bong Joon-ho",
        averageRating: 85,
        reviewCount: 0,
      },
      {
        id: "20",
        title: "Dune",
        description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence-a commodity capable of unlocking humanity's greatest potential-only those who can conquer their fear will survive.",
        posterPath: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        trailerUrl: "https://www.youtube.com/embed/n9xhJrPXop4",
        year: 2021,
        duration: 155,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin"],
        director: "Denis Villeneuve",
        averageRating: 78,
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

  async updateUserProfilePicture(id: string, profilePictureUrl: string): Promise<User | undefined> {
    return this.updateUser(id, { profilePicture: profilePictureUrl });
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
      trailerUrl: insertMovie.trailerUrl || null,
      duration: insertMovie.duration || null,
      director: insertMovie.director || null,
      averageRating: 0,
      reviewCount: 0,
    };
    this.movies.set(id, movie);
    return movie;
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

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
      reviewText: insertReview.reviewText || null,
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
      // Convert from 1-50 scale to 1-100 scale for storage (to match existing data)
      averageRating = Math.round((totalRating / reviewCount) * 2); // Convert 1-50 to 2-100
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
