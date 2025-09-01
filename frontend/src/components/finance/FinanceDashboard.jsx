// src/components/FinanceDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  DollarSign, CreditCard, TrendingDown, FileText, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
  Users, Building, Briefcase, Target, AlertCircle, CheckCircle
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const revenueExpensesData = [
  { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000 },
  { month: "Feb", revenue: 145000, expenses: 95000, profit: 50000 },
  { month: "Mar", revenue: 168000, expenses: 112000, profit: 56000 },
  { month: "Apr", revenue: 192000, expenses: 128000, profit: 64000 },
  { month: "May", revenue: 215000, expenses: 145000, profit: 70000 },
  { month: "Jun", revenue: 238000, expenses: 158000, profit: 80000 },
];

const cashFlowData = [
  { month: "Jan", inflow: 125000, outflow: 85000, net: 40000 },
  { month: "Feb", inflow: 145000, outflow: 95000, net: 50000 },
  { month: "Mar", inflow: 168000, outflow: 112000, net: 56000 },
  { month: "Apr", inflow: 192000, outflow: 128000, net: 64000 },
  { month: "May", inflow: 215000, outflow: 145000, net: 70000 },
  { month: "Jun", inflow: 238000, outflow: 158000, net: 80000 },
];

const expenseBreakdown = [
  { name: "Salaries & Benefits", value: 45000, color: "#3B82F6" },
  { name: "Operations", value: 32000, color: "#10B981" },
  { name: "Marketing", value: 18000, color: "#F59E0B" },
  { name: "Technology", value: 15000, color: "#EF4444" },
  { name: "Utilities", value: 12000, color: "#8B5CF6" },
  { name: "Other", value: 8000, color: "#6B7280" },
];

const recentTransactions = [
  { id: 1, date: "2025-09-01", type: "Revenue - Product Sales", amount: 15000, status: "Completed", category: "Income" },
  { id: 2, date: "2025-08-31", type: "Salary Payment - Engineering", amount: 8500, status: "Completed", category: "Expense" },
  { id: 3, date: "2025-08-30", type: "Marketing Campaign", amount: 3200, status: "Pending", category: "Expense" },
  { id: 4, date: "2025-08-29", type: "Equipment Purchase", amount: 2800, status: "Completed", category: "Expense" },
  { id: 5, date: "2025-08-28", type: "Client Payment", amount: 12000, status: "Completed", category: "Income" },
];

const employeeSalaries = [
  { id: 1, name: "John Doe", position: "Transport Manager", salary: 4500, department: "Operations", status: "Paid" },
  { id: 2, name: "Jane Smith", position: "Inventory Manager", salary: 5200, department: "Operations", status: "Pending" },
  { id: 3, name: "Mark Lee", position: "Sales Director", salary: 6500, department: "Sales", status: "Paid" },
  { id: 4, name: "Sarah Wilson", position: "Finance Analyst", salary: 4800, department: "Finance", status: "Paid" },
  { id: 5, name: "Mike Johnson", position: "Production Lead", salary: 5000, department: "Production", status: "Pending" },
];

const kpiData = [
  { title: "Gross Profit Margin", value: "33.6%", change: "+2.4%", trend: "up", color: "text-emerald-600" },
  { title: "Operating Margin", value: "28.2%", change: "+1.8%", trend: "up", color: "text-emerald-600" },
  { title: "Current Ratio", value: "2.45", change: "+0.15", trend: "up", color: "text-emerald-600" },
  { title: "ROI", value: "18.7%", change: "-0.3%", trend: "down", color: "text-red-600" },
];

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("6M");

  // Enhanced sidebar menu items
  const menuItems = [
    { name: "Overview", icon: <Target size={20} />, id: "overview" },
    { name: "Cash Flow", icon: <TrendingUp size={20} />, id: "cashflow" },
    { name: "Payroll Management", icon: <Users size={20} />, id: "payroll" },
    { name: "Financial Reports", icon: <FileText size={20} />, id: "reports" },
    { name: "Budget Planning", icon: <Briefcase size={20} />, id: "budget" },
    { name: "Compliance", icon: <Building size={20} />, id: "compliance" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Finance Hub</h2>
              <p className="text-sm text-gray-500">Financial Management</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
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
              <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive financial overview and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {["1M", "3M", "6M", "1Y"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Render Content Based on Active Tab */}
          {activeTab === "overview" && (
            <>
              {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <div className={`flex items-center mt-2 ${kpi.color}`}>
                        {kpi.trend === "up" ? (
                          <ArrowUpRight size={16} className="mr-1" />
                        ) : (
                          <ArrowDownRight size={16} className="mr-1" />
                        )}
                        <span className="text-sm font-medium">{kpi.change}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      kpi.trend === "up" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {kpi.trend === "up" ? (
                        <TrendingUp className="text-emerald-600" size={24} />
                      ) : (
                        <TrendingDown className="text-red-600" size={24} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(1283000)}</h2>
                    <p className="text-emerald-100 text-sm mt-1">+12.5% from last month</p>
                  </div>
                  <DollarSign size={40} className="text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(923000)}</h2>
                    <p className="text-red-100 text-sm mt-1">+8.2% from last month</p>
                  </div>
                  <TrendingDown size={40} className="text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Net Profit</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(360000)}</h2>
                    <p className="text-blue-100 text-sm mt-1">+18.7% from last month</p>
                  </div>
                  <Target size={40} className="text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Cash Flow</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(480000)}</h2>
                    <p className="text-purple-100 text-sm mt-1">+15.3% from last month</p>
                  </div>
                  <TrendingUp size={40} className="text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue vs Expenses Chart */}
            <Card className="lg:col-span-2 bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Revenue & Expenses Trend</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-gray-400" />
                    <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                      <option>Last 6 months</option>
                      <option>Last year</option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueExpensesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorExpenses)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Breakdown Pie Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Description</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Amount</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-sm text-gray-600">{tx.date}</td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{tx.type}</p>
                              <p className="text-xs text-gray-500">{tx.category}</p>
                            </div>
                          </td>
                          <td className={`py-3 px-2 text-right font-semibold ${
                            tx.category === "Income" ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {tx.category === "Income" ? "+" : "-"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              tx.status === "Completed" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {tx.status === "Completed" ? (
                                <CheckCircle size={12} className="mr-1" />
                              ) : (
                                <AlertCircle size={12} className="mr-1" />
                              )}
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Employee Payroll */}
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Payroll Overview</h3>
                  <Button variant="outline" size="sm">Manage Payroll</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Employee</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Department</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Salary</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeSalaries.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.position}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">{emp.department}</td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            {formatCurrency(emp.salary)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              emp.status === "Paid" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {emp.status === "Paid" ? (
                                <CheckCircle size={12} className="mr-1" />
                              ) : (
                                <AlertCircle size={12} className="mr-1" />
                              )}
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
            </>
          )}

          {/* Cash Flow Tab */}
          {activeTab === "cashflow" && (
            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Cash Flow Analysis</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="outflow" stackId="2" stroke="#EF4444" fill="#EF4444" />
                      <Area type="monotone" dataKey="net" stackId="3" stroke="#3B82F6" fill="#3B82F6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === "payroll" && (
            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payroll Management</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Employee</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Department</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Salary</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeSalaries.map((emp) => (
                          <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium text-gray-900">{emp.name}</p>
                                <p className="text-sm text-gray-500">{emp.position}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-gray-600">{emp.department}</td>
                            <td className="py-3 px-2 text-right font-semibold">{formatCurrency(emp.salary)}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                emp.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Button size="sm" variant="outline">Process</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <FileText size={48} className="mx-auto text-blue-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Monthly Report</h3>
                    <p className="text-gray-600 text-sm mb-4">Comprehensive monthly financial summary</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <TrendingUp size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Profit & Loss</h3>
                    <p className="text-gray-600 text-sm mb-4">Detailed P&L statement</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <DollarSign size={48} className="mx-auto text-purple-600 mb-4" />
                    <h3 className="font-bold text-lg mb-2">Cash Flow Report</h3>
                    <p className="text-gray-600 text-sm mb-4">Cash flow analysis and projections</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && (
            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Budget Planning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-4">Budget vs Actual</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueExpensesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="revenue" fill="#10B981" name="Actual Revenue" />
                          <Bar dataKey="expenses" fill="#EF4444" name="Actual Expenses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Budget Allocation</h4>
                      <div className="space-y-4">
                        {expenseBreakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Compliance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>VAT Returns</span>
                        <CheckCircle className="text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span>Income Tax</span>
                        <AlertCircle className="text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span>EPF/ETF</span>
                        <CheckCircle className="text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Audit Trail</h3>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="font-medium">Last Audit: March 2024</p>
                        <p className="text-gray-600">Status: Compliant</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Next Review: September 2024</p>
                        <p className="text-gray-600">Preparation: In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
