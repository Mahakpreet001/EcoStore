/**
 * makeAdmin.js — Promote any existing user to admin role
 *
 * Usage:
 *   node makeAdmin.js user@example.com
 *
 * This script finds the user by email and sets their role to 'admin'.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
  console.error('❌  Usage: node makeAdmin.js <email>');
  console.error('   Example: node makeAdmin.js admin@ecostore.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecostore')
  .then(async () => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`❌  No user found with email: ${email}`);
      console.error('    Make sure the user has registered first.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️   ${user.name} (${user.email}) is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅  Success! ${user.name} (${user.email}) is now an admin.`);
    console.log('    They can log in and access /admin dashboard.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
