import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Search,
  Filter,
  Settings,
  Eye,
  MoreVertical
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PaymentMethodsManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'card',
    isActive: true,
    processingFee: 0,
    transactionLimit: 0,
    description: ''
  });

  // Sample data for payment methods
  const samplePaymentMethods = [
    {
      id: 1,
      name: 'Visa/Mastercard',
      type: 'card',
      isActive: true,
      processingFee: 2.9,
      transactionLimit: 50000,
      monthlyVolume: 125000,
      successRate: 98.5,
      description: 'Credit and debit card payments'
    },
    {
      id: 2,
      name: 'PayPal',
      type: 'digital_wallet',
      isActive: true,
      processingFee: 3.4,
      transactionLimit: 25000,
      monthlyVolume: 85000,
      successRate: 97.2,
      description: 'PayPal digital wallet payments'
    },
    {
      id: 3,
      name: 'Bank Transfer',
      type: 'bank_transfer',
      isActive: true,
      processingFee: 1.5,
      transactionLimit: 100000,
      monthlyVolume: 200000,
      successRate: 99.1,
      description: 'Direct bank transfers'
    },
    {
      id: 4,
      name: 'Cash on Delivery',
      type: 'cash',
      isActive: false,
      processingFee: 0,
      transactionLimit: 10000,
      monthlyVolume: 45000,
      successRate: 95.8,
      description: 'Cash payment on delivery'
    },
    {
      id: 5,
      name: 'Mobile Payment',
      type: 'mobile',
      isActive: true,
      processingFee: 2.1,
      transactionLimit: 15000,
      monthlyVolume: 65000,
      successRate: 96.8,
      description: 'Mobile wallet payments'
    }
  ];

  const distributionData = [
    { name: 'Credit Cards', value: 45, amount: 125000, color: '#0088FE' },
    { name: 'Bank Transfer', value: 35, amount: 200000, color: '#00C49F' },
    { name: 'PayPal', value: 15, amount: 85000, color: '#FFBB28' },
    { name: 'Mobile Payment', value: 12, amount: 65000, color: '#FF8042' },
    { name: 'Cash', value: 8, amount: 45000, color: '#8884D8' }
  ];

  const trendsData = [
    { month: 'Jan', cards: 45000, bank: 65000, paypal: 25000, mobile: 15000, cash: 12000 },
    { month: 'Feb', cards: 52000, bank: 70000, paypal: 28000, mobile: 18000, cash: 14000 },
    { month: 'Mar', cards: 48000, bank: 75000, paypal: 30000, mobile: 20000, cash: 16000 },
    { month: 'Apr', cards: 61000, bank: 80000, paypal: 32000, mobile: 22000, cash: 18000 },
    { month: 'May', cards: 55000, bank: 85000, paypal: 35000, mobile: 25000, cash: 20000 },
    { month: 'Jun', cards: 67000, bank: 90000, paypal: 38000, mobile: 28000, cash: 22000 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPaymentMethods(samplePaymentMethods);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMethod) {
      // Update existing method
      setPaymentMethods(methods => 
        methods.map(method => 
          method.id === editingMethod.id 
            ? { ...method, ...formData, monthlyVolume: method.monthlyVolume, successRate: method.successRate }
            : method
        )
      );
      setEditingMethod(null);
    } else {
      // Add new method
      const newMethod = {
        id: Date.now(),
        ...formData,
        monthlyVolume: 0,
        successRate: 100
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    setShowAddForm(false);
    setFormData({
      name: '',
      type: 'card',
      isActive: true,
      processingFee: 0,
      transactionLimit: 0,
      description: ''
    });
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      isActive: method.isActive,
      processingFee: method.processingFee,
      transactionLimit: method.transactionLimit,
      description: method.description
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(methods => methods.filter(method => method.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setPaymentMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, isActive: !method.isActive } : method
      )
    );
  };

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'card': return <CreditCard className="w-5 h-5" />;
      case 'digital_wallet': return <DollarSign className="w-5 h-5" />;
      case 'bank_transfer': return <BarChart3 className="w-5 h-5" />;
      case 'mobile': return <Settings className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
              +5.2%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹4,75,000</h3>
          <p className="text-gray-600 text-sm">Successful Payments</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-yellow-600 text-sm font-medium bg-yellow-100 px-2 py-1 rounded-full">
              +2.1%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹87,500</h3>
          <p className="text-gray-600 text-sm">Pending Payments</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-600 text-sm font-medium bg-red-100 px-2 py-1 rounded-full">
              -1.3%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹7,200</h3>
          <p className="text-gray-600 text-sm">Failed Payments</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
              {paymentMethods.filter(m => m.isActive).length} Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{paymentMethods.length}</h3>
          <p className="text-gray-600 text-sm">Payment Methods</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Payment Method Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Monthly Payment Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
              <Legend />
              <Bar dataKey="cards" stackId="a" fill="#0088FE" name="Cards" />
              <Bar dataKey="bank" stackId="a" fill="#00C49F" name="Bank Transfer" />
              <Bar dataKey="paypal" stackId="a" fill="#FFBB28" name="PayPal" />
              <Bar dataKey="mobile" stackId="a" fill="#FF8042" name="Mobile" />
              <Bar dataKey="cash" stackId="a" fill="#8884D8" name="Cash" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Management */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payment methods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Method</span>
            </button>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <div key={method.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    {getTypeIcon(method.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{method.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <button
                    onClick={() => toggleStatus(method.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {method.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">{method.processingFee}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction Limit</span>
                  <span className="font-medium">₹{method.transactionLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Volume</span>
                  <span className="font-medium">₹{method.monthlyVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">{method.successRate}%</span>
                </div>
                {method.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile">Mobile Payment</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processing Fee (%)</label>
                <input
                  type="number"
                  name="processingFee"
                  value={formData.processingFee}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Limit (₹)</label>
                <input
                  type="number"
                  name="transactionLimit"
                  value={formData.transactionLimit}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMethod(null);
                    setFormData({
                      name: '',
                      type: 'card',
                      isActive: true,
                      processingFee: 0,
                      transactionLimit: 0,
                      description: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {editingMethod ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsManagement;
