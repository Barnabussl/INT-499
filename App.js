import React, { useState } from 'react';
import { Home, Film, ShoppingCart, Info } from 'lucide-react';

// Mock React Router components since react-router-dom isn't available
// In a real project, you would import these from 'react-router-dom'
const BrowserRouter = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  
  // Update path when navigation occurs
  const navigate = (path) => {
    setCurrentPath(path);
    // In real React Router, this would update the browser URL
    // window.history.pushState({}, '', path);
  };
  
  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const Routes = ({ children }) => {
  const { currentPath } = React.useContext(RouterContext);
  
  // Find the matching route
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

// Router Context
const RouterContext = React.createContext();

// StreamList Component (Homepage)
const StreamList = () => {
  const [userInput, setUserInput] = useState('');
  const [submittedInputs, setSubmittedInputs] = useState([]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      console.log('User Input:', userInput);
      setSubmittedInputs(prev => [...prev, userInput]);
      setUserInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Stream List</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Enter your stream or content..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Add to List
            </button>
          </div>
        </div>
        
        {submittedInputs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Stream List:</h2>
            <ul className="space-y-2">
              {submittedInputs.map((input, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                  {input}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Movies Component (Placeholder)
const Movies = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Movies</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Film className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h2>
        <p className="text-gray-500">This page will be built in Week 4</p>
      </div>
    </div>
  );
};

// Cart Component (Placeholder)
const Cart = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h2>
        <p className="text-gray-500">This page will be built in Week 4</p>
      </div>
    </div>
  );
};

// About Component (Placeholder)
const About = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Info className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h2>
        <p className="text-gray-500">This page will be built in Week 5</p>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/about', label: 'About', icon: Info }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">StreamList</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<StreamList />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;