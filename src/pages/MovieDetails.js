import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaCalendarAlt, FaClock, FaLanguage, FaTag, FaPlay } from 'react-icons/fa';

// API key for TMDb
const TMDB_API_KEY = '2d8af7b0c100ac8c6c49b5e307081513'; // TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// API key for OMDb
const OMDB_API_KEY = 'f9d54f3e'; // OMDb API key
const OMDB_BASE_URL = 'https://www.omdbapi.com';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [omdbData, setOmdbData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details from TMDb
        const tmdbResponse = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`
        );
        
        setMovie(tmdbResponse.data);
        
        // Add to continue watching
        addToContinueWatching(tmdbResponse.data);
        
        // Fetch additional data from OMDb using the movie title
        const omdbResponse = await axios.get(
          `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(tmdbResponse.data.title)}&y=${tmdbResponse.data.release_date?.split('-')[0] || ''}`
        );
        
        if (omdbResponse.data.Response === 'True') {
          setOmdbData(omdbResponse.data);
        }
        
        // Fetch videos (trailers, teasers, etc.)
        const videosResponse = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        
        setVideos(videosResponse.data.results);
        
        // Fetch similar movies
        const similarResponse = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        
        setSimilarMovies(similarResponse.data.results.slice(0, 6));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to fetch movie details. Please try again later.');
        setLoading(false);
      }
    };

    // Function to add movie to continue watching
    const addToContinueWatching = (movieData) => {
      try {
        // Get current continue watching list
        const continueWatchingStr = localStorage.getItem('continueWatching');
        let continueWatching = [];
        
        if (continueWatchingStr) {
          continueWatching = JSON.parse(continueWatchingStr);
        }
        
        // Check if movie already exists in the list
        const existingIndex = continueWatching.findIndex(m => m.id === movieData.id);
        
        // Create simplified movie object with essential data
        const movieToAdd = {
          id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          vote_average: movieData.vote_average,
          release_date: movieData.release_date,
          progress: existingIndex >= 0 ? continueWatching[existingIndex].progress : 30, // Default progress or existing progress
          timestamp: Date.now()
        };
        
        // If movie exists, remove it (to update and add to front of list)
        if (existingIndex >= 0) {
          continueWatching.splice(existingIndex, 1);
        }
        
        // Add movie to front of list
        continueWatching.unshift(movieToAdd);
        
        // Limit list to 12 movies
        if (continueWatching.length > 12) {
          continueWatching = continueWatching.slice(0, 12);
        }
        
        // Save to localStorage
        localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
      } catch (error) {
        console.error('Error adding to continue watching:', error);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrailer = () => {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Movie not found'}</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const trailer = getTrailer();

  return (
    <div className="animate-fade-in">
      {/* Backdrop Image */}
      <div className="relative h-96 mb-8 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-transparent z-10"></div>
        {movie.backdrop_path ? (
          <img
            src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No backdrop available</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 z-20 p-6 w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h1>
          {movie.tagline && (
            <p className="text-gray-300 text-lg italic mb-4">"{movie.tagline}"</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-white">
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{movie.vote_average.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
            </div>
            {movie.runtime > 0 && (
              <div className="flex items-center">
                <FaClock className="mr-1" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
            <div className="flex items-center">
              <FaLanguage className="mr-1" />
              <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Poster and Quick Info */}
        <div className="md:col-span-1">
          <div className="rounded-lg overflow-hidden shadow-lg mb-6">
            {movie.poster_path ? (
              <img
                src={`${POSTER_BASE_URL}${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400">No poster available</span>
              </div>
            )}
          </div>

          {trailer && (
            <a
              href={trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center mb-6"
            >
              <FaPlay className="mr-2" /> Watch Trailer
            </a>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Movie Info</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Status:</span> {movie.status}
              </div>
              <div>
                <span className="font-semibold">Budget:</span> {movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Revenue:</span> {movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : 'N/A'}
              </div>
              {omdbData && (
                <>
                  <div>
                    <span className="font-semibold">Director:</span> {omdbData.Director !== 'N/A' ? omdbData.Director : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-semibold">Writer:</span> {omdbData.Writer !== 'N/A' ? omdbData.Writer : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-semibold">Box Office:</span> {omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : 'Unknown'}
                  </div>
                  <div>
                    <span className="font-semibold">Awards:</span> {omdbData.Awards !== 'N/A' ? omdbData.Awards : 'None'}
                  </div>
                </>
              )}
            </div>
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm flex items-center"
                  >
                    <FaTag className="mr-1 text-xs" />
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Overview, Cast, Similar Movies */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>

            {omdbData && omdbData.Ratings && omdbData.Ratings.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-3">Ratings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {omdbData.Ratings.map((rating, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{rating.Source}</div>
                      <div className="text-lg font-bold">{rating.Value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {movie.credits.cast.slice(0, 8).map(person => (
                  <div key={person.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {person.profile_path ? (
                      <img
                        src={`${POSTER_BASE_URL}${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    <div className="p-2">
                      <div className="font-bold truncate">{person.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{person.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similarMovies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {similarMovies.map(movie => (
                  <Link key={movie.id} to={`/movie/${movie.id}`} className="block">
                    <div className="movie-card h-full">
                      {movie.poster_path ? (
                        <img
                          src={`${POSTER_BASE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-bold truncate">{movie.title}</h3>
                        <div className="flex items-center mt-1 text-sm">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                          <span className="mx-1">•</span>
                          <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;