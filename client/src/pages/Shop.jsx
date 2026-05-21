import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaSearch, FaFilter,
  FaLeaf, FaRecycle, FaTree, FaChevronLeft, FaChevronRight, FaTimes,
} from 'react-icons/fa';
import { api } from '../services/api';
import { getTagConfig, ECO_TAG_CONFIG } from '../utils/ecoTagConfig';
import ProductCard from '../components/ProductCard';

const LIMIT = 12;

// ── Main Component ────────────────────────────────────────────────────

const Shop = () => {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [allTags, setAllTags]           = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, page: 1, pages: 1, hasNext: false, hasPrev: false });
  const [selectedCategory, setCategory] = useState('');
  const [selectedTag, setTag]           = useState('');
  const [searchTerm, setSearch]         = useState('');
  const [sortBy, setSort]               = useState('name');
  const [priceRange, setPriceRange]     = useState([0, 10000]);
  const [showFilters, setShowFilters]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [searchParams]                  = useSearchParams();


  const { scrollYProgress } = useScroll();
  const bgY       = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOp    = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const floatingY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), { stiffness: 80, damping: 24 });

  // Sync search param from navbar
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT, sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange[1] < 10000 && { maxPrice: priceRange[1] }),
      });
      const data = await api.get(`/api/products?${params}`);
      const tagFiltered = selectedTag
        ? data.products.filter(p => p.ecoTag === selectedTag)
        : data.products;
      setProducts(tagFiltered);
      setPagination(data.pagination);
      // Collect unique tags from this result set
      const tags = [...new Set(data.products.map(p => p.ecoTag))].filter(Boolean);
      setAllTags(prev => [...new Set([...prev, ...tags])]);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedCategory, searchTerm, priceRange, selectedTag]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    api.get('/api/categories').then(setCategories).catch(() => {});
  }, []);
  useEffect(() => { setPage(1); }, [selectedCategory, selectedTag, searchTerm, sortBy, priceRange]);

  const clearFilters = () => {
    setCategory(''); setTag(''); setSort('name');
    setPriceRange([0, 10000]); setSearch(''); setPage(1);
  };

  const activeFilterCount = [selectedCategory, selectedTag, searchTerm,
    priceRange[0] > 0, priceRange[1] < 10000].filter(Boolean).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div style={{ y: bgY }}       className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-green-300/20 blur-3xl pointer-events-none" />
      <motion.div style={{ y: floatingY }} className="absolute top-1/3 -right-16 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <motion.div style={{ y: heroY, opacity: heroOp }}
        className="relative h-80 md:h-96 overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="mb-4 inline-block">
              <FaLeaf className="text-5xl md:text-6xl text-green-300" />
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              EcoStore Shop
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-6">
              {pagination.total > 0 ? `${pagination.total} sustainable products and counting` : 'Discover products for a better tomorrow'}
            </p>
            <div className="flex justify-center gap-6 text-green-200 text-sm">
              <span className="flex items-center gap-1.5"><FaRecycle /> Eco-Friendly</span>
              <span className="flex items-center gap-1.5"><FaTree /> Sustainable</span>
              <span className="flex items-center gap-1.5"><FaLeaf /> Planet-First</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 md:-mt-16 relative z-10 pb-16">

        {/* ── Filter Panel ── */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 mb-10 border border-white/30"
        >
          {/* Row 1: search + category + sort + buttons */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search eco-friendly products..."
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>

            <select value={selectedCategory} onChange={e => setCategory(e.target.value)}
              className="px-5 py-3.5 border-2 border-gray-200 rounded-2xl bg-white text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={sortBy} onChange={e => setSort(e.target.value)}
              className="px-5 py-3.5 border-2 border-gray-200 rounded-2xl bg-white text-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>

            <button onClick={() => setShowFilters(s => !s)}
              className="relative flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all shadow-lg font-semibold text-sm"
            >
              <FaFilter />
              More Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="px-5 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all font-semibold text-sm flex items-center gap-1"
              >
                <FaTimes className="text-xs" /> Clear
              </button>
            )}
          </div>

          {/* Row 2: Eco Tag quick filters */}
          {allTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.keys(ECO_TAG_CONFIG).filter(t => allTags.includes(t)).map(tag => {
                const cfg = getTagConfig(tag);
                const active = selectedTag === tag;
                return (
                  <button key={tag} onClick={() => setTag(active ? '' : tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${active
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ${cfg.border} shadow-sm`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {cfg.emoji} {tag}
                    {active && <FaTimes className="ml-0.5 text-xs opacity-70" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Advanced filters (collapsible) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price range */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-5 rounded-2xl border border-green-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Price Range (₹)</p>
                    <div className="flex gap-3 items-center">
                      <input type="number" placeholder="Min" value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 bg-white"
                      />
                      <span className="text-gray-400 font-bold">—</span>
                      <input type="number" placeholder="Max" value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</p>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex justify-between"><span>Total</span><span className="font-bold text-purple-600">{pagination.total} products</span></div>
                      <div className="flex justify-between"><span>Showing</span><span className="font-bold text-purple-600">{products.length} results</span></div>
                      <div className="flex justify-between"><span>Categories</span><span className="font-bold text-purple-600">{categories.length}</span></div>
                      <div className="flex justify-between"><span>Eco Tags</span><span className="font-bold text-purple-600">{allTags.length}</span></div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl border border-yellow-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">🌍 Eco Tip</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Every product here is verified sustainable. Filter by Eco Tag to find exactly what aligns with your values.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results summary */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-2 px-1">
          <p className="text-gray-600 text-sm">
            {loading ? 'Loading...' : `Showing ${products.length} of ${pagination.total} products`}
            {selectedTag && <span className="ml-2 font-medium text-green-700">· {selectedTag}</span>}
            {selectedCategory && <span className="ml-2 font-medium text-blue-700">· {selectedCategory}</span>}
            {pagination.pages > 1 && <span className="ml-2 text-gray-400">· Page {pagination.page}/{pagination.pages}</span>}
          </p>
        </div>

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-md overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition font-semibold">
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(p => p.name && p.image).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination.pages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-3 mt-12"
          >
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
            >
              <FaChevronLeft className="text-xs" /> Prev
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                    ${p === pagination.page
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
                      : 'border-2 border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
            >
              Next <FaChevronRight className="text-xs" />
            </button>
          </motion.div>
        )}

        {/* ── Bottom CTA ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-14 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl p-8 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Shop Smarter, Live Greener</h3>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Filter by Eco Tag to find products matching your values — biodegradable, organic, recycled, and more.
            Every purchase here directly supports sustainable manufacturing.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;
