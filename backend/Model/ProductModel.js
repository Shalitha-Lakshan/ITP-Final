const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: [/^[A-Za-z\s]+$/, 'Product name can only contain letters and spaces']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
    max: [9999.99, 'Price cannot exceed 4 digits']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Household Items',
      'Fashion & Accessories', 
      'Furniture & Home Decor',
      'Construction Materials',
      'Stationery & Office Supplies',
      'Outdoor & Travel',
      'Toys & Kids Items'
    ]
  },
  imageUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  points: {
    type: Number,
    min: [0, 'Reward points cannot be negative'],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
