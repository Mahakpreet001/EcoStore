import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';

const CART_CACHE_KEY = 'eco_cart_cache';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const cached = localStorage.getItem(CART_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const { user } = useContext(AuthContext);

  const setCartAndCache = (cartData) => {
    setCart(cartData);
    try { localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cartData)); } catch {}
  };

  const fetchCart = useCallback(async () => {
    if (!user?.token) { setCartAndCache([]); return; }
    try {
      const data = await api.get('/api/cart');
      setCartAndCache(data);
    } catch {
      // keep cached cart on network error
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!user?.token) { toast.error('Please login to add to cart'); return; }
    try {
      const updatedCart = await api.post('/api/cart/add', { productId: product.id || product._id, quantity });
      setCartAndCache(updatedCart);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart.');
    }
  };

  const removeFromCart = async (id) => {
    try {
      const updatedCart = await api.delete(`/api/cart/${id}`);
      setCartAndCache(updatedCart);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item.');
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const updatedCart = await api.put('/api/cart/update', { productId: id, quantity });
      setCartAndCache(updatedCart);
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity.');
    }
  };

  const clearCart = () => setCartAndCache([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
