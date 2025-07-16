import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Star, Truck, Shield, Heart, Search, Filter, ChevronDown } from 'lucide-react';

const App = () => {
  const [products] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: 1199,
      stock: 25,
      warranty: "1 Year AppleCare",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop",
      rating: 4.8,
      reviews: 2847,
      category: "Smartphones",
      brand: "Apple",
      features: ["A17 Pro Chip", "ProRAW Camera", "Titanium Build", "5G"],
      discount: 0,
      originalPrice: 1199
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      price: 1049,
      stock: 18,
      warranty: "2 Years Samsung Care",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
      rating: 4.6,
      reviews: 1923,
      category: "Smartphones",
      brand: "Samsung",
      features: ["S Pen Included", "200MP Camera", "AI Features", "5G"],
      discount: 8,
      originalPrice: 1149
    },
    {
      id: 3,
      name: "MacBook Pro 14\" M3",
      price: 1899,
      stock: 12,
      warranty: "1 Year Limited",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
      rating: 4.9,
      reviews: 892,
      category: "Laptops",
      brand: "Apple",
      features: ["M3 Pro Chip", "Liquid Retina XDR", "22hr Battery", "MagSafe"],
      discount: 5,
      originalPrice: 1999
    },
    {
      id: 4,
      name: "Dell XPS 13 Plus",
      price: 1299,
      stock: 0,
      warranty: "3 Years Premium Support",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
      rating: 4.4,
      reviews: 756,
      category: "Laptops",
      brand: "Dell",
      features: ["Intel Core i7", "OLED Display", "Zero Lattice", "Thunderbolt 4"],
      discount: 15,
      originalPrice: 1529
    },
    {
      id: 5,
      name: "iPad Pro 12.9\" M2",
      price: 1099,
      stock: 8,
      warranty: "1 Year Limited",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop",
      rating: 4.7,
      reviews: 1456,
      category: "Tablets",
      brand: "Apple",
      features: ["M2 Chip", "Liquid Retina", "Face ID", "Apple Pencil Ready"],
      discount: 10,
      originalPrice: 1229
    },
    {
      id: 6,
      name: "Sony WH-1000XM5",
      price: 349,
      stock: 35,
      warranty: "2 Years International",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4.8,
      reviews: 3421,
      category: "Audio",
      brand: "Sony",
      features: ["Industry Leading ANC", "30hr Battery", "Multipoint", "LDAC"],
      discount: 12,
      originalPrice: 399
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    if (stock < 10) return { text: `Only ${stock} left`, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSavings = () => {
    return cart.reduce((total, item) => {
      const savings = (item.originalPrice - item.price) * item.quantity;
      return total + savings;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TechMart</h1>
              <span className="ml-2 text-sm text-gray-500">Electronics & More</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Heart size={20} />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} products
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock);
            const isInCart = cart.some(item => item.id === product.id);
            const isFavorite = favorites.includes(product.id);
            
            return (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-[200px] w-full transition-transform duration-300"
                  />
                  
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-sm font-semibold">
                      {product.discount}% OFF
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart 
                      size={18} 
                      className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} 
                    />
                  </button>
                  
                  {/* Stock Status */}
                  <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor}`}>
                    {stockStatus.text}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-2">
                  {/* Brand & Category */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">{product.brand}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews.toLocaleString()})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                      {product.discount > 0 && (
                        <span className="text-lg text-gray-500 line-through">${product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
         
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      product.stock === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : isInCart
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {product.stock === 0 ? (
                      <span>Out of Stock</span>
                    ) : isInCart ? (
                      <>
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <div className={`fixed inset-0 z-50 ${isCartOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50 bg-opacity-50" onClick={() => setIsCartOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingCart size={64} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600">Start adding some products to your cart</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        <p className="text-lg font-semibold text-blue-600">${item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>${getTotalPrice().toLocaleString()}</span>
                  </div>
                  {getSavings() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Savings</span>
                      <span>-${getSavings().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">
                  Proceed to Checkout
                </button>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;