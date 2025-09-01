const { UserPoints, PointsTransaction, UserProfile, Reward, UserReward, UserOrder } = require('../Model/UserProfileModel');
const User = require('../Model/UserModel');

// Get user dashboard summary
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user basic info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user points
    const userPoints = await UserPoints.findOne({ userId }) || {
      totalPoints: 0,
      availablePoints: 0,
      currentTier: 'Bronze'
    };

    // Get user profile
    const userProfile = await UserProfile.findOne({ userId });

    // Get recent orders
    const recentOrders = await UserOrder.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get points transactions for history
    const pointsHistory = await PointsTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate monthly stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await UserOrder.countDocuments({
      userId,
      createdAt: { $gte: currentMonth }
    });

    const monthlySpent = await UserOrder.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyPoints = await PointsTransaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'earned',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$points' }
        }
      }
    ]);

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        memberSince: userProfile?.membershipInfo?.memberSince || user.createdAt
      },
      points: userPoints,
      stats: {
        totalOrders: userProfile?.membershipInfo?.totalOrders || 0,
        totalSpent: userProfile?.membershipInfo?.totalSpent || 0,
        monthlyOrders,
        monthlySpent: monthlySpent[0]?.total || 0,
        monthlyPoints: monthlyPoints[0]?.total || 0
      },
      recentOrders,
      pointsHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user points details
const getUserPoints = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userPoints = await UserPoints.findOne({ userId });
    if (!userPoints) {
      return res.status(404).json({ message: 'User points not found' });
    }

    // Get points transactions
    const transactions = await PointsTransaction.find({ userId })
      .sort({ createdAt: -1 });

    // Get available rewards
    const availableRewards = await Reward.find({ isActive: true })
      .sort({ pointsCost: 1 });

    // Get user's redeemed rewards
    const redeemedRewards = await UserReward.find({ userId })
      .populate('rewardId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      points: userPoints,
      transactions,
      availableRewards,
      redeemedRewards
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await UserOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await UserOrder.countDocuments(query);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user,
      profile: userProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;

    // Update basic user info if provided
    if (updateData.name || updateData.email || updateData.mobile) {
      await User.findByIdAndUpdate(userId, {
        name: updateData.name,
        email: updateData.email,
        mobile: updateData.mobile,
        address: updateData.address
      });
    }

    // Update or create user profile
    const userProfile = await UserProfile.findOneAndUpdate(
      { userId },
      updateData.profile,
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Profile updated successfully', profile: userProfile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add points to user
const addPoints = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { points, source, description, orderId } = req.body;

    // Create points transaction
    const transaction = new PointsTransaction({
      userId,
      type: 'earned',
      points,
      source,
      description,
      orderId
    });
    await transaction.save();

    // Update user points
    let userPoints = await UserPoints.findOne({ userId });
    if (!userPoints) {
      userPoints = new UserPoints({ userId });
    }

    userPoints.totalPoints += points;
    userPoints.availablePoints += points;
    userPoints.lifetimeEarned += points;

    // Update tier based on total points
    if (userPoints.totalPoints >= 1000) {
      userPoints.currentTier = 'Platinum';
    } else if (userPoints.totalPoints >= 500) {
      userPoints.currentTier = 'Gold';
    } else if (userPoints.totalPoints >= 200) {
      userPoints.currentTier = 'Silver';
    } else {
      userPoints.currentTier = 'Bronze';
    }

    await userPoints.save();

    res.status(200).json({ message: 'Points added successfully', points: userPoints });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Redeem reward
const redeemReward = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { rewardId } = req.body;

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: 'Reward not found or inactive' });
    }

    const userPoints = await UserPoints.findOne({ userId });
    if (!userPoints || userPoints.availablePoints < reward.pointsCost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Check usage limits
    const userRedemptions = await UserReward.countDocuments({ userId, rewardId });
    if (userRedemptions >= reward.usageLimit.perUser) {
      return res.status(400).json({ message: 'Reward usage limit exceeded' });
    }

    // Create redemption record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.validityDays);

    const userReward = new UserReward({
      userId,
      rewardId,
      pointsUsed: reward.pointsCost,
      couponCode: `REWARD${Date.now()}`,
      expiresAt
    });
    await userReward.save();

    // Deduct points
    userPoints.availablePoints -= reward.pointsCost;
    userPoints.lifetimeRedeemed += reward.pointsCost;
    await userPoints.save();

    // Create points transaction
    const transaction = new PointsTransaction({
      userId,
      type: 'redeemed',
      points: reward.pointsCost,
      source: 'reward_redemption',
      description: `Redeemed: ${reward.name}`,
      rewardId
    });
    await transaction.save();

    // Update reward statistics
    reward.totalRedeemed += 1;
    await reward.save();

    res.status(200).json({ 
      message: 'Reward redeemed successfully', 
      userReward,
      remainingPoints: userPoints.availablePoints 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create user order
const createUserOrder = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderData = req.body;

    const userOrder = new UserOrder({
      userId,
      ...orderData,
      pointsEarned: Math.floor(orderData.totalAmount * 0.1) // 10% of amount as points
    });

    await userOrder.save();

    // Update user profile stats
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $inc: {
          'membershipInfo.totalOrders': 1,
          'membershipInfo.totalSpent': orderData.totalAmount
        }
      },
      { upsert: true }
    );

    // Add points for purchase
    if (userOrder.pointsEarned > 0) {
      await addPoints({
        params: { userId },
        body: {
          points: userOrder.pointsEarned,
          source: 'purchase',
          description: `Points earned from order ${userOrder.orderNumber}`,
          orderId: userOrder._id
        }
      }, { status: () => ({ json: () => {} }) });
    }

    res.status(201).json(userOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await UserOrder.findByIdAndUpdate(
      orderId,
      {
        status,
        trackingNumber,
        estimatedDelivery,
        ...(status === 'delivered' && { deliveredAt: new Date() })
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add order review
const addOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;

    const order = await UserOrder.findByIdAndUpdate(
      orderId,
      {
        rating,
        review,
        reviewDate: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Award points for review
    await addPoints({
      params: { userId: order.userId },
      body: {
        points: 10,
        source: 'review',
        description: `Review points for order ${order.orderNumber}`,
        orderId: order._id
      }
    }, { status: () => ({ json: () => {} }) });

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getUserDashboard,
  getUserPoints,
  getUserOrders,
  getUserProfile,
  updateUserProfile,
  addPoints,
  redeemReward,
  createUserOrder,
  updateOrderStatus,
  addOrderReview
};
