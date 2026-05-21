import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaStar, FaBolt } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { getTagConfig } from '../utils/ecoTagConfig';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  if (!product?.name || !product?.image) return null;

  const tagCfg    = getTagConfig(product.ecoTag);
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const lowStock   = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    await addToCart(product, 1);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl overflow-hidden flex flex-col group transition-shadow duration-300"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-gray-50" style={{ paddingBottom: '75%' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Eco badge — top-left */}
        <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-sm
          ${tagCfg.bg} ${tagCfg.text} ${tagCfg.border}`}
        >
          {tagCfg.emoji} {product.ecoTag}
        </span>

        {/* Wishlist — top-right */}
        <motion.button
          onClick={toggleWishlist}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all
            ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-300 hover:text-red-500'}`}
        >
          <FaHeart className="text-sm" />
        </motion.button>

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/65 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide shadow">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick Add — slides up from bottom on hover */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 text-xs font-bold tracking-wide transition-colors"
            >
              <FaBolt className="text-yellow-300" />
              QUICK ADD TO CART
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category */}
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1 truncate">
          {product.category}
        </p>

        {/* Product name */}
        <h3
          className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-2.5 group-hover:text-green-700 transition-colors"
          style={{ minHeight: '2.5rem' }}
        >
          {product.name}
        </h3>

        {/* Rating — Flipkart-style colored badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold text-white leading-none
            ${product.rating >= 4.5 ? 'bg-green-600' : product.rating >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
          >
            {product.rating.toFixed(1)}&thinsp;<FaStar className="text-[8px] mb-px" />
          </span>
          <span className="text-xs text-gray-400">
            ({product.numReviews.toLocaleString()})
          </span>
          {lowStock && (
            <span className="ml-auto text-[10px] text-orange-600 font-bold whitespace-nowrap">
              Only {product.stock} left!
            </span>
          )}
        </div>

        {/* Price — Amazon-style hierarchy */}
        <div className="flex items-baseline gap-1.5 mb-4 mt-auto">
          <span className="text-xl font-extrabold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-gray-400">incl. taxes</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 py-2.5 text-center text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all"
          >
            Details
          </Link>
          <motion.button
            onClick={handleAddToCart}
            disabled={outOfStock}
            whileHover={{ scale: outOfStock ? 1 : 1.03 }}
            whileTap={{ scale: outOfStock ? 1 : 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-bold shadow hover:shadow-md hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaShoppingCart className="text-[10px]" />
            {outOfStock ? 'Sold Out' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
