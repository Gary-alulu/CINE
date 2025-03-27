import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilm } from 'react-icons/fa';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FaFilm className="text-primary text-2xl" />
            <span className="text-xl font-bold text-primary">MovieMagic</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-200">
              Home
            </Link>
            <Link to="/popular" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-200">
              Popular
            </Link>
            <Link to="/top-rated" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-200">
              Top Rated
            </Link>
            <Link to="/upcoming" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-200">
              Upcoming
            </Link>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 pl-10 pr-4 w-full md:w-64 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              <FaSearch />
            </button>
          </form>
          
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;