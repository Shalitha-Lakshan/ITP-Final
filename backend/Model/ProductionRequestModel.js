const mongoose = require('mongoose');

const productionRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  team: {
    type: String,
    required: true
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  requestedQty: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  notes: {
    type: String,
    default: ''
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  approvedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique request ID before saving
productionRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    try {
      const count = await this.constructor.countDocuments();
      this.requestId = `PR-${Date.now()}-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating requestId:', error);
      this.requestId = `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  next();
});

module.exports = mongoose.model('ProductionRequest', productionRequestSchema);
