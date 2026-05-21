const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, trim: true },
  image:       { type: String, required: true },
  description: { type: String, required: true },
  ecoTag:      { type: String, required: true, trim: true },
  rating:      { type: Number, default: 4.5, min: 0, max: 5 },
  numReviews:  { type: Number, default: 0 },
  stock:       { type: Number, default: 100, min: 0 },
}, { timestamps: true });

// Indexes for frequent query patterns
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
