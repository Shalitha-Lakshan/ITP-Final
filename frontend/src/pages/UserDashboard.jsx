// src/components/user/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  User, Award, ShoppingBag, Clock, Star, Gift, CreditCard, 
  MapPin, Phone, Mail, Edit, Eye, Download, Save, X, Loader2, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import LogoutButton from "../components/common/LogoutButton";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [pointsBreakdown, setPointsBreakdown] = useState([]);
  const [rewardTiers, setRewardTiers] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const { user, token, updateUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nic: user?.nic || '',
    phone: user?.phone || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    },
    memberSince: user?.createdAt || new Date().toISOString(),
    totalPoints: user?.points || 0,
    currentTier: calculateTier(user?.points || 0),
    totalOrders: user?.totalOrders || 0,
    totalSpent: user?.totalSpent || 0
  });

  // Calculate user tier based on points
  function calculateTier(points) {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  }

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch user's points history
  const fetchPointsHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/points/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch points history');
      }
      
      const data = await response.json();
      setPointsHistory(data);
    } catch (error) {
      console.error('Error fetching points history:', error);
      toast.error('Failed to load points history');
    }
  };

  // Fetch points breakdown
  const fetchPointsBreakdown = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/points/breakdown`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch points breakdown');
      }
      
      const data = await response.json();
      setPointsBreakdown(data);
    } catch (error) {
      console.error('Error fetching points breakdown:', error);
      toast.error('Failed to load points breakdown');
    }
  };

  // Fetch available rewards
  const fetchAvailableRewards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available rewards');
      }
      
      const data = await response.json();
      setAvailableRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load available rewards');
    }
  };

  // Fetch reward tiers
  const fetchRewardTiers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/tiers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reward tiers');
      }
      
      const data = await response.json();
      setRewardTiers(data);
    } catch (error) {
      console.error('Error fetching reward tiers:', error);
      toast.error('Failed to load reward tiers');
      // Set default tiers if API fails
      setRewardTiers([
        { name: "Bronze", minPoints: 0, maxPoints: 199, benefits: ["5% Discount", "Free Shipping on LKR 5,000+"] },
        { name: "Silver", minPoints: 200, maxPoints: 499, benefits: ["10% Discount", "Free Shipping", "Priority Support"] },
        { name: "Gold", minPoints: 500, maxPoints: 999, benefits: ["15% Discount", "Free Shipping", "Early Access", "Birthday Bonus"] },
        { name: "Platinum", minPoints: 1000, maxPoints: null, benefits: ["20% Discount", "Free Shipping", "VIP Support", "Exclusive Products"] },
      ]);
    }
  };

  // Fetch user's orders from salesorders table
  const fetchUserOrders = async () => {
    if (!user?._id || !token) {
      console.error('Missing user ID or token');
      setError('Authentication error. Please log in again.');
      return;
    }
    
    try {
      console.log('Fetching sales orders for user:', user._id);
      setIsOrdersLoading(true);
      setError(null);
      
      // Using salesorders endpoint with customer ID filter
      const response = await fetch(`${API_BASE_URL}/sales/orders?customerId=${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Orders API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Orders API response data:', data);
      
      // Handle both array and object responses
      const ordersData = Array.isArray(data) ? data : (data.orders || data.data || []);
      console.log('Processed orders data:', ordersData);
      
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error in fetchUserOrders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
      toast.error(err.message || 'Failed to load orders');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!token) {
      console.error('No authentication token available');
      setError('Please log in to view your profile');
      return;
    }

    try {
      console.log('Fetching user profile...');
      setIsLoading(true);
      setError(null);
      
      // Get user ID from the user object in state
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Profile API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile API error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Profile API response data:', data);
      
      const userData = {
        ...data,
        currentTier: calculateTier(data.points || 0),
        memberSince: data.createdAt || new Date().toISOString(),
        totalPoints: data.points || 0,
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0
      };
      
      setUserProfile(userData);
      
      // Update auth context with latest user data
      updateUser({
        ...user,
        ...userData
      });
      
      return userData;
      
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      const errorMessage = err.message || 'Failed to load user profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow error handling in the calling function
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userProfile.name,
          phone: userProfile.phone,
          address: userProfile.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUserProfile(prev => ({
        ...prev,
        ...updatedUser,
        currentTier: calculateTier(updatedUser.points || prev.totalPoints)
      }));
      
      // Update auth context
      updateUser({
        ...user,
        ...updatedUser
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all required data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchUserProfile(),
          fetchPointsHistory(),
          fetchPointsBreakdown(),
          fetchAvailableRewards(),
          fetchRewardTiers()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch sales orders when orders tab is active or when user changes
  useEffect(() => {
    console.log('useEffect - activeTab or user changed', { activeTab, userId: user?._id, hasToken: !!token });
    
    if (activeTab === 'orders' && user?._id && token) {
      console.log('Fetching sales orders...');
      fetchUserOrders();
    } else if (activeTab === 'orders' && !token) {
      console.error('Cannot fetch orders: No authentication token');
      setError('Please log in to view your orders');
    }
  }, [activeTab, user?._id, token]);

  const menuItems = [
    { name: "Dashboard Overview", key: "overview", icon: <User size={20} /> },
    { name: "My Orders", key: "orders", icon: <ShoppingBag size={20} /> },
    { name: "Points & Rewards", key: "points", icon: <Award size={20} /> },
    { name: "Profile Settings", key: "profile", icon: <User size={20} /> },
  ];

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (['completed', 'delivered', 'fulfilled'].includes(statusLower)) {
      return 'bg-green-100 text-green-800';
    } else if (['processing', 'packing', 'preparing'].includes(statusLower)) {
      return 'bg-blue-100 text-blue-800';
    } else if (['shipped', 'in_transit', 'out_for_delivery'].includes(statusLower)) {
      return 'bg-purple-100 text-purple-800';
    } else if (['cancelled', 'declined', 'refunded', 'returned', 'rejected', 'failed'].includes(statusLower)) {
      return 'bg-red-100 text-red-800';
    } else if (['pending', 'payment_pending', 'awaiting_payment'].includes(statusLower)) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentTier = () => {
    if (!rewardTiers?.length) return null;
    
    return rewardTiers.find(tier => 
      userProfile.totalPoints >= (tier?.minPoints || 0) && 
      (tier?.maxPoints === null || tier?.maxPoints === undefined || userProfile.totalPoints <= tier.maxPoints)
    ) || rewardTiers[rewardTiers.length - 1]; // Fallback to the highest tier if no match found
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    if (!currentTier || !rewardTiers?.length) return null;
    
    const currentIndex = rewardTiers.findIndex(tier => tier?.name === currentTier?.name);
    return currentIndex >= 0 && currentIndex < rewardTiers.length - 1 ? rewardTiers[currentIndex + 1] : null;
  };

  const renderOverview = () => {
    const currentTier = getCurrentTier();
    if (!currentTier) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    const nextTier = getNextTier();
    const progressToNext = nextTier && currentTier ? 
      ((userProfile.totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

    return (
      <>
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile.name}!</h2>
              <p className="text-blue-100">Member since {userProfile.memberSince}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="text-yellow-300" size={24} />
                <span className="text-xl font-bold">{currentTier.name} Member</span>
              </div>
              <p className="text-blue-100">{userProfile.totalPoints} points available</p>
            </div>
          </div>
          
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier.name}</span>
                <span>{nextTier.minPoints - userProfile.totalPoints} points to go</span>
              </div>
              <div className="w-full bg-blue-500 rounded-full h-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <Award className="text-yellow-600" size={32} />
              <div>
                <p className="text-gray-500">Total Points</p>
                <h2 className="text-xl font-bold">{userProfile.totalPoints}</h2>
                <p className="text-sm text-yellow-600">+32 this month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <ShoppingBag className="text-blue-600" size={32} />
              <div>
                <p className="text-gray-500">Total Orders</p>
                <h2 className="text-xl font-bold">{userProfile.totalOrders}</h2>
                <p className="text-sm text-blue-600">3 this month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <CreditCard className="text-green-600" size={32} />
              <div>
                <p className="text-gray-500">Total Spent</p>
                <h2 className="text-xl font-bold">LKR {userProfile.totalSpent}</h2>
                <p className="text-sm text-green-600">LKR 42,000 this month</p>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <Gift className="text-purple-600" size={32} />
              <div>
                <p className="text-gray-500">Available Rewards</p>
                <h2 className="text-xl font-bold">8</h2>
                <p className="text-sm text-purple-600">2 expiring soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Points History</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pointsHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earned" stroke="#16a34a" strokeWidth={2} name="Earned" />
                <Line type="monotone" dataKey="redeemed" stroke="#dc2626" strokeWidth={2} name="Redeemed" />
                <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Points Sources</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pointsBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pointsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Points Earned</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 3).map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{order.id}</td>
                    <td className="p-3">{order.date}</td>
                    <td className="p-3">{order.items} items</td>
                    <td className="p-3 font-bold">${order.total}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-yellow-600 font-medium">+{order.points} pts</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm"><Eye size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </>
    );
  };

  const renderOrders = () => {
    console.log('Rendering sales orders:', { 
      isLoading: isOrdersLoading, 
      error, 
      orderCount: orders.length,
      hasUser: !!user?._id,
      hasToken: !!token,
      orders: orders // Log the actual orders data for debugging
    });
    if (isOrdersLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2">Loading your orders...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchUserOrders}
            disabled={isOrdersLoading}
          >
            {isOrdersLoading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center p-8">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
        </div>
      );
    }

    return (
      <Card className="p-4 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Order History</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchUserOrders}
              disabled={isOrdersLoading}
            >
              {isOrdersLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Order ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Points Earned</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderDate = order.createdAt || order.orderDate;
                const itemCount = order.items?.length || 0;
                const totalAmount = order.totalAmount || order.total || 0;
                const status = order.status || 'Pending';
                const orderNumber = order.orderNumber || `ORD-${order._id?.substring(18, 24).toUpperCase() || 'N/A'}`;
                const pointsEarned = Math.floor(totalAmount * 0.1); // 10% of total as points

                return (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{orderNumber}</td>
                    <td className="p-3">{formatDate(orderDate)}</td>
                    <td className="p-3">{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
                    <td className="p-3 font-bold">LKR {totalAmount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3 text-yellow-600 font-medium">+{pointsEarned} pts</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={16} />
                        </Button>
                        {status.toLowerCase() === 'delivered' && (
                          <Button variant="outline" size="sm">Reorder</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const renderPoints = () => (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className="p-6 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Membership Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {rewardTiers.map((tier, index) => {
            const isCurrentTier = tier.name === getCurrentTier().name;
            return (
              <div key={tier.name} className={`p-4 rounded-lg border-2 ${isCurrentTier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold ${isCurrentTier ? 'text-blue-600' : 'text-gray-600'}`}>{tier.name}</h3>
                  {isCurrentTier && <Star className="text-yellow-500" size={20} />}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {tier.minPoints} - {tier.maxPoints || '∞'} points
                </p>
                <ul className="text-xs space-y-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-gray-600">• {benefit}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Available Rewards */}
      <Card className="p-6 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards.map(reward => (
            <div key={reward.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{reward.name}</h3>
                <span className="text-yellow-600 font-bold">{reward.points} pts</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
              <Button 
                className={`w-full ${userProfile.totalPoints >= reward.points ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
                disabled={userProfile.totalPoints < reward.points}
              >
                {userProfile.totalPoints >= reward.points ? 'Redeem' : 'Not Enough Points'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Points History Chart */}
      <Card className="p-6 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Points Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pointsHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earned" fill="#16a34a" name="Points Earned" />
            <Bar dataKey="redeemed" fill="#dc2626" name="Points Redeemed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderProfile = () => {
    if (isLoading && !isEditing) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading profile...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Profile</h2>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.name || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{userProfile.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
                  <p className="text-gray-900">{userProfile.nic || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={userProfile.address?.street || ''}
                      onChange={(e) => setUserProfile({
                        ...userProfile,
                        address: {
                          ...userProfile.address,
                          street: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={userProfile.address?.city || ''}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          address: {
                            ...userProfile.address,
                            city: e.target.value
                          }
                        })}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        value={userProfile.address?.state || ''}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          address: {
                            ...userProfile.address,
                            state: e.target.value
                          }
                        })}
                        className="w-full p-2 border rounded-md"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={userProfile.address?.postalCode || ''}
                      onChange={(e) => setUserProfile({
                        ...userProfile,
                        address: {
                          ...userProfile.address,
                          postalCode: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-900">
                    {userProfile.address?.street || 'No address provided'}
                  </p>
                  {userProfile.address?.city && (
                    <p className="text-gray-900">
                      {userProfile.address.city}{userProfile.address.state ? `, ${userProfile.address.state}` : ''}
                    </p>
                  )}
                  {userProfile.address?.postalCode && (
                    <p className="text-gray-900">{userProfile.address.postalCode}</p>
                  )}
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{formatDate(userProfile.memberSince)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Reward Points</p>
                    <p className="font-medium">{userProfile.totalPoints} pts</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Member Tier</p>
                    <p className="font-medium">{userProfile.currentTier || 'Bronze'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {!isEditing && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Last updated 3 months ago</p>
              </div>
              <Button variant="outline" size="sm">Change Password</Button>
            </div>
            
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-gray-500">Active since {formatDate(userProfile.memberSince)}</p>
              </div>
              <Button variant="destructive" size="sm">Deactivate Account</Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add extra security to your account</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-gray-500">Manage your privacy preferences</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "orders": return renderOrders();
      case "points": return renderPoints();
      case "profile": return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Portal</h2>
              <p className="text-sm text-gray-500">{userProfile.currentTier} Member</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {userProfile.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Available Points</p>
                <p className="text-xl font-bold text-yellow-600">{userProfile.totalPoints}</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Shop Now
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
