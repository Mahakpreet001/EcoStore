import { motion } from 'framer-motion';
import { FaCog, FaBell, FaShieldAlt, FaPalette } from 'react-icons/fa';

const Settings = () => {
  const dummySections = [
    { icon: <FaBell />, title: 'Notifications', desc: 'Manage email alerts and order updates' },
    { icon: <FaShieldAlt />, title: 'Privacy & Security', desc: 'Password updates and 2FA' },
    { icon: <FaPalette />, title: 'Appearance', desc: 'Dark mode and theme preferences' },
  ];

  return (
    <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gray-700">
            <FaCog size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        </div>

        <div className="grid gap-6">
          {dummySections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-6 border border-gray-100/50"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 text-xl">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{section.title}</h3>
                <p className="text-gray-500 text-sm">{section.desc}</p>
              </div>
              <div className="text-gray-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-sm">
          <h3 className="text-blue-800 font-semibold mb-2">Settings Panel Under Construction</h3>
          <p className="text-blue-600/80 text-sm">
            The settings portal is a placeholder for your Phase 1 demo. Full configuration options will be rolling out in Phase 2!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
