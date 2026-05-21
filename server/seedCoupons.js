require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

// Set expiry date to 1 year from now
const oneYear = new Date();
oneYear.setFullYear(oneYear.getFullYear() + 1);

const coupons = [
  {
    code: 'ECO10',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 200,
    maxUses: 500,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'ECO50',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: 300,
    maxUses: 200,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'GREEN20',
    discountType: 'percent',
    discountValue: 20,
    minOrderAmount: 500,
    maxUses: 100,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'WELCOME',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 499,
    maxUses: 1000,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'SAVE15',
    discountType: 'percent',
    discountValue: 15,
    minOrderAmount: 750,
    maxUses: 300,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'FLAT200',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 1500,
    maxUses: 150,
    expiresAt: oneYear,
    isActive: true,
  },
  {
    code: 'EARTH25',
    discountType: 'percent',
    discountValue: 25,
    minOrderAmount: 999,
    maxUses: 50,
    expiresAt: oneYear,
    isActive: true,
  },
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecostore')
  .then(async () => {
    console.log('MongoDB connected');
    await Coupon.deleteMany({});
    const inserted = await Coupon.insertMany(coupons);
    console.log(`✓ Seeded ${inserted.length} coupons:`);
    inserted.forEach(c => {
      const type = c.discountType === 'percent' ? `${c.discountValue}% off` : `₹${c.discountValue} off`;
      console.log(`  ${c.code} — ${type} (min ₹${c.minOrderAmount}, max ${c.maxUses} uses)`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Coupon seed error:', err.message);
    process.exit(1);
  });
