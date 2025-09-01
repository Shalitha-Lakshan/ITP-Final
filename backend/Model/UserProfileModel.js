const mongoose = require('mongoose');

// User Points Schema
const userPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimeEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetimeRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  currentTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  tierProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Points Transaction Schema
const pointsTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'bonus'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    enum: ['purchase', 'referral', 'review', 'bonus', 'reward_redemption', 'signup_bonus'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward'
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'used'],
    default: 'active'
  }
}, {
  timestamps: true
});

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    profilePicture: String
  },
  contactInfo: {
    primaryPhone: String,
    secondaryPhone: String,
    alternateEmail: String
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'billing', 'shipping'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  preferences: {
    emailNotifications: {
      orderUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: false
      },
      pointsUpdates: {
        type: Boolean,
        default: true
      }
    },
    smsNotifications: {
      orderUpdates: {
        type: Boolean,
        default: false
      },
      promotions: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'English'
    },
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  membershipInfo: {
    memberSince: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date,
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    favoriteCategories: [String],
    loyaltyStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    lastPasswordChange: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: Date
  }
}, {
  timestamps: true
});

// Reward Schema
const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['discount', 'free_shipping', 'gift_card', 'product', 'cashback'],
    required: true
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  value: {
    type: Number,
    required: true
  },
  discountPercentage: Number,
  maxDiscountAmount: Number,
  minimumPurchase: {
    type: Number,
    default: 0
  },
  validityDays: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stockQuantity: Number,
  usageLimit: {
    perUser: {
      type: Number,
      default: 1
    },
    total: Number
  },
  totalRedeemed: {
    type: Number,
    default: 0
  },
  termsAndConditions: String,
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

// User Reward Redemption Schema
const userRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  pointsUsed: {
    type: Number,
    required: true
  },
  couponCode: String,
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  },
  usedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  }
}, {
  timestamps: true
});

// User Order Schema (extending sales orders for user dashboard)
const userOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: true
  },
  orderNumber: String,
  items: [{
    productName: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  totalAmount: Number,
  pointsEarned: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewDate: Date
}, {
  timestamps: true
});

const UserPoints = mongoose.model('UserPoints', userPointsSchema);
const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const Reward = mongoose.model('Reward', rewardSchema);
const UserReward = mongoose.model('UserReward', userRewardSchema);
const UserOrder = mongoose.model('UserOrder', userOrderSchema);

module.exports = {
  UserPoints,
  PointsTransaction,
  UserProfile,
  Reward,
  UserReward,
  UserOrder
};
