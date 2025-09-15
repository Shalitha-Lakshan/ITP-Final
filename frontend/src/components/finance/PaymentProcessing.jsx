import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send, 
  Receipt, 
  User, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PaymentProcessing = () => {
  const [activeTab, setActiveTab] = useState('process');
  const [payments, setPayments] = useState([]);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    paymentMethod: 'card',
    description: '',
    dueDate: '',
    invoiceNumber: ''
  });

  // Sample payment data
  const samplePayments = [
    {
      id: 'PAY001',
      customerId: 'CUST001',
      customerName: 'John Doe',
      amount: 15000,
      paymentMethod: 'card',
      status: 'completed',
      description: 'Product purchase - Recycled bottles',
      dueDate: '2024-01-15',
      processedDate: '2024-01-14',
      invoiceNumber: 'INV-2024-001',
      transactionId: 'TXN123456789'
    },
    {
      id: 'PAY002',
      customerId: 'CUST002',
      customerName: 'Jane Smith',
      amount: 8500,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      description: 'Bulk recycling service',
      dueDate: '2024-01-20',
      processedDate: null,
      invoiceNumber: 'INV-2024-002',
      transactionId: null
    },
    {
      id: 'PAY003',
      customerId: 'CUST003',
      customerName: 'EcoTech Solutions',
      amount: 25000,
      paymentMethod: 'paypal',
      status: 'processing',
      description: 'Monthly recycling contract',
      dueDate: '2024-01-18',
      processedDate: null,
      invoiceNumber: 'INV-2024-003',
      transactionId: 'TXN987654321'
    },
    {
      id: 'PAY004',
      customerId: 'CUST004',
      customerName: 'Green Corp',
      amount: 12000,
      paymentMethod: 'card',
      status: 'failed',
      description: 'Plastic bottle collection',
      dueDate: '2024-01-16',
      processedDate: '2024-01-16',
      invoiceNumber: 'INV-2024-004',
      transactionId: null
    },
    {
      id: 'PAY005',
      customerId: 'CUST005',
      customerName: 'Sustainable Industries',
      amount: 35000,
      paymentMethod: 'bank_transfer',
      status: 'completed',
      description: 'Enterprise recycling program',
      dueDate: '2024-01-12',
      processedDate: '2024-01-11',
      invoiceNumber: 'INV-2024-005',
      transactionId: 'TXN456789123'
    }
  ];

  const paymentTrends = [
    { month: 'Jul', completed: 45000, pending: 12000, failed: 3000 },
    { month: 'Aug', completed: 52000, pending: 15000, failed: 2500 },
    { month: 'Sep', completed: 48000, pending: 18000, failed: 4000 },
    { month: 'Oct', completed: 61000, pending: 14000, failed: 2000 },
    { month: 'Nov', completed: 55000, pending: 16000, failed: 3500 },
    { month: 'Dec', completed: 67000, pending: 13000, failed: 2800 }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPayments(samplePayments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPayment = {
      id: `PAY${String(payments.length + 1).padStart(3, '0')}`,
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'pending',
      processedDate: null,
      transactionId: null
    };
    setPayments(prev => [...prev, newPayment]);
    setShowProcessForm(false);
    setFormData({
      customerId: '',
      customerName: '',
      amount: '',
      paymentMethod: 'card',
      description: '',
      dueDate: '',
      invoiceNumber: ''
    });
  };

  const processPayment = (paymentId) => {
    setPayments(prev =>
      prev.map(payment =>
        payment.id === paymentId
          ? {
              ...payment,
              status: 'processing',
              processedDate: new Date().toISOString().split('T')[0],
              transactionId: `TXN${Date.now()}`
            }
          : payment
      )
    );
    
    // Simulate processing delay
    setTimeout(() => {
      setPayments(prev =>
        prev.map(payment =>
          payment.id === paymentId && payment.status === 'processing'
            ? { ...payment, status: Math.random() > 0.1 ? 'completed' : 'failed' }
            : payment
        )
      );
    }, 2000);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer': return <DollarSign className="w-4 h-4" />;
      case 'paypal': return <DollarSign className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalStats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    failed: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0)
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
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'process', label: 'Process Payments', icon: Send },
          { key: 'analytics', label: 'Payment Analytics', icon: BarChart }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'process' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalStats.total.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Total Payments</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                  Success
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalStats.completed.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Completed Payments</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-yellow-600 text-sm font-medium bg-yellow-100 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalStats.pending.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Pending Payments</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-red-600 text-sm font-medium bg-red-100 px-2 py-1 rounded-full">
                  Failed
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalStats.failed.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">Failed Payments</p>
            </div>
          </div>

          {/* Payment Processing Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900">Payment Processing</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  onClick={() => setShowProcessForm(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Payment</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Payment ID</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Method</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Due Date</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-medium">{payment.id}</div>
                        <div className="text-xs text-gray-500">{payment.invoiceNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{payment.customerName}</div>
                        <div className="text-sm text-gray-500">{payment.description}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{payment.dueDate}</div>
                        {payment.processedDate && (
                          <div className="text-xs text-gray-500">Processed: {payment.processedDate}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => processPayment(payment.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Process Payment"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Payment Form Modal */}
      {showProcessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Process New Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                <input
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProcessForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;
