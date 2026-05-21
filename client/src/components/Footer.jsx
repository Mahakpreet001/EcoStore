import { Link } from 'react-router-dom';
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <FaLeaf className="text-white text-sm" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                EcoStore
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Sustainable products for a better planet. Every purchase supports eco-friendly manufacturing and a greener future.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200">
                <FaFacebook className="text-sm" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200">
                <FaInstagram className="text-sm" />
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200">
                <FaYoutube className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/cart', label: 'My Cart' },
                { to: '/orders', label: 'My Orders' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Categories</h4>
            <ul className="space-y-2.5">
              {[
                'Reusable Products',
                'Personal Care',
                'Eco Home',
                'Sustainable Fashion',
                'Organic Food',
                'Electronics',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">Get eco tips and exclusive offers in your inbox.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}
              className="flex gap-2 mb-6"
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                aria-label="Subscribe"
              >
                <FaEnvelope className="text-sm" />
              </button>
            </form>

            <div className="space-y-2 text-sm text-gray-400">
              <p>📧 support@ecostore.com</p>
              <p>📞 +91 98765 43210</p>
              <p>🕒 Mon–Fri: 9AM – 6PM IST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© 2026 EcoStore. All rights reserved. 🌱 Made for a greener planet.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-green-400 transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;