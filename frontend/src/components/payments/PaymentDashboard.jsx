// src/components/payments/PaymentDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

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
  { id: "TXN001", customer: "John Smith", amount: 1250, method: "Credit Card", status: "Completed", date: "2025-08-30", time: "14:30" },
  { id: "TXN002", customer: "Sarah Johnson", amount: 890, method: "Bank Transfer", status: "Pending", date: "2025-08-30", time: "13:45" },
  { id: "TXN003", customer: "Mike Wilson", amount: 2100, method: "PayPal", status: "Failed", date: "2025-08-30", time: "12:20" },
  { id: "TXN004", customer: "Emma Davis", amount: 675, method: "Credit Card", status: "Completed", date: "2025-08-29", time: "16:10" },
  { id: "TXN005", customer: "David Brown", amount: 1450, method: "Bank Transfer", status: "Processing", date: "2025-08-29", time: "15:25" },
];

const pendingPayments = [
  { id: "PAY001", invoice: "INV-2025-001", customer: "ABC Corporation", amount: 5000, dueDate: "2025-09-05", overdue: false },
  { id: "PAY002", invoice: "INV-2025-002", customer: "XYZ Industries", amount: 3200, dueDate: "2025-08-28", overdue: true },
  { id: "PAY003", invoice: "INV-2025-003", customer: "Tech Solutions", amount: 1800, dueDate: "2025-09-10", overdue: false },
  { id: "PAY004", invoice: "INV-2025-004", customer: "Global Enterprises", amount: 4500, dueDate: "2025-08-25", overdue: true },
];

export default function PaymentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const menuItems = [
    { name: "Payment Overview", key: "overview", icon: <DollarSign size={20} /> },
    { name: "Transaction History", key: "transactions", icon: <CreditCard size={20} /> },
    { name: "Pending Payments", key: "pending", icon: <Clock size={20} /> },
    { name: "Payment Methods", key: "methods", icon: <CreditCard size={20} /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-100";
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Processing": return "text-blue-600 bg-blue-100";
      case "Failed": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle size={16} className="text-green-600" />;
      case "Pending": return <Clock size={16} className="text-yellow-600" />;
      case "Processing": return <AlertCircle size={16} className="text-blue-600" />;
      case "Failed": return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const renderOverview = () => (
    <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <DollarSign className="text-green-600" size={32} />
            <div>
              <p className="text-gray-500">Total Received</p>
              <h2 className="text-xl font-bold">$125,000</h2>
              <p className="text-sm text-green-600">+18% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Clock className="text-yellow-600" size={32} />
            <div>
              <p className="text-gray-500">Pending Payments</p>
              <h2 className="text-xl font-bold">$14,500</h2>
              <p className="text-sm text-yellow-600">4 invoices pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <XCircle className="text-red-600" size={32} />
            <div>
              <p className="text-gray-500">Failed Payments</p>
              <h2 className="text-xl font-bold">$2,150</h2>
              <p className="text-sm text-red-600">3 failed transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <CreditCard className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-500">Processing</p>
              <h2 className="text-xl font-bold">$3,200</h2>
              <p className="text-sm text-blue-600">2 transactions processing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Monthly Payment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPaymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="received" fill="#16a34a" name="Received" />
              <Bar dataKey="pending" fill="#eab308" name="Pending" />
              <Bar dataKey="failed" fill="#dc2626" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Payment Methods Distribution</h2>
          <div className="space-y-4">
            {paymentMethodData.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard size={20} className="text-blue-600" />
                  <span className="font-medium">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">${method.amount.toLocaleString()}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{method.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  const renderTransactions = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Transactions</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Search size={16} className="mr-2" />Search</Button>
          <Button variant="outline" size="sm"><Filter size={16} className="mr-2" />Filter</Button>
          <Button className="bg-green-600 text-white"><Plus size={16} className="mr-2" />New Payment</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Transaction ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(transaction => (
              <tr key={transaction.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{transaction.id}</td>
                <td className="p-3">{transaction.customer}</td>
                <td className="p-3 font-bold">${transaction.amount}</td>
                <td className="p-3">{transaction.method}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transaction.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <p>{transaction.date}</p>
                    <p className="text-sm text-gray-500">{transaction.time}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    {transaction.status === "Failed" && (
                      <Button variant="outline" size="sm" className="text-blue-600">Retry</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderPending = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Pending Payments</h2>
        <Button className="bg-blue-600 text-white"><Plus size={16} className="mr-2" />Send Reminder</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Payment ID</th>
              <th className="p-3">Invoice</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map(payment => (
              <tr key={payment.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{payment.id}</td>
                <td className="p-3">{payment.invoice}</td>
                <td className="p-3">{payment.customer}</td>
                <td className="p-3 font-bold">${payment.amount}</td>
                <td className="p-3">{payment.dueDate}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.overdue ? "text-red-600 bg-red-100" : "text-yellow-600 bg-yellow-100"
                  }`}>
                    {payment.overdue ? "Overdue" : "Pending"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Send Reminder</Button>
                    <Button variant="outline" size="sm" className="text-green-600">Mark Paid</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderMethods = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Payment Methods</h2>
          <Button className="bg-purple-600 text-white"><Plus size={16} className="mr-2" />Add Method</Button>
        </div>
        <div className="space-y-4">
          {paymentMethodData.map((method) => (
            <div key={method.method} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard size={24} className="text-blue-600" />
                <div>
                  <p className="font-medium">{method.method}</p>
                  <p className="text-sm text-gray-500">{method.percentage}% of total payments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${method.amount.toLocaleString()}</p>
                <Button variant="outline" size="sm" className="mt-2">Configure</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Payment Gateway Settings</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Stripe Integration</h3>
              <span className="text-green-600 text-sm">Active</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Process credit card payments securely</p>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">PayPal Integration</h3>
              <span className="text-green-600 text-sm">Active</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Accept PayPal payments</p>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Bank Transfer</h3>
              <span className="text-yellow-600 text-sm">Pending Setup</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Direct bank transfers</p>
            <Button variant="outline" size="sm">Setup</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "transactions": return renderTransactions();
      case "pending": return renderPending();
      case "methods": return renderMethods();
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
              <CreditCard className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Hub</h2>
              <p className="text-sm text-gray-500">Transaction Management</p>
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
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
              <p className="text-gray-600 mt-1">Payment processing and transaction management</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Search size={16} className="mr-2" />Search
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Filter size={16} className="mr-2" />Filter
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus size={16} className="mr-2" />New Payment
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
