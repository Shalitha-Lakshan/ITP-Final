// src/components/sales/SalesDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { ShoppingCart, TrendingUp, Users, DollarSign, Package, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const salesData = [
  { month: "Jan", sales: 15000, orders: 120, customers: 85 },
  { month: "Feb", sales: 18000, orders: 145, customers: 102 },
  { month: "Mar", sales: 22000, orders: 180, customers: 125 },
  { month: "Apr", sales: 25000, orders: 200, customers: 140 },
  { month: "May", sales: 28000, orders: 220, customers: 155 },
];

const productSalesData = [
  { name: "Product A", value: 35, sales: 12000 },
  { name: "Product B", value: 25, sales: 8500 },
  { name: "Product C", value: 20, sales: 7000 },
  { name: "Product D", value: 20, sales: 6500 },
];

const recentOrders = [
  { id: "ORD001", customer: "John Smith", product: "Product A", quantity: 5, amount: 500, status: "Completed", date: "2025-08-30" },
  { id: "ORD002", customer: "Sarah Johnson", product: "Product B", quantity: 3, amount: 300, status: "Pending", date: "2025-08-30" },
  { id: "ORD003", customer: "Mike Wilson", product: "Product C", quantity: 8, amount: 800, status: "Shipped", date: "2025-08-29" },
  { id: "ORD004", customer: "Emma Davis", product: "Product A", quantity: 2, amount: 200, status: "Processing", date: "2025-08-29" },
];

const topCustomers = [
  { id: 1, name: "ABC Corporation", totalOrders: 25, totalSpent: 15000, lastOrder: "2025-08-28" },
  { id: 2, name: "XYZ Industries", totalOrders: 18, totalSpent: 12000, lastOrder: "2025-08-27" },
  { id: 3, name: "Tech Solutions Ltd", totalOrders: 15, totalSpent: 9500, lastOrder: "2025-08-26" },
  { id: 4, name: "Global Enterprises", totalOrders: 12, totalSpent: 8000, lastOrder: "2025-08-25" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const menuItems = [
    { name: "Sales Overview", key: "overview", icon: <TrendingUp size={20} /> },
    { name: "Orders Management", key: "orders", icon: <ShoppingCart size={20} /> },
    { name: "Customer Analytics", key: "customers", icon: <Users size={20} /> },
    { name: "Product Performance", key: "products", icon: <Package size={20} /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-100";
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Shipped": return "text-blue-600 bg-blue-100";
      case "Processing": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
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
              <p className="text-gray-500">Total Sales</p>
              <h2 className="text-xl font-bold">$108,000</h2>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <ShoppingCart className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h2 className="text-xl font-bold">865</h2>
              <p className="text-sm text-blue-600">+8% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Users className="text-purple-600" size={32} />
            <div>
              <p className="text-gray-500">Active Customers</p>
              <h2 className="text-xl font-bold">607</h2>
              <p className="text-sm text-purple-600">+15% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <TrendingUp className="text-orange-600" size={32} />
            <div>
              <p className="text-gray-500">Avg Order Value</p>
              <h2 className="text-xl font-bold">$125</h2>
              <p className="text-sm text-orange-600">+5% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Product Sales Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productSalesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );

  const renderOrders = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Orders</h2>
        <Button className="bg-green-600 text-white">+ New Order</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Product</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{order.id}</td>
                <td className="p-3">{order.customer}</td>
                <td className="p-3">{order.product}</td>
                <td className="p-3">{order.quantity}</td>
                <td className="p-3">${order.amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                    <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderCustomers = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Top Customers</h2>
        <Button className="bg-blue-600 text-white">+ Add Customer</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Customer Name</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Last Order</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map(customer => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{customer.name}</td>
                <td className="p-3">{customer.totalOrders}</td>
                <td className="p-3">${customer.totalSpent.toLocaleString()}</td>
                <td className="p-3">{customer.lastOrder}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                    <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderProducts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Product Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productSalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Product Sales Summary</h2>
          <Button className="bg-purple-600 text-white">+ Add Product</Button>
        </div>
        <div className="space-y-4">
          {productSalesData.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="text-right">
                <p className="font-bold">${product.sales.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{product.value}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "orders": return renderOrders();
      case "customers": return renderCustomers();
      case "products": return renderProducts();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-8">Sales</h2>
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === item.key ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
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
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <div className="flex space-x-3">
            <Button variant="outline">Export Report</Button>
            <Button className="bg-green-600 text-white">+ Quick Sale</Button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
