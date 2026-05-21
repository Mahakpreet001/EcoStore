import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch from backend if logged in, otherwise from localStorage
  const fetchWishlist = useCallback(async () => {
    if (user?.token) {
      try {
        const data = await api.get('/api/wishlist');
        setWishlist(data);
      } catch {
        setWishlist([]);
      }
    } else {
      try {
        const saved = localStorage.getItem('wishlist');
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      }
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const addToWishlist = async (product) => {
    const id = String(product.id || product._id);
    if (wishlist.some(item => String(item.id) === id)) return;

    if (user?.token) {
      try {
        const data = await api.post('/api/wishlist/add', { productId: id });
        setWishlist(data);
        toast.success('Added to wishlist!');
      } catch (err) {
        toast.error(err.message || 'Failed to add to wishlist.');
      }
    } else {
      const updated = [...wishlist, product];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      toast.success('Added to wishlist!');
    }
  };

  const removeFromWishlist = async (id) => {
    const strId = String(id);
    if (user?.token) {
      try {
        const data = await api.delete(`/api/wishlist/${strId}`);
        setWishlist(data);
      } catch (err) {
        toast.error(err.message || 'Failed to remove from wishlist.');
      }
    } else {
      const updated = wishlist.filter(item => String(item.id) !== strId);
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  const isInWishlist = (id) => wishlist.some(item => String(item.id) === String(id));

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
