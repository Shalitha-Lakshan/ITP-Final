const mongoose = require('mongoose');

// Payment Transaction Schema
const paymentTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash', 'Check'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['Stripe', 'PayPal', 'Square', 'Bank', 'Cash', 'Other']
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  gatewayTransactionId: String,
  gatewayResponse: {
    code: String,
    message: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    gatewayFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  netAmount: {
    type: Number,
    required: true
  },
  processedAt: Date,
  failureReason: String,
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    reason: String
  }
}, {
  timestamps: true
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: Date,
  notes: String,
  terms: String
}, {
  timestamps: true
});

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Cash'],
    required: true
  },
  provider: String,
  isActive: {
    type: Boolean,
    default: true
  },
  configuration: {
    apiKey: String,
    secretKey: String,
    merchantId: String,
    webhookUrl: String,
    settings: mongoose.Schema.Types.Mixed
  },
  fees: {
    percentage: {
      type: Number,
      default: 0
    },
    fixedAmount: {
      type: Number,
      default: 0
    }
  },
  limits: {
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: Number,
    dailyLimit: Number
  }
}, {
  timestamps: true
});

// Payment Analytics Schema
const paymentAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalReceived: {
    type: Number,
    default: 0
  },
  totalPending: {
    type: Number,
    default: 0
  },
  totalFailed: {
    type: Number,
    default: 0
  },
  totalRefunded: {
    type: Number,
    default: 0
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  averageTransactionValue: {
    type: Number,
    default: 0
  },
  paymentMethodBreakdown: [{
    method: String,
    amount: Number,
    count: Number,
    percentage: Number
  }],
  fees: {
    totalFees: {
      type: Number,
      default: 0
    },
    processingFees: {
      type: Number,
      default: 0
    },
    gatewayFees: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
const PaymentAnalytics = mongoose.model('PaymentAnalytics', paymentAnalyticsSchema);

module.exports = {
  PaymentTransaction,
  Invoice,
  PaymentMethod,
  PaymentAnalytics
};
