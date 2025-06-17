import React, { useState, useEffect } from 'react';
import { Home, Film, ShoppingCart, Info, Edit3, Trash2, Check, X, Plus, Search, Filter, Star, Clock, TrendingUp, User, Settings, Bell, Play, Calendar, Users, ExternalLink, Heart } from 'lucide-react';

// TMDB API Configuration
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Your actual API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Local Storage utility functions
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
    }
  },
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key "${key}":`, error);
    }
  }
};

// TMDB API functions
const tmdbAPI = {
  searchMovies: async (query, page = 1) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to search movies');
      return await response.json();
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },
  
  getMovieDetails: async (movieId) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,reviews,videos`
      );
      if (!response.ok) throw new Error('Failed to get movie details');
      return await response.json();
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  },
  
  getPopularMovies: async (page = 1) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to get popular movies');
      return await response.json();
    } catch (error) {
      console.error('Error getting popular movies:', error);
      throw error;
    }
  },
  
  getTrending: async (mediaType = 'all', timeWindow = 'week') => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to get trending content');
      return await response.json();
    } catch (error) {
      console.error('Error getting trending content:', error);
      throw error;
    }
  }
};

const BrowserRouter = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(() => {
    return storage.get('currentPath', '/');
  });
  
  const navigate = (path) => {
    setCurrentPath(path);
    storage.set('currentPath', path);
  };
  
  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const Routes = ({ children }) => {
  const { currentPath } = React.useContext(RouterContext);
  
  const matchingRoute = React.Children.toArray(children).find(child => {
    return child.props.path === currentPath;
  });
  
  return matchingRoute || null;
};

const Route = ({ path, element }) => {
  return element;
};

const Link = ({ to, children, className }) => {
  const { navigate } = React.useContext(RouterContext);
  
  return (
    <button 
      onClick={() => navigate(to)}
      className={className}
    >
      {children}
    </button>
  );
};

const useLocation = () => {
  const { currentPath } = React.useContext(RouterContext);
  return { pathname: currentPath };
};

const RouterContext = React.createContext();

// Movie Search & Review Component
const MovieSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    return storage.get('favoriteMovies', []);
  });

  // Save favorites to localStorage
  useEffect(() => {
    storage.set('favoriteMovies', favorites);
  }, [favorites]);

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await tmdbAPI.searchMovies(searchQuery, page);
      setSearchResults(data.results);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = async (movieId) => {
    setLoading(true);
    setError(null);
    try {
      const movieDetails = await tmdbAPI.getMovieDetails(movieId);
      setSelectedMovie(movieDetails);
    } catch (err) {
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === movie.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const isFavorite = (movieId) => {
    return favorites.some(fav => fav.id === movieId);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (selectedMovie) {
    return (
      <div className="max-w-6xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <button
          onClick={() => setSelectedMovie(null)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          ← Back to Search
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Movie Header */}
          <div className="relative">
            {selectedMovie.backdrop_path && (
              <div 
                className="h-96 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${TMDB_IMAGE_BASE_URL}${selectedMovie.backdrop_path})`,
                  backgroundSize: 'cover'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-end gap-6">
                {selectedMovie.poster_path && (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    className="w-48 h-72 rounded-lg shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{selectedMovie.title}</h1>
                  <p className="text-xl opacity-90 mb-4">{selectedMovie.tagline}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{selectedMovie.vote_average.toFixed(1)}/10</span>
                    </div>
                    <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                    <span>{formatRuntime(selectedMovie.runtime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedMovie.overview}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovie.genres.map(genre => (
                        <span key={genre.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovie.spoken_languages.map(lang => (
                        <span key={lang.iso_639_1} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {lang.english_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cast */}
                {selectedMovie.credits && selectedMovie.credits.cast.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Cast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedMovie.credits.cast.slice(0, 8).map(actor => (
                        <div key={actor.id} className="text-center">
                          {actor.profile_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <p className="font-medium text-sm text-gray-800">{actor.name}</p>
                          <p className="text-xs text-gray-600">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {selectedMovie.reviews && selectedMovie.reviews.results.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Reviews</h3>
                    <div className="space-y-4">
                      {selectedMovie.reviews.results.slice(0, 3).map(review => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">{review.author}</h4>
                            {review.author_details.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{review.author_details.rating}/10</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Movie Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className="ml-2 text-gray-800">{selectedMovie.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Release Date:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date(selectedMovie.release_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Runtime:</span>
                      <span className="ml-2 text-gray-800">{formatRuntime(selectedMovie.runtime)}</span>
                    </div>
                    {selectedMovie.budget > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Budget:</span>
                        <span className="ml-2 text-gray-800">{formatCurrency(selectedMovie.budget)}</span>
                      </div>
                    )}
                    {selectedMovie.revenue > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Revenue:</span>
                        <span className="ml-2 text-gray-800">{formatCurrency(selectedMovie.revenue)}</span>
                      </div>
                    )}
                    {selectedMovie.homepage && (
                      <div>
                        <a
                          href={selectedMovie.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Official Website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFavorite(selectedMovie)}
                    className={`w-full mt-6 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                      isFavorite(selectedMovie.id)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    <Heart className={`inline h-4 w-4 mr-2 ${isFavorite(selectedMovie.id) ? 'fill-current' : ''}`} />
                    {isFavorite(selectedMovie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Movie Search & Reviews</h1>
        <p className="text-gray-600">Search for movies and read detailed reviews</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Favorites ({favorites.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map(movie => (
              <div key={`fav-${movie.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <button
                  onClick={() => handleMovieSelect(movie.id)}
                  className="w-full text-left"
                >
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map(movie => (
              <div key={movie.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <button
                  onClick={() => handleMovieSelect(movie.id)}
                  className="w-full text-left"
                >
                  <div className="aspect-w-2 aspect-h-3 bg-gray-200">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <Film className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-600">{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(movie)}
                      className={`p-1 rounded transition-colors duration-200 ${
                        isFavorite(movie.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{movie.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {movie.release_date && new Date(movie.release_date).getFullYear()}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3">{movie.overview}</p>
                  <button
                    onClick={() => handleMovieSelect(movie.id)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {Math.min(totalPages, 500)}
              </span>
              <button
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= totalPages || currentPage >= 500 || loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No results found</h2>
          <p className="text-gray-500">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
};

// Enhanced StreamList Component with localStorage
const StreamList = () => {
  const [userInput, setUserInput] = useState('');
  const [submittedInputs, setSubmittedInputs] = useState(() => {
    return storage.get('streamListItems', []);
  });
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState(() => {
    return storage.get('streamListFilter', 'all');
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Save to localStorage whenever submittedInputs changes
  useEffect(() => {
    storage.set('streamListItems', submittedInputs);
  }, [submittedInputs]);

  // Save filter to localStorage
  useEffect(() => {
    storage.set('streamListFilter', filter);
  }, [filter]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      const newItem = {
        id: Date.now(),
        text: userInput.trim(),
        completed: false,
        createdAt: new Date().toLocaleDateString(),
        priority: 'medium'
      };
      setSubmittedInputs(prev => [...prev, newItem]);
      setUserInput('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleSaveEdit = (id) => {
    if (editingText.trim()) {
      setSubmittedInputs(prev => 
        prev.map(item => 
          item.id === id ? { ...item, text: editingText.trim() } : item
        )
      );
    }
    setEditingId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDelete = (id) => {
    setSubmittedInputs(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleComplete = (id) => {
    setSubmittedInputs(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handlePriorityChange = (id, priority) => {
    setSubmittedInputs(prev => 
      prev.map(item => 
        item.id === id ? { ...item, priority } : item
      )
    );
  };

  const filteredInputs = submittedInputs.filter(item => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !item.completed) || 
      (filter === 'completed' && item.completed);
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: submittedInputs.length,
    completed: submittedInputs.filter(item => item.completed).length,
    active: submittedInputs.filter(item => !item.completed).length
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Stream List</h1>
        <p className="text-gray-600">Organize your favorite content and track your progress</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Film className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Items</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter your stream or content..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      {filteredInputs.length > 0 ? (
        <div className="space-y-4">
          {filteredInputs.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all duration-200 hover:shadow-xl ${
                item.completed ? 'opacity-75' : ''
              } ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.completed && <Check className="h-4 w-4" />}
                  </button>
                  
                  <div className="flex-1">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className={`text-lg font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {item.text}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Added on {item.createdAt}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.priority}
                    onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  
                  <button
                    onClick={() => handleEdit(item.id, item.text)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Film className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            {searchTerm || filter !== 'all' ? 'No items found' : 'Your list is empty'}
          </h2>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start building your stream list by adding your first item!'
            }
          </p>
          {!showAddForm && !searchTerm && filter === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Add Your First Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Movies Component with TMDB API
const Movies = () => {
  const [movies, setMovies] = useState(() => {
    return storage.get('popularMovies', []);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    return storage.get('movieWatchlist', []);
  });

  // Save movies and watchlist to localStorage
  useEffect(() => {
    storage.set('popularMovies', movies);
  }, [movies]);

  useEffect(() => {
    storage.set('movieWatchlist', watchlist);
  }, [watchlist]);

  // Load popular movies on component mount if not already loaded
  useEffect(() => {
    if (movies.length === 0) {
      fetchPopularMovies();
    }
  }, []);

  const addToWatchlist = (movie) => {
    if (!watchlist.find(item => item.id === movie.id)) {
      setWatchlist(prev => [...prev, movie]);
    }
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(item => item.id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(item => item.id === movieId);
  };

  const fetchPopularMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tmdbAPI.getPopularMovies();
      setMovies(data.results);
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGenreNames = (genreIds) => {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genreIds.slice(0, 2).map(id => genreMap[id] || 'Unknown').join(', ');
  };

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Popular Movies</h1>
          <p className="text-gray-600">Discover trending movies from TMDB</p>
        </div>
        <button
          onClick={fetchPopularMovies}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </>
          ) : (
            <>
              <Film className="h-4 w-4" />
              Refresh Movies
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="aspect-w-2 aspect-h-3 bg-gray-200">
              {movie.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <Film className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-600">{movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(movie.release_date).getFullYear()}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{movie.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{getGenreNames(movie.genre_ids)}</p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{movie.overview}</p>
              <button 
                onClick={() => isInWatchlist(movie.id) ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  isInWatchlist(movie.id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <Check className="inline h-4 w-4 mr-2" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="inline h-4 w-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {watchlist.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Watchlist ({watchlist.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map(movie => (
              <div key={`watchlist-${movie.id}`} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
                <div className="w-16 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Film className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{movie.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(movie.release_date).getFullYear()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(movie.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Trending Component with TMDB API
const Trending = () => {
  const [trendingContent, setTrendingContent] = useState(() => {
    return storage.get('trendingContent', []);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState('week');

  // Save trending content to localStorage
  useEffect(() => {
    storage.set('trendingContent', trendingContent);
  }, [trendingContent]);

  // Load trending content on component mount if not already loaded
  useEffect(() => {
    if (trendingContent.length === 0) {
      fetchTrending();
    }
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tmdbAPI.getTrending('all', timeWindow);
      setTrendingContent(data.results);
    } catch (err) {
      setError('Failed to fetch trending content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (mediaType) => {
    return mediaType === 'tv' ? <Users className="h-4 w-4" /> : <Film className="h-4 w-4" />;
  };

  const getMediaDate = (item) => {
    return item.release_date || item.first_air_date;
  };

  const getTitle = (item) => {
    return item.title || item.name;
  };

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Trending Now</h1>
          <p className="text-gray-600">What's hot in movies and TV shows</p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeWindow}
            onChange={(e) => {
              setTimeWindow(e.target.value);
              // Auto-fetch when time window changes
              setTimeout(() => fetchTrending(), 100);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
          </select>
          <button
            onClick={fetchTrending}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trendingContent.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <div className="aspect-w-2 aspect-h-3 bg-gray-200">
              {item.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`}
                  alt={getTitle(item)}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  {getMediaIcon(item.media_type)}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-600">{item.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  {getMediaIcon(item.media_type)}
                  <span className="text-sm capitalize">{item.media_type}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{getTitle(item)}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {getMediaDate(item) && new Date(getMediaDate(item)).getFullYear()}
              </p>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{item.overview}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                <Play className="inline h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Cart Component with localStorage
const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    return storage.get('cartItems', [
      { id: 1, name: "Netflix Subscription", price: 15.99, type: "monthly" },
      { id: 2, name: "Disney+ Subscription", price: 7.99, type: "monthly" },
    ]);
  });

  useEffect(() => {
    storage.set('cartItems', cartItems);
  }, [cartItems]);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {cartItems.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced About Component
const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">About StreamList</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              StreamList helps you organize and track your favorite streaming content with full TMDB integration. 
              Search for movies, read reviews, and never lose track of what you want to watch next!
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Easy content organization</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Progress tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Full TMDB API integration</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Persistent localStorage</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Movie search & reviews</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">TMDB Integration</h3>
                <p className="text-sm text-blue-700">Search movies, view details, and read reviews</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Persistent Storage</h3>
                <p className="text-sm text-green-700">All your data persists across sessions</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900">Watchlist Management</h3>
                <p className="text-sm text-purple-700">Add movies to your personal watchlist</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-900">Favorites System</h3>
                <p className="text-sm text-red-700">Save your favorite movies for quick access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Component with localStorage
const Profile = () => {
  const [userPreferences, setUserPreferences] = useState(() => {
    return storage.get('userPreferences', {
      theme: 'light',
      notifications: true,
      autoSave: true
    });
  });

  useEffect(() => {
    storage.set('userPreferences', userPreferences);
  }, [userPreferences]);

  const updatePreference = (key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
          <User className="h-16 w-16 text-gray-400" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">StreamList User</h2>
            <p className="text-gray-500">Manage your account settings and preferences</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Theme</h3>
              <p className="text-sm text-gray-600">Choose your preferred theme</p>
            </div>
            <select
              value={userPreferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">Receive updates about new content</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', !userPreferences.notifications)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                userPreferences.notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                userPreferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Auto Save</h3>
              <p className="text-sm text-gray-600">Automatically save changes</p>
            </div>
            <button
              onClick={() => updatePreference('autoSave', !userPreferences.autoSave)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                userPreferences.autoSave ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                userPreferences.autoSave ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const AppSettings = () => {
  return (
    <div className="max-w-4xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">App Settings</h2>
        <p className="text-gray-500">Customize your StreamList experience</p>
      </div>
    </div>
  );
};

// Notifications Component
const Notifications = () => {
  return (
    <div className="max-w-4xl mx-auto p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Notifications</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Notifications</h2>
        <p className="text-gray-500">Stay updated with your streaming activity</p>
      </div>
    </div>
  );
};

// Enhanced Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/about', label: 'About', icon: Info }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Film className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800">StreamList</span>
              <p className="text-sm text-gray-600">Your Content Hub</p>
            </div>
          </div>
          
          <div className="hidden lg:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="grid grid-cols-4 gap-2">
            {navItems.slice(0, 8).map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<StreamList />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/search" element={<MovieSearch />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<AppSettings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
