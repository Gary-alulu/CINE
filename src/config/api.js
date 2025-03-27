// API Configuration
export const TMDB_CONFIG = {
  API_KEY: process.env.REACT_APP_TMDB_API_KEY,
  BASE_URL: process.env.REACT_APP_TMDB_BASE_URL,
  POSTER_URL: process.env.REACT_APP_POSTER_BASE_URL,
  BACKDROP_URL: process.env.REACT_APP_BACKDROP_BASE_URL
};

export const OMDB_CONFIG = {
  API_KEY: process.env.REACT_APP_OMDB_API_KEY,
  BASE_URL: process.env.REACT_APP_OMDB_BASE_URL
};

// API Validation
export const validateAPIConfig = () => {
  if (!TMDB_CONFIG.API_KEY || TMDB_CONFIG.API_KEY.length < 20) {
    throw new Error('Invalid TMDB API key configuration');
  }
  if (!TMDB_CONFIG.BASE_URL?.startsWith('https://')) {
    throw new Error('Invalid TMDB base URL configuration');
  }
  if (!OMDB_CONFIG.API_KEY) {
    throw new Error('Invalid OMDb API key configuration');
  }
};

// Error Handler
export const handleAPIError = (error) => {
  if (error.response?.status === 401) {
    return 'Invalid API key. Please check your configuration.';
  }
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  return error.message || 'An unexpected error occurred. Please try again later.';
};