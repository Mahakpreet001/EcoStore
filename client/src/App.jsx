import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageParallax from './components/PageParallax';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }}
            />
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PageParallax><Home /></PageParallax>} />
              <Route path="/shop" element={<PageParallax><Shop /></PageParallax>} />
              <Route path="/product/:id" element={<PageParallax><ProductDetails /></PageParallax>} />
              <Route path="/about" element={<PageParallax><About /></PageParallax>} />
              <Route path="/contact" element={<PageParallax><Contact /></PageParallax>} />
              <Route path="/login" element={<PageParallax><Login /></PageParallax>} />
              <Route path="/signup" element={<PageParallax><Signup /></PageParallax>} />

              {/* Protected routes — redirect to /login if not authenticated */}
              <Route path="/cart" element={<ProtectedRoute><PageParallax><Cart /></PageParallax></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><PageParallax><Wishlist /></PageParallax></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><PageParallax><Profile /></PageParallax></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><PageParallax><Orders /></PageParallax></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><PageParallax><Checkout /></PageParallax></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="/order-failure" element={<ProtectedRoute><OrderFailure /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PageParallax><Settings /></PageParallax></ProtectedRoute>} />

              {/* Admin-only route */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
