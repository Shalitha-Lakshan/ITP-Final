// src/components/user/UserDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { User, Award, ShoppingBag, Clock, Star, Gift, CreditCard, MapPin, Phone, Mail, Edit, Eye, Download } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import LogoutButton from "../common/LogoutButton";

const pointsHistory = [
  { month: "Jan", earned: 120, redeemed: 50, balance: 70 },
  { month: "Feb", earned: 150, redeemed: 80, balance: 140 },
  { month: "Mar", earned: 200, redeemed: 60, balance: 280 },
  { month: "Apr", earned: 180, redeemed: 100, balance: 360 },
  { month: "May", earned: 220, redeemed: 90, balance: 490 },
];

const recentOrders = [
  { id: "ORD001", date: "2025-08-28", items: 3, total: 250, status: "Delivered", points: 25 },
  { id: "ORD002", date: "2025-08-25", items: 2, total: 180, status: "Shipped", points: 18 },
  { id: "ORD003", date: "2025-08-20", items: 5, total: 420, status: "Delivered", points: 42 },
  { id: "ORD004", date: "2025-08-15", items: 1, total: 95, status: "Delivered", points: 10 },
  { id: "ORD005", date: "2025-08-10", items: 4, total: 320, status: "Delivered", points: 32 },
];

const pointsBreakdown = [
  { name: "Purchases", value: 60, points: 294 },
  { name: "Referrals", value: 25, points: 122 },
  { name: "Reviews", value: 10, points: 49 },
  { name: "Bonus", value: 5, points: 25 },
];

const rewardTiers = [
  { name: "Bronze", minPoints: 0, maxPoints: 199, benefits: ["5% Discount", "Free Shipping on LKR 5,000+"] },
  { name: "Silver", minPoints: 200, maxPoints: 499, benefits: ["10% Discount", "Free Shipping", "Priority Support"] },
  { name: "Gold", minPoints: 500, maxPoints: 999, benefits: ["15% Discount", "Free Shipping", "Early Access", "Birthday Bonus"] },
  { name: "Platinum", minPoints: 1000, maxPoints: null, benefits: ["20% Discount", "Free Shipping", "VIP Support", "Exclusive Products"] },
];

const availableRewards = [
  { id: 1, name: "LKR 1,000 Off Coupon", points: 100, description: "Get LKR 1,000 off your next purchase", type: "discount" },
  { id: 2, name: "Free Shipping", points: 50, description: "Free shipping on any order", type: "shipping" },
  { id: 3, name: "LKR 2,500 Gift Card", points: 250, description: "Digital gift card for future purchases", type: "gift_card" },
  { id: 4, name: "Premium Product", points: 500, description: "Exclusive premium product access", type: "product" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile] = useState({
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    memberSince: "January 2024",
    totalPoints: 490,
    currentTier: "Silver",
    totalOrders: 15,
    totalSpent: 1265
  });

  const menuItems = [
    { name: "Dashboard Overview", key: "overview", icon: <User size={20} /> },
    { name: "My Orders", key: "orders", icon: <ShoppingBag size={20} /> },
    { name: "Points & Rewards", key: "points", icon: <Award size={20} /> },
    { name: "Profile Settings", key: "profile", icon: <User size={20} /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "text-green-600 bg-green-100";
      case "Shipped": return "text-blue-600 bg-blue-100";
      case "Processing": return "text-yellow-600 bg-yellow-100";
      case "Cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCurrentTier = () => {
    return rewardTiers.find(tier => 
      userProfile.totalPoints >= tier.minPoints && 
      (tier.maxPoints === null || userProfile.totalPoints <= tier.maxPoints)
    );
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = rewardTiers.findIndex(tier => tier.name === currentTier.name);
    return currentIndex < rewardTiers.length - 1 ? rewardTiers[currentIndex + 1] : null;
  };

  const renderOverview = () => {
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    const progressToNext = nextTier ? ((userProfile.totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

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
                {recentOrders.slice(0, 3).map(order => (
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

  const renderOrders = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Order History</h2>
        <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
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
            {recentOrders.map(order => (
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
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm"><Eye size={16} /></Button>
                    <Button variant="outline" size="sm">Reorder</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

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

  const renderProfile = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Personal Information</h2>
          <Button variant="outline" size="sm"><Edit size={16} className="mr-2" />Edit</Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{userProfile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{userProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{userProfile.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{userProfile.address}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive order updates and promotions</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-500">Last updated 3 months ago</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add extra security to your account</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <div>
              <p className="font-medium">Privacy Settings</p>
              <p className="text-sm text-gray-500">Control your data and privacy</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </Card>
    </div>
  );

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
