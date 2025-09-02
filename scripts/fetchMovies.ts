import axios from 'axios';

const TMDB_API_KEY = 'fa9a2fe11d08cc3192b607d71065712a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  runtime?: number;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: TMDBGenre[];
  credits: {
    cast: Array<{ name: string; character: string; order: number }>;
    crew: Array<{ name: string; job: string }>;
  };
  videos: {
    results: Array<{ key: string; type: string; site: string }>;
  };
}

const popularMovieIds = [
  299534, // Avengers: Endgame
  475557, // Joker (2019)
  19995,  // Avatar
  550,    // Fight Club
  155,    // The Dark Knight
  13,     // Forrest Gump
  680,    // Pulp Fiction
  122,    // The Lord of the Rings: The Return of the King
  324857, // Spider-Man: Into the Spider-Verse
  429617, // Spider-Man: Far From Home
  238,    // The Godfather
  278,    // The Shawshank Redemption
  424694, // Bohemian Rhapsody
  299536, // Avengers: Infinity War
  181808, // Star Wars: The Last Jedi
  181812, // Star Wars: The Rise of Skywalker
  141052, // Justice League
  335984, // Blade Runner 2049
  346364, // It
  420818, // The Lion King (2019)
];

async function fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails | null> {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    return null;
  }
}

function getYouTubeTrailerUrl(videos: { results: Array<{ key: string; type: string; site: string }> }): string | null {
  const trailer = videos.results.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  );
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

function mapGenreIds(genreIds: number[]): string[] {
  const genreMap: { [key: number]: string } = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
  };
  
  return genreIds.map(id => genreMap[id] || 'Unknown').filter(genre => genre !== 'Unknown');
}

export async function generateMoviesData() {
  console.log('Fetching movie data from TMDB...');
  const movies: any[] = [];
  
  for (let i = 0; i < popularMovieIds.length; i++) {
    const movieId = popularMovieIds[i];
    console.log(`Fetching movie ${i + 1}/${popularMovieIds.length}: ${movieId}`);
    
    const movieDetails = await fetchMovieDetails(movieId);
    if (!movieDetails) continue;
    
    const director = movieDetails.credits.crew.find(person => person.job === 'Director')?.name || null;
    const cast = movieDetails.credits.cast
      .filter(actor => actor.order < 5)
      .map(actor => actor.name);
    
    const movie = {
      id: movieId.toString(),
      title: movieDetails.title,
      description: movieDetails.overview,
      posterPath: movieDetails.poster_path,
      trailerUrl: getYouTubeTrailerUrl(movieDetails.videos),
      year: new Date(movieDetails.release_date).getFullYear(),
      duration: movieDetails.runtime,
      genres: movieDetails.genres ? movieDetails.genres.map(g => g.name) : [],
      cast: cast,
      director: director,
      averageRating: Math.round(movieDetails.vote_average * 10), // Convert 8.4 to 84
      reviewCount: 0,
    };
    
    movies.push(movie);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return movies;
}

// If running directly
generateMoviesData().then(movies => {
  console.log('Generated movies data:');
  console.log(JSON.stringify(movies, null, 2));
}).catch(console.error);
