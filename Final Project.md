import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle, CreditCard, Lock, LogOut, User } from 'lucide-react';
import list from './Data.js';
import './App.css';

// Helper function to determine if item is subscription or accessory
const getItemType = (id) => {
  return id <= 4 ? 'subscription' : 'accessory';
};

// Format credit card number with spaces
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

// OAuth Login Component
const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate OAuth verification
    setTimeout(() => {
      if (credentials.username && credentials.password) {
        const user = {
          id: Date.now(),
          username: credentials.username,
          email: `${credentials.username}@eztech.com`,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('eztech-user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Please enter valid credentials');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EZTech Store</h1>
          <p className="text-gray-600">Secure Login Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Login with OAuth'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo: Use any username and password to login</p>
        </div>
      </div>
    </div>
  );
};

// Credit Card Management Component
const CreditCardManager = ({ onBack, onCardSaved }) => {
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eztech-cards');
    if (saved) {
      setSavedCards(JSON.parse(saved));
    }
  }, []);

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardInfo({...cardInfo, cardNumber: formatted});
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardInfo({...cardInfo, expiryDate: value});
  };

  const saveCard = () => {
    if (cardInfo.cardNumber.length !== 19 || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.cardholderName) {
      alert('Please fill in all card details correctly');
      return;
    }

    const newCard = {
      id: Date.now(),
      ...cardInfo,
      lastFour: cardInfo.cardNumber.slice(-4),
      addedDate: new Date().toISOString()
    };

    const updatedCards = [...savedCards, newCard];
    setSavedCards(updatedCards);
    localStorage.setItem('eztech-cards', JSON.stringify(updatedCards));
    
    setCardInfo({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    
    alert('Card saved successfully!');
  };

  const processPayment = () => {
    if (!selectedCard && (!cardInfo.cardNumber || cardInfo.cardNumber.length !== 19)) {
      alert('Please select a saved card or enter complete card details');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onCardSaved();
      alert('Payment processed successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <CreditCard className="mr-2" size={24} />
              Credit Card Management
            </h2>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Cart
            </button>
          </div>

          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Saved Cards</h3>
              <div className="space-y-2">
                {savedCards.map(card => (
                  <div
                    key={card.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCard?.id === card.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{card.cardholderName}</p>
                        <p className="text-sm text-gray-600">**** **** **** {card.lastFour}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires: {card.expiryDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Card */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {savedCards.length > 0 ? 'Add New Card' : 'Enter Card Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardInfo.cardholderName}
                  onChange={(e) => setCardInfo({...cardInfo, cardholderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardInfo.cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardInfo.expiryDate}
                  onChange={handleExpiryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardInfo.cvv}
                  onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>

            <button
              onClick={saveCard}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Save Card
            </button>
          </div>

          {/* Process Payment */}
          <div className="border-t pt-4">
            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : 'Process Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Application Component
const SubscriptionCartApp = () => {
  const [cart, setCart] = useState([]);
  const [warning, setWarning] = useState('');
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('cart'); // 'cart' or 'payment'

  // Check for existing user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('eztech-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load cart from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem('eztech-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('eztech-cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('eztech-user');
    localStorage.removeItem('eztech-cart');
    setUser(null);
    setCart([]);
    setCurrentView('cart');
  };

  const addToCart = (item) => {
    const itemType = getItemType(item.id);
    
    // Check if item is a subscription
    if (itemType === 'subscription') {
      // Check if there's already a subscription in cart
      const hasSubscription = cart.some(cartItem => getItemType(cartItem.id) === 'subscription');
      if (hasSubscription) {
        setWarning('You can only have one subscription at a time!');
        setTimeout(() => setWarning(''), 3000);
        return;
      }
    }

    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      if (itemType === 'subscription') {
        setWarning('This subscription is already in your cart!');
        setTimeout(() => setWarning(''), 3000);
        return;
      }
      // If it's an accessory, increase quantity
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      // Add new item to cart with itemType
      setCart([...cart, { ...item, quantity: 1, type: itemType }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setCurrentView('payment');
  };

  const handlePaymentComplete = () => {
    setCart([]);
    setCurrentView('cart');
  };

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show credit card management if in payment view
  if (currentView === 'payment') {
    return (
      <CreditCardManager
        onBack={() => setCurrentView('cart')}
        onCardSaved={handlePaymentComplete}
      />
    );
  }

  // Main application view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">EZTech Store</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} />
              <span className="hidden md:inline">Welcome, {user.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart size={24} />
              <span className="bg-red-500 text-white rounded-full px-2 py-1 text-sm font-bold">
                {getTotalItems()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Warning Message */}
      {warning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>{warning}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Available Products</h2>
            
            {/* Subscriptions */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">Subscriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.filter(item => getItemType(item.id) === 'subscription').map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center mb-3">
                      <img 
                        src={item.img} 
                        alt={item.service}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{item.service}</h4>
                        <p className="text-gray-600 text-sm">{item.serviceInfo}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600 mb-3">
                      ${item.price.toFixed(2)}/month
                    </p>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-600">EZTech Accessories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.filter(item => getItemType(item.id) === 'accessory').map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center mb-3">
                      <img 
                        src={item.img} 
                        alt={item.service}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{item.service}</h4>
                        <p className="text-gray-600 text-sm">{item.serviceInfo}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xl font-bold text-green-600">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {item.amount}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center flex-1">
                          <img 
                            src={item.img} 
                            alt={item.service}
                            className="w-10 h-10 object-contain mr-3"
                          />
                          <div>
                            <h4 className="font-semibold">{item.service}</h4>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} {getItemType(item.id) === 'subscription' ? '/month' : 'each'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getItemType(item.id) !== 'subscription' && (
                            <>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Plus size={16} />
                              </button>
                            </>
                          )}
                          {getItemType(item.id) === 'subscription' && (
                            <span className="w-8 text-center">1</span>
                          )}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                      <span>Total:</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                    >
                      <CreditCard size={20} />
                      <span>Checkout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCartApp;
