import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaLeaf, FaRecycle, FaTruck, FaShoppingCart } from 'react-icons/fa';
import Counter from '../animations/Counter';
import Footer from '../components/Footer';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { scrollY } = useScroll();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      toast.success('Thanks for subscribing to our newsletter! 🌿');
      e.target.reset();
    }
  };

  // Enhanced parallax transforms
  const yBg = useTransform(scrollY, [0, 1000], [0, -300]);
  const yText = useTransform(scrollY, [0, 1000], [0, -100]);
  const yFloating1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const yFloating2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yFloating3 = useTransform(scrollY, [0, 1000], [0, -250]);
  const rotateFloating = useTransform(scrollY, [0, 1000], [0, 360]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30 };
  const smoothYBg = useSpring(yBg, springConfig);
  const smoothYText = useSpring(yText, springConfig);

  useEffect(() => {
    api.get('/api/products?limit=3&sortBy=newest')
      .then(data => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Enhanced Hero Section with Advanced Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Layers */}
        <motion.div
          style={{
            y: smoothYBg,
            backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="absolute inset-0"
        ></motion.div>

        {/* Gradient Overlay */}
        <motion.div
          style={{ y: smoothYBg }}
          className="absolute inset-0 bg-gradient-to-br from-green-400/80 via-blue-500/60 to-purple-600/40"
        ></motion.div>

        {/* Floating Geometric Shapes */}
        <motion.div
          style={{ y: yFloating1, rotate: rotateFloating }}
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
        ></motion.div>
        <motion.div
          style={{ y: yFloating2 }}
          className="absolute bottom-32 right-32 w-24 h-24 bg-green-300/20 rounded-full blur-lg"
        ></motion.div>
        <motion.div
          style={{ y: yFloating3, rotate: rotateFloating }}
          className="absolute top-1/2 right-20 w-16 h-16 bg-blue-300/30 rounded-full blur-md"
        ></motion.div>

        {/* Main Content */}
        <motion.div
          style={{ y: smoothYText }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              🌱 Eco-Friendly Living Made Easy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Sustainable Living
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block text-green-200"
            >
              Starts Here
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto"
          >
            Discover eco-friendly products that make a difference in our planet&apos;s future
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/shop"
              className="group bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center">
                Shop Now
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 text-lg backdrop-blur-sm bg-white/10"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Enhanced Floating Elements */}
        <motion.div
          style={{ y: yFloating1 }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-32 left-16 text-6xl opacity-40"
        >
          🌿
        </motion.div>
        <motion.div
          style={{ y: yFloating2 }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-32 right-16 text-5xl opacity-35"
        >
          🌱
        </motion.div>
        <motion.div
          style={{ y: yFloating3 }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 20, 0]
          }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="absolute top-1/2 left-8 text-4xl opacity-30"
        >
          ♻️
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
            ></motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              🌿 Handpicked for You
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Products</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Bestsellers this week — each certified sustainable and loved by our community.
            </p>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Loading featured products…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
            >
              <FaShoppingCart />
              Browse All {' '} Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why EcoStore */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EcoStore?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-white p-6 rounded-lg shadow-md"
            >
              <FaLeaf size={48} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Eco Friendly</h3>
              <p>All our products are made from sustainable materials and processes.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center bg-white p-6 rounded-lg shadow-md"
            >
              <FaRecycle size={48} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Reusable Products</h3>
              <p>Designed for longevity and multiple uses, reducing waste.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center bg-white p-6 rounded-lg shadow-md"
            >
              <FaTruck size={48} className="text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Carbon Neutral Delivery</h3>
              <p>We offset carbon emissions from all our deliveries.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                <Counter from={0} to={10000} />+
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                <Counter from={0} to={5000} />+
              </div>
              <p className="text-gray-600">Trees Saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                <Counter from={0} to={2000} />+
              </div>
              <p className="text-gray-600">Orders Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4"
            >
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Sarah" className="w-16 h-16 rounded-full" />
              <div>
                <p className="text-gray-600 mb-4">&quot;EcoStore has amazing sustainable products. I love knowing I&apos;m making a positive impact!&quot;</p>
                <p className="font-semibold">- Sarah Johnson</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4"
            >
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" alt="Mike" className="w-16 h-16 rounded-full" />
              <div>
                <p className="text-gray-600 mb-4">&quot;The quality is excellent and the delivery is carbon neutral. Highly recommend!&quot;</p>
                <p className="font-semibold">- Mike Chen</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8">Subscribe to our newsletter for eco-tips and exclusive offers</p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-r-lg font-semibold transition whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;