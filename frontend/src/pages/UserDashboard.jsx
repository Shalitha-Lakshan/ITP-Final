import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  LogOut, 
  Bell, 
  Settings, 
  Activity, 
  TrendingUp, 
  Recycle, 
  Leaf, 
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Coins, 
  Trophy, 
  BarChart3, 
  Globe,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    bottlesRecycled: 0,
    pointsEarned: 0,
    rewardsEarned: 0,
    environmentalImpact: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication using AuthContext
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
      
      // Simulate loading user stats and activity
      setTimeout(() => {
        setStats({
          bottlesRecycled: 247,
          pointsEarned: 1850,
          rewardsEarned: 920,
          environmentalImpact: 12.4
        });
        
        setRecentActivity([
          { id: 1, type: 'recycle', description: 'Recycled 15 plastic bottles', points: 75, time: '2 hours ago', icon: Recycle },
          { id: 2, type: 'reward', description: 'Earned ₹50 cashback', points: 100, time: '1 day ago', icon: Coins },
          { id: 3, type: 'achievement', description: 'Reached 200 bottles milestone', points: 200, time: '3 days ago', icon: Trophy },
          { id: 4, type: 'recycle', description: 'Recycled 8 plastic bottles', points: 40, time: '5 days ago', icon: Recycle },
        ]);
        
        setLoading(false);
      }, 1000);
  }, [navigate, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EcoCycle
                </h1>
                <p className="text-xs text-gray-500">User Portal</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your eco-impact summary and recent recycling activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bottles Recycled */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                +12% this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.bottlesRecycled}</h3>
            <p className="text-gray-600 text-sm">Bottles Recycled</p>
          </div>

          {/* Points Earned */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                +8% this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pointsEarned}</h3>
            <p className="text-gray-600 text-sm">Points Earned</p>
          </div>

          {/* Rewards Earned */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-600 text-sm font-medium bg-purple-100 px-2 py-1 rounded-full">
                +15% this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{stats.rewardsEarned}</h3>
            <p className="text-gray-600 text-sm">Rewards Earned</p>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-orange-600 text-sm font-medium bg-orange-100 px-2 py-1 rounded-full">
                +20% this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.environmentalImpact}kg</h3>
            <p className="text-gray-600 text-sm">CO₂ Saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <activity.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold">+{activity.points}</span>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {user?.role} Member
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">Jan 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-medium text-green-600">Eco Warrior</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Milestone</span>
                  <span className="font-medium text-purple-600">500 bottles</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
                  <Recycle className="w-5 h-5 mr-3" />
                  <span className="font-medium">Record Recycling</span>
                </button>
                
                <button className="w-full flex items-center p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span className="font-medium">Find Collection Point</span>
                </button>
                
                <button className="w-full flex items-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                  <Trophy className="w-5 h-5 mr-3" />
                  <span className="font-medium">View Rewards</span>
                </button>
                
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="font-medium">Profile Settings</span>
                </button>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Eco Champion!</h3>
                <p className="text-sm text-yellow-100 mb-4">
                  You're in the top 10% of recyclers this month!
                </p>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Share Achievement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Monthly Progress
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Bottles Goal (300)</span>
                  <span className="font-medium">{stats.bottlesRecycled}/300</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.bottlesRecycled / 300) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Points Goal (2000)</span>
                  <span className="font-medium">{stats.pointsEarned}/2000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.pointsEarned / 2000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-600" />
              Environmental Impact
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.environmentalImpact}kg</div>
                <div className="text-xs text-gray-600">CO₂ Reduced</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">1.2L</div>
                <div className="text-xs text-gray-600">Oil Saved</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">85m²</div>
                <div className="text-xs text-gray-600">Land Saved</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600 mb-1">3.7kWh</div>
                <div className="text-xs text-gray-600">Energy Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Recycle className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Start Recycling</h3>
            <p className="text-sm text-green-100">Record your recycling activity</p>
          </button>
          
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <MapPin className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Collection Points</h3>
            <p className="text-sm text-blue-100">Find nearby drop-off locations</p>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Trophy className="w-8 h-8 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Redeem Rewards</h3>
            <p className="text-sm text-purple-100">Convert points to cash</p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
