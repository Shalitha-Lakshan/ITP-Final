// src/components/finance/UnifiedFinanceDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  DollarSign, CreditCard, TrendingDown, FileText, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
  Users, Building, Briefcase, Target, AlertCircle, CheckCircle,
  Clock, XCircle, Plus, Search
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

// Finance Data
const revenueExpensesData = [
  { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000 },
  { month: "Feb", revenue: 145000, expenses: 95000, profit: 50000 },
  { month: "Mar", revenue: 168000, expenses: 112000, profit: 56000 },
  { month: "Apr", revenue: 192000, expenses: 128000, profit: 64000 },
  { month: "May", revenue: 215000, expenses: 145000, profit: 70000 },
  { month: "Jun", revenue: 238000, expenses: 158000, profit: 80000 },
];

const expenseBreakdown = [
  { name: "Salaries & Benefits", value: 45000, color: "#3B82F6" },
  { name: "Operations", value: 32000, color: "#10B981" },
  { name: "Marketing", value: 18000, color: "#F59E0B" },
  { name: "Technology", value: 15000, color: "#EF4444" },
  { name: "Utilities", value: 12000, color: "#8B5CF6" },
  { name: "Other", value: 8000, color: "#6B7280" },
];

// Payment Data
const paymentMethodData = [
  { method: "Credit Card", amount: 45000, percentage: 60 },
  { method: "Bank Transfer", amount: 22500, percentage: 30 },
  { method: "PayPal", amount: 5250, percentage: 7 },
  { method: "Cash", amount: 2250, percentage: 3 },
];

const monthlyPaymentData = [
  { month: "Jan", received: 18000, pending: 2000, failed: 500 },
  { month: "Feb", received: 22000, pending: 1500, failed: 300 },
  { month: "Mar", received: 25000, pending: 1800, failed: 400 },
  { month: "Apr", received: 28000, pending: 2200, failed: 600 },
  { month: "May", received: 32000, pending: 1900, failed: 350 },
];

const recentTransactions = [
  { id: "TXN001", customer: "John Smith", amount: 1250, method: "Credit Card", status: "Completed", date: "2025-08-30", time: "14:30", type: "Payment" },
  { id: "TXN002", customer: "Sarah Johnson", amount: 890, method: "Bank Transfer", status: "Pending", date: "2025-08-30", time: "13:45", type: "Payment" },
  { id: "TXN003", customer: "Engineering Team", amount: 8500, method: "Bank Transfer", status: "Completed", date: "2025-08-29", time: "16:10", type: "Expense" },
  { id: "TXN004", customer: "Emma Davis", amount: 675, method: "Credit Card", status: "Completed", date: "2025-08-29", time: "16:10", type: "Payment" },
  { id: "TXN005", customer: "Marketing Campaign", amount: 3200, method: "Bank Transfer", status: "Processing", date: "2025-08-29", time: "15:25", type: "Expense" },
];

const pendingPayments = [
  { id: "PAY001", invoice: "INV-2025-001", customer: "ABC Corporation", amount: 5000, dueDate: "2025-09-05", overdue: false },
  { id: "PAY002", invoice: "INV-2025-002", customer: "XYZ Industries", amount: 3200, dueDate: "2025-08-28", overdue: true },
  { id: "PAY003", invoice: "INV-2025-003", customer: "Tech Solutions", amount: 1800, dueDate: "2025-09-10", overdue: false },
  { id: "PAY004", invoice: "INV-2025-004", customer: "Global Enterprises", amount: 4500, dueDate: "2025-08-25", overdue: true },
];

export default function UnifiedFinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Financial Overview", icon: <DollarSign size={20} /> },
    { id: "analytics", name: "Financial Analytics", icon: <TrendingUp size={20} /> },
    { id: "payments", name: "Payment Management", icon: <CreditCard size={20} /> },
    { id: "transactions", name: "Transaction History", icon: <FileText size={20} /> },
    { id: "pending", name: "Pending Payments", icon: <Clock size={20} /> },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-900">$238K</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <ArrowUpRight size={16} className="mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Net Profit</p>
                <p className="text-3xl font-bold text-green-900">$80K</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight size={16} className="mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Payments Received</p>
                <p className="text-3xl font-bold text-purple-900">$32K</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <ArrowUpRight size={16} className="mr-1" />
                  +15.3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Pending Payments</p>
                <p className="text-3xl font-bold text-orange-900">$14.5K</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <ArrowDownRight size={16} className="mr-1" />
                  -5.1% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Payments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyPaymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="received" stackId="1" stroke="#10B981" fill="#10B981" name="Received" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Pending" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke="#EF4444" fill="#EF4444" name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-8">
      {/* Payment Method Distribution */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Payment Methods Distribution</h3>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Payment Method
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
            <p className="text-2xl font-bold text-green-900">$75K</p>
            <p className="text-sm text-green-700">Successful Payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-2 text-yellow-600" size={32} />
            <p className="text-2xl font-bold text-yellow-900">$14.5K</p>
            <p className="text-sm text-yellow-700">Pending Payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 text-center">
            <XCircle className="mx-auto mb-2 text-red-600" size={32} />
            <p className="text-2xl font-bold text-red-900">$1.2K</p>
            <p className="text-sm text-red-700">Failed Payments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Transaction ID</th>
                <th className="text-left p-2">Customer/Description</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Method</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-sm">{transaction.id}</td>
                  <td className="p-2">{transaction.customer}</td>
                  <td className="p-2 font-semibold">${transaction.amount.toLocaleString()}</td>
                  <td className="p-2">{transaction.method}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'Payment' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-gray-600">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderPendingPayments = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pending Payments</h3>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Send Reminder
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Payment ID</th>
                <th className="text-left p-2">Invoice</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Due Date</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-sm">{payment.id}</td>
                  <td className="p-2">{payment.invoice}</td>
                  <td className="p-2">{payment.customer}</td>
                  <td className="p-2 font-semibold">${payment.amount.toLocaleString()}</td>
                  <td className="p-2">{payment.dueDate}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.overdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.overdue ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button variant="outline" size="sm">
                      Send Reminder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "analytics":
        return renderAnalytics();
      case "payments":
        return renderPayments();
      case "transactions":
        return renderTransactions();
      case "pending":
        return renderPendingPayments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Finance Hub</h2>
              <p className="text-sm text-gray-500">Finance & Payments</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive financial management and payment processing
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Calendar size={16} className="mr-2" />
                Date Range
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
}
