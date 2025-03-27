import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ImageSlider = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === movies.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-xl bg-gray-900 group">
      {movies.map((movie, index) => {
        const isActive = index === currentIndex;
        const isPrevious = index === (currentIndex === 0 ? movies.length - 1 : currentIndex - 1);
        const isNext = index === (currentIndex === movies.length - 1 ? 0 : currentIndex + 1);

        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${isActive ? 'translate-x-0 opacity-100 z-20' : isPrevious ? '-translate-x-full opacity-0 z-10' : isNext ? 'translate-x-full opacity-0 z-10' : 'opacity-0'}`}
          >
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-4xl font-bold mb-4">{movie.title}</h2>
                <p className="text-lg mb-4 line-clamp-2">{movie.overview}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-2" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>{movie.release_date.split('-')[0]}</span>
                  </div>
                </div>
                <Link
                  to={`/movie/${movie.id}`}
                  className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              setCurrentIndex(index);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/50"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-2xl" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/50"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-2xl" />
      </button>
    </div>
  );
};

export default ImageSlider;