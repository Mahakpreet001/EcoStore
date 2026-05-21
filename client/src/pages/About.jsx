import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FaSeedling, FaBalanceScale, FaHandsHelping, FaGlobe, FaHeart, FaRocket } from 'react-icons/fa';
import Counter from '../animations/Counter';
import Footer from '../components/Footer';

const About = () => {
  const { scrollY } = useScroll();

  // Enhanced parallax transforms
  const yBg = useTransform(scrollY, [0, 1000], [0, -200]);
  const yHero = useTransform(scrollY, [0, 500], [0, -100]);
  const yStats = useTransform(scrollY, [500, 1000], [0, -50]);

  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30 };
  const smoothYBg = useSpring(yBg, springConfig);
  const smoothYHero = useSpring(yHero, springConfig);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
          className="absolute inset-0 bg-gradient-to-br from-green-600/80 via-blue-600/60 to-purple-700/50"
        ></motion.div>

        {/* Floating Particles */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-4 h-4 bg-white/30 rounded-full"
        ></motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, -15, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-32 right-32 w-6 h-6 bg-green-300/40 rounded-full"
        ></motion.div>
        <motion.div
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-1/2 right-20 w-3 h-3 bg-blue-300/50 rounded-full"
        ></motion.div>

        {/* Main Content */}
        <motion.div
          style={{ y: smoothYHero }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-lg font-semibold">
              🌍 Making the World Greener, One Product at a Time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            About
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block text-green-200"
            >
              EcoStore
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto"
          >
            Committed to sustainability and eco-friendly living since 2020
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Our Story
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 text-lg backdrop-blur-sm bg-white/10"
            >
              Our Impact
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Mission Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
          >
            Our Mission
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl mb-12 max-w-4xl mx-auto text-gray-700 leading-relaxed"
          >
            We are committed to providing sustainable products that help protect our planet. Every purchase you make contributes to a greener future, supporting eco-friendly manufacturers and reducing environmental impact.
          </motion.p>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaGlobe className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 text-green-800">Planet First</h3>
              <p className="text-gray-600">Every decision we make prioritizes environmental sustainability and long-term ecological health.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaHeart className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 text-blue-800">People Matter</h3>
              <p className="text-gray-600">We believe in fair trade, ethical sourcing, and supporting communities that care for our planet.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaRocket className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 text-purple-800">Innovation</h3>
              <p className="text-gray-600">We continuously innovate to create better, more sustainable products that do not compromise on quality.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <motion.section
        style={{ y: yStats }}
        className="py-20 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-white/90">Numbers that speak for our commitment to sustainability</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaSeedling className="text-white text-2xl" />
              </motion.div>
              <div className="text-5xl font-bold text-white mb-2">
                <Counter from={0} to={50000} />+
              </div>
              <p className="text-white/90 text-lg">Products Sold</p>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.5 }}
                className="h-1 bg-white/30 rounded-full mt-4"
              ></motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaBalanceScale className="text-white text-2xl" />
              </motion.div>
              <div className="text-5xl font-bold text-white mb-2">
                <Counter from={0} to={25000} />+
              </div>
              <p className="text-white/90 text-lg">CO2 Saved (kg)</p>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.7 }}
                className="h-1 bg-white/30 rounded-full mt-4"
              ></motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaHandsHelping className="text-white text-2xl" />
              </motion.div>
              <div className="text-5xl font-bold text-white mb-2">
                <Counter from={0} to={100} />+
              </div>
              <p className="text-white/90 text-lg">Partner Brands</p>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.9 }}
                className="h-1 bg-white/30 rounded-full mt-4"
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <FaSeedling className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Sustainability</h3>
              <p>Every product is chosen for its environmental impact and long-term viability.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <FaBalanceScale className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Quality</h3>
              <p>We never compromise on quality, ensuring our products last and serve you well.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 text-center"
            >
              <FaHandsHelping className="text-4xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Community</h3>
              <p>10% of all profits go directly to environmental charities and community projects.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;