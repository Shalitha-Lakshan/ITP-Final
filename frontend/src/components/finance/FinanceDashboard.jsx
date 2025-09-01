// src/components/FinanceDashboard.jsx
import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { DollarSign, CreditCard, TrendingDown, FileText } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const revenueExpensesData = [
  { month: "Jan", revenue: 12000, expenses: 8000 },
  { month: "Feb", revenue: 15000, expenses: 9500 },
  { month: "Mar", revenue: 18000, expenses: 12000 },
  { month: "Apr", revenue: 20000, expenses: 14000 },
  { month: "May", revenue: 22000, expenses: 15000 },
];

const salaryTrendData = [
  { month: "Jan", salaries: 4000 },
  { month: "Feb", salaries: 4500 },
  { month: "Mar", salaries: 4800 },
  { month: "Apr", salaries: 5000 },
  { month: "May", salaries: 5200 },
];

const recentTransactions = [
  { id: 1, date: "2025-08-25", type: "Salary Payment", amount: 2000, status: "Completed" },
  { id: 2, date: "2025-08-27", type: "Purchase Expense", amount: 1200, status: "Pending" },
  { id: 3, date: "2025-08-28", type: "Revenue - Product Sales", amount: 5000, status: "Completed" },
];

const employeeSalaries = [
  { id: 1, name: "John Doe", position: "Transport Staff", salary: 1000, status: "Paid" },
  { id: 2, name: "Jane Smith", position: "Inventory Manager", salary: 1200, status: "Pending" },
  { id: 3, name: "Mark Lee", position: "Sales Manager", salary: 1500, status: "Paid" },
];

export default function FinanceDashboard() {
  // Sidebar menu items
  const menuItems = [
    { name: "Salaries & Staff Payments", icon: <CreditCard size={20} /> },
    { name: "Financial Records", icon: <DollarSign size={20} /> },
    { name: "EPF/ETF Contributions", icon: <TrendingDown size={20} /> },
    { name: "Financial Reports", icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-8">Finance</h2>
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <Button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md">+ Add Transaction</Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <DollarSign className="text-green-600" size={32} />
              <div>
                <p className="text-gray-500">Total Revenue</p>
                <h2 className="text-xl font-bold">$87,000</h2>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <TrendingDown className="text-red-600" size={32} />
              <div>
                <p className="text-gray-500">Total Expenses</p>
                <h2 className="text-xl font-bold">$56,000</h2>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <CreditCard className="text-blue-600" size={32} />
              <div>
                <p className="text-gray-500">Salaries Paid</p>
                <h2 className="text-xl font-bold">$25,000</h2>
              </div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <CardContent className="flex items-center space-x-4">
              <FileText className="text-purple-600" size={32} />
              <div>
                <p className="text-gray-500">Pending Payments</p>
                <h2 className="text-xl font-bold">$3,500</h2>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Revenue vs Expenses</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#16a34a" />
                <Bar dataKey="expenses" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Monthly Salaries</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salaryTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="salaries" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="border-b">
                    <td className="p-2">{tx.date}</td>
                    <td className="p-2">{tx.type}</td>
                    <td className="p-2">${tx.amount}</td>
                    <td className={`p-2 font-semibold ${tx.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="p-4 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Employee Salaries</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Position</th>
                  <th className="p-2">Salary</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {employeeSalaries.map(emp => (
                  <tr key={emp.id} className="border-b">
                    <td className="p-2">{emp.name}</td>
                    <td className="p-2">{emp.position}</td>
                    <td className="p-2">${emp.salary}</td>
                    <td className={`p-2 font-semibold ${emp.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                      {emp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
