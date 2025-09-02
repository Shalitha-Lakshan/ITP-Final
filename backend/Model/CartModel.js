const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  imageUrl: {
    type: String
  },
  description: {
    type: String
  },
  userId: {
    type: String,
    default: 'guest' // For now, using guest user
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CartItem', cartItemSchema);
