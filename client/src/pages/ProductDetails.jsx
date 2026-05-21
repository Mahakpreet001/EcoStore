import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaStar, FaShoppingCart, FaHeart, FaArrowLeft,
  FaLeaf, FaShieldAlt, FaTruck, FaUndo,
} from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { api } from '../services/api';
import { getTagConfig } from '../utils/ecoTagConfig';
import toast from 'react-hot-toast';

const TRUST_BADGES = [
  { icon: <FaTruck />,    label: 'Free shipping', sub: 'on orders over ₹500' },
  { icon: <FaUndo />,     label: '7-day returns', sub: 'no questions asked'  },
  { icon: <FaShieldAlt />, label: 'Secure checkout', sub: 'SSL encrypted'    },
  { icon: <FaLeaf />,     label: 'Carbon offset',  sub: 'on every order'     },
];

const StarRow = ({ rating, numReviews }) => (
  <div className="flex items-center gap-2">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(s => (
        <FaStar key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
    <span className="text-sm font-semibold text-gray-700">{rating?.toFixed(1)}</span>
    <span className="text-sm text-gray-400">({numReviews} reviews)</span>
  </div>
);

const ProductDetails = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  const { addToCart }                                 = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/products/${id}`)
      .then(data => setProduct(data))
      .catch(() => toast.error('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">Product not found.</p>
        <button onClick={() => navigate('/shop')} className="text-green-600 hover:underline font-semibold">
          ← Back to Shop
        </button>
      </div>
    );
  }

  const tagConfig  = getTagConfig(product.ecoTag);
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const lowStock   = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = async () => {
    if (outOfStock) return;
    await addToCart(product, quantity);
  };

  const toggleWishlist = () =>
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition mb-8 group font-medium text-sm"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ── Left: Image ── */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative bg-gray-100">
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
            <img
              src={product.image}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.onerror = null; e.target.src = '/placeholder.svg'; setImgLoaded(true); }}
              className={`w-full h-80 md:h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ minHeight: '420px' }}
            />

            {/* Eco tag overlay */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border shadow-md
                ${tagConfig.bg} ${tagConfig.text} ${tagConfig.border}`}
              >
                {tagConfig.emoji} {product.ecoTag}
              </span>
            </div>

            {/* Wishlist */}
            <motion.button onClick={toggleWishlist} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all
                ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <FaHeart className="text-lg" />
            </motion.button>
          </motion.div>

          {/* ── Right: Details ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="p-8 md:p-10 flex flex-col"
          >
            {/* Category */}
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">{product.category}</p>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-snug">{product.name}</h1>

            {/* Stars */}
            <StarRow rating={product.rating} numReviews={product.numReviews} />

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mt-4 mb-6 text-sm">{product.description}</p>

            {/* Eco tag detail */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-6 ${tagConfig.bg} ${tagConfig.border}`}>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${tagConfig.bg} border ${tagConfig.border}`}>
                {tagConfig.emoji}
              </span>
              <div>
                <p className={`font-semibold text-sm ${tagConfig.text}`}>{product.ecoTag} Certified</p>
                <p className="text-xs text-gray-500 mt-0.5">This product meets verified sustainability standards</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-green-600">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-400 mb-1">incl. all taxes</span>
            </div>

            {/* Stock */}
            {outOfStock && (
              <p className="text-sm font-semibold text-red-600 mb-4">⚠ Currently out of stock</p>
            )}
            {lowStock && (
              <p className="text-sm font-semibold text-orange-600 mb-4">🔥 Only {product.stock} left in stock!</p>
            )}

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-600">Quantity</span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-1 border border-gray-200">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 mb-8">
              <motion.button onClick={handleAddToCart} disabled={outOfStock}
                whileHover={{ scale: outOfStock ? 1 : 1.02 }} whileTap={{ scale: outOfStock ? 1 : 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:from-green-600 hover:to-blue-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShoppingCart />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </motion.button>

              <motion.button onClick={toggleWishlist}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-5 py-3.5 rounded-2xl border-2 transition-all font-semibold text-sm
                  ${inWishlist
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                    : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                  }`}
              >
                <FaHeart />
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {TRUST_BADGES.map(badge => (
                <div key={badge.label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-green-500 text-base">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{badge.label}</p>
                    <p className="text-xs text-gray-400">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
