import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaHeart, FaCog, FaSignOutAlt, FaUserCircle, FaUserShield } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';

const Navbar = () => {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = Array.isArray(cart) ? cart : [];
  const wishlistItems = Array.isArray(wishlist) ? wishlist : [];
  const cartCount = cartItems.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
  const wishlistCount = wishlistItems.length;
  const displayCartCount = cartCount > 99 ? '99+' : cartCount;
  const displayWishlistCount = wishlistCount > 99 ? '99+' : wishlistCount;

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Scroll detection for hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
    setIsVisible(true);
  }, [location.pathname]);

  const desktopLinkClass = ({ isActive }) =>
    `text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-500 hover:to-purple-500 hover:bg-clip-text transition-all duration-300 font-medium relative group ${isActive ? 'text-green-600' : ''}`;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu') && !event.target.closest('.mobile-menu')) {
        setShowUserMenu(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center mr-4 lg:mr-10 shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <span className="text-white font-bold text-lg">E</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block group-hover:from-green-500 group-hover:via-blue-500 group-hover:to-purple-500 transition-all duration-300">
                EcoStore
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 shrink-0">
            <NavLink to="/" className={desktopLinkClass}>
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink to="/shop" className={desktopLinkClass}>
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink to="/about" className={desktopLinkClass}>
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink to="/contact" className={desktopLinkClass}>
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 border-2 border-gray-200/50 rounded-full focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-300 text-sm bg-white/70 backdrop-blur-sm"
                />
                <button type="submit" className="absolute left-4 top-3.5 text-gray-400 hover:text-green-500 transition-colors duration-200">
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>

          {/* Cart and Auth */}
          <div className="flex items-center space-x-6">
            {/* Wishlist */}
            <motion.div whileHover={{ scale: 1.1 }} className="hidden md:block relative">
              <Link to="/wishlist" className="relative flex items-center justify-center text-gray-700 hover:text-red-500 transition-all duration-300 p-2 rounded-full hover:bg-red-50">
                <FaHeart size={20} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {displayWishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <Link to="/cart" className="relative flex items-center justify-center text-gray-700 hover:text-green-600 transition-all duration-300 p-2 rounded-full hover:bg-green-50">
                <FaShoppingCart size={24} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {displayCartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {user ? (
              <div className="relative user-menu">
                <motion.button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-all duration-300 p-2 rounded-full hover:bg-green-50"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <FaUserCircle className="text-white" size={16} />
                  </div>
                  <span className="hidden md:block font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-3 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="mr-3 text-green-500" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaShoppingCart className="mr-3 text-blue-500" />
                        Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaHeart className="mr-3 text-red-500" />
                        Wishlist
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaCog className="mr-3 text-purple-500" />
                        Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 rounded-lg mx-2 font-semibold shadow-sm mt-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUserShield className="mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-200/50 my-2 mx-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 rounded-lg mx-2"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium px-6 py-2 rounded-full hover:bg-green-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              {isOpen ? <FaTimes className="text-gray-700" size={20} /> : <FaBars className="text-gray-700" size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl mobile-menu shadow-lg"
            >
              <div className="px-4 pt-4 pb-6 space-y-3">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                      />
                      <button type="submit" className="absolute left-4 top-3.5 text-gray-400">
                        <FaSearch />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Mobile Menu Links */}
                <Link
                  to="/"
                  className="block px-4 py-3 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-500 hover:to-purple-500 hover:bg-clip-text transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 font-medium"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="block px-4 py-3 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-500 hover:to-purple-500 hover:bg-clip-text transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-medium"
                  onClick={toggleMenu}
                >
                  Shop
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-3 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-500 hover:to-purple-500 hover:bg-clip-text transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 font-medium"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-3 text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-500 hover:to-purple-500 hover:bg-clip-text transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 font-medium"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>

                {/* Mobile Auth */}
                {user ? (
                  <div className="px-3 py-4 space-y-3 border-t border-gray-200/50 pt-6 mt-6">
                    <div className="flex items-center space-x-4 mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <FaUserCircle className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600 transition-all duration-300 rounded-2xl"
                      onClick={toggleMenu}
                    >
                      <FaUser className="mr-3 text-green-500" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 rounded-2xl"
                      onClick={toggleMenu}
                    >
                      <FaShoppingCart className="mr-3 text-blue-500" />
                      Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 rounded-2xl"
                      onClick={toggleMenu}
                    >
                      <FaHeart className="mr-3 text-red-500" />
                      Wishlist
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-300 rounded-2xl"
                      onClick={toggleMenu}
                    >
                      <FaCog className="mr-3 text-purple-500" />
                      Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center w-full px-4 py-3 text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 rounded-2xl font-semibold shadow-sm"
                        onClick={toggleMenu}
                      >
                        <FaUserShield className="mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); toggleMenu(); }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 rounded-2xl"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-4 space-y-3 border-t border-gray-200/50 pt-6 mt-6">
                    <Link
                      to="/login"
                      className="block w-full text-center text-gray-700 hover:text-green-600 transition-all duration-300 py-3 rounded-2xl hover:bg-green-50 font-medium"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
                      onClick={toggleMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;