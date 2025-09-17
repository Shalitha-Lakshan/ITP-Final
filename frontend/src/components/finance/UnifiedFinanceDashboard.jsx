// src/components/finance/UnifiedFinanceDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  DollarSign, CreditCard, FileText, TrendingUp, 
  Users, Building, Briefcase, Target, CheckCircle,
  Clock, XCircle, Plus, Filter, Download, Calendar
} from "lucide-react";
import EmployeePayroll from "./EmployeePayroll";
import OverviewCards from "./OverviewCards";
import FinanceCharts from "./FinanceCharts";
import CustomerPaymentsManagement from "./CustomerPaymentsManagement";
import EmployeePaymentsManagement from "./EmployeePaymentsManagement";
import PaymentCRUD from "./PaymentCRUD";
import PaymentMethodsManagement from "./PaymentMethodsManagement";
import PaymentProcessing from "./PaymentProcessing";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import LogoutButton from "../common/LogoutButton";

// Data will be fetched from API

export default function UnifiedFinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for charts
  const expenseBreakdown = [
    { name: 'Operations', value: 35, color: '#0088FE' },
    { name: 'Marketing', value: 25, color: '#00C49F' },
    { name: 'Salaries', value: 30, color: '#FFBB28' },
    { name: 'Utilities', value: 10, color: '#FF8042' }
  ];

  const revenueExpensesData = [
    { month: 'Jan', revenue: 65000, expenses: 45000 },
    { month: 'Feb', revenue: 72000, expenses: 48000 },
    { month: 'Mar', revenue: 68000, expenses: 52000 },
    { month: 'Apr', revenue: 85000, expenses: 55000 },
    { month: 'May', revenue: 78000, expenses: 51000 },
    { month: 'Jun', revenue: 92000, expenses: 58000 }
  ];

  const paymentMethodData = [
    { method: 'Credit Card', amount: 45000 },
    { method: 'Bank Transfer', amount: 32000 },
    { method: 'PayPal', amount: 18000 },
    { method: 'Cash', amount: 12000 }
  ];

  const recentTransactions = [
    { id: 1, customer: 'John Doe', amount: 1250, status: 'completed', date: '2024-01-15' },
    { id: 2, customer: 'Jane Smith', amount: 850, status: 'pending', date: '2024-01-14' },
    { id: 3, customer: 'Bob Johnson', amount: 2100, status: 'completed', date: '2024-01-13' }
  ];

  const pendingPayments = [
    { id: 1, customer: 'Alice Brown', amount: 750, dueDate: '2024-01-20' },
    { id: 2, customer: 'Charlie Wilson', amount: 1200, dueDate: '2024-01-22' },
    { id: 3, customer: 'Diana Davis', amount: 950, dueDate: '2024-01-25' }
  ];

  const tabs = [
    { id: "overview", name: "Financial Overview", icon: <DollarSign size={20} /> },
    { id: "analytics", name: "Financial Analytics", icon: <TrendingUp size={20} /> },
    { id: "payment-methods", name: "Payment Methods", icon: <CreditCard size={20} /> },
    { id: "payment-processing", name: "Payment Processing", icon: <Target size={20} /> },
    { id: "customer-payments", name: "Customer Payments", icon: <Users size={20} /> },
    { id: "employee-payments", name: "Employee Payments", icon: <Building size={20} /> },
    { id: "payment-crud", name: "Payment Records", icon: <FileText size={20} /> },
    { id: "payroll", name: "Employee Payroll", icon: <Briefcase size={20} /> },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <OverviewCards />
      <FinanceCharts />
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
                  <td className="p-2 font-semibold">₹{transaction.amount.toLocaleString()}</td>
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
                  <td className="p-2 font-semibold">₹{payment.amount.toLocaleString()}</td>
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
      case "payment-methods":
        return <PaymentMethodsManagement />;
      case "payment-processing":
        return <PaymentProcessing />;
      case "customer-payments":
        return <CustomerPaymentsManagement />;
      case "employee-payments":
        return <EmployeePaymentsManagement />;
      case "payment-crud":
        return <PaymentCRUD />;
      case "payroll":
        return <EmployeePayroll />;
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
          <LogoutButton />
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
