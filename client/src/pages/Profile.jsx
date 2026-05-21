import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaCheck, FaTimes, FaLeaf, FaShoppingBag } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      await updateProfile(name.trim());
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEditing(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/40">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600" />

          <div className="relative px-6 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl text-white font-bold select-none">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </div>

            {/* Name & Edit */}
            <div className="text-center mb-6">
              {editing ? (
                <div className="flex items-center justify-center gap-3 mb-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    className="text-2xl font-bold text-center border-b-2 border-green-500 focus:outline-none bg-transparent text-gray-800 w-64"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition disabled:opacity-50"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-green-600 transition rounded-full hover:bg-green-50"
                    title="Edit name"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <FaLeaf /> Eco-Warrior Status: Bronze
              </div>
              {user?.role === 'admin' && (
                <div className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                  Admin
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-5 text-center border border-green-100">
                <FaShoppingBag className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{cart.length}</p>
                <p className="text-sm text-gray-500">Items in Cart</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 text-center border border-blue-100">
                <FaLeaf className="text-2xl text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">₹{cartTotal.toFixed(0)}</p>
                <p className="text-sm text-gray-500">Cart Value</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="font-medium text-gray-800 text-sm">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Account Type</span>
                  <span className="font-medium text-gray-800 text-sm capitalize">{user?.role || 'User'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 text-sm">Member Since</span>
                  <span className="font-medium text-gray-800 text-sm">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                      : 'EcoStore Community'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
