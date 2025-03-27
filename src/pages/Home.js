import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaCalendarAlt, FaArrowRight, FaPlayCircle, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// API key for TMDb
const TMDB_API_KEY = '2d8af7b0c100ac8c6c49b5e307081513'; // TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState({});
  const [continueWatching, setContinueWatching] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Popular genre categories
  const genres = [
    { id: 'all', name: 'All' },
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' }
  ];

  useEffect(() => {
    // Load continue watching from localStorage
    const loadContinueWatching = () => {
      const savedMovies = localStorage.getItem('continueWatching');
      if (savedMovies) {
        try {
          const parsedMovies = JSON.parse(savedMovies);
          setContinueWatching(parsedMovies);
        } catch (error) {
          console.error('Error parsing continue watching data:', error);
          localStorage.removeItem('continueWatching');
        }
      }
    };
    
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Fetch trending movies
        const trendingResponse = await axios.get(
          `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
        );
        
        // Fetch popular movies
        const popularResponse = await axios.get(
          `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        
        // Fetch movies by genre (excluding 'all')
        const genrePromises = genres
          .filter(genre => genre.id !== 'all')
          .map(genre => 
            axios.get(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre.id}&sort_by=popularity.desc&page=1`)
          );
        
        const genreResponses = await Promise.all(genrePromises);
        
        // Create an object with genre id as key and movies as value
        const genreMoviesData = {};
        genres.filter(genre => genre.id !== 'all').forEach((genre, index) => {
          genreMoviesData[genre.id] = genreResponses[index].data.results.slice(0, 6);
        });
        
        setTrendingMovies(trendingResponse.data.results.slice(0, 6));
        setPopularMovies(popularResponse.data.results.slice(0, 12));
        setGenreMovies(genreMoviesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to fetch movies. Please try again later.');
        setLoading(false);
      }
    };

    loadContinueWatching();
    fetchMovies();
  }, [genres]); // Added genres as a dependency

  // Function to remove a movie from continue watching
  const removeFromContinueWatching = (movieId, e) => {
    e.preventDefault(); // Prevent navigation to movie details
    e.stopPropagation(); // Prevent event bubbling
    
    const updatedMovies = continueWatching.filter(movie => movie.id !== movieId);
    setContinueWatching(updatedMovies);
    localStorage.setItem('continueWatching', JSON.stringify(updatedMovies));
  };
  
  // Function to get movies based on selected genre
  const getMoviesByGenre = () => {
    if (selectedGenre === 'all') {
      return popularMovies;
    }
    return genreMovies[selectedGenre] || [];
  };
  
  const MovieCard = ({ movie, isFeatured = false, isContinueWatching = false }) => {
    return (
      <div className={`movie-card group ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''} animate-fade-in relative`}>
        <Link to={`/movie/${movie.id}`} className="block h-full">
          <div className="relative h-full overflow-hidden">
            {movie.poster_path ? (
              <img 
                src={`${POSTER_BASE_URL}${movie.poster_path}`} 
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image</span>
              </div>
            )}
            {isContinueWatching && movie.progress && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${movie.progress}%` }}
                ></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-lg md:text-xl truncate">{movie.title}</h3>
              <div className="flex items-center mt-2">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                <span className="mx-2 text-white">•</span>
                <FaCalendarAlt className="text-white mr-1" />
                <span className="text-white">{movie.release_date?.split('-')[0] || 'N/A'}</span>
              </div>
              {isFeatured && (
                <p className="text-white mt-2 line-clamp-2">{movie.overview}</p>
              )}
              {isContinueWatching && (
                <div className="flex items-center mt-2">
                  <FaPlayCircle className="text-primary mr-1" />
                  <span className="text-white">Continue Watching</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        {isContinueWatching && (
          <button 
            onClick={(e) => removeFromContinueWatching(movie.id, e)}
            className="absolute top-2 right-2 p-1 bg-gray-800/80 text-white rounded-full hover:bg-red-600 transition-colors duration-200 z-10"
            aria-label="Remove from continue watching"
          >
            <FaTimesCircle className="text-lg" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Continue Watching Section (only shown if there are movies to continue) */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Continue Watching</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isContinueWatching={true} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Hero Section with Trending Movies (Featured) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Movies</h2>
          <Link to="/trending" className="flex items-center text-primary hover:text-primary-dark transition-colors duration-200">
            View All <FaArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {trendingMovies.map((movie, index) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              isFeatured={index === 0} 
            />
          ))}
        </div>
      </section>

      {/* Popular Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Popular Categories</h2>
        </div>
        
        <div className="flex overflow-x-auto space-x-4 pb-4 mb-6 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
                selectedGenre === genre.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {getMoviesByGenre().map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;