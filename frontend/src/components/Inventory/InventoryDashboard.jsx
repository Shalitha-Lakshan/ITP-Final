import React, { useState, useEffect } from "react";
import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);

  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchProductionRequests();
    // Auto-refresh every 30 seconds to show new items
    const interval = setInterval(() => {
      fetchInventory();
      fetchProductionRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const fetchProductionRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/production-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch production requests:", err);
    }
  };

  const handleRequestAction = async (requestId, action, approvedBy = "Inventory Manager") => {
    try {
      await axios.put(`http://localhost:5000/api/production-requests/${requestId}/status`, {
        status: action,
        approvedBy: approvedBy
      });
      
      // Refresh both requests and inventory data
      await fetchProductionRequests();
      await fetchInventory();
      
      alert(`Request ${action.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(`Failed to ${action.toLowerCase()} request:`, err);
      alert(`Failed to ${action.toLowerCase()} request. Please try again.`);
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  const totalWeight = inventory.reduce((sum, i) => sum + i.weight, 0);

  const barData = inventory.map((item) => ({
    name: item.name,
    stock: item.stock,
  }));

  const colorData = [
    { name: "Clear", value: inventory.filter((i) => i.color === "Clear").length },
    { name: "Green", value: inventory.filter((i) => i.color === "Green").length },
    { name: "Brown", value: inventory.filter((i) => i.color === "Brown").length },
    { name: "Mixed", value: inventory.filter((i) => i.color === "Mixed").length },
  ];
  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inventory Hub</h2>
              <p className="text-sm text-gray-500">Material Management</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/inventory"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/inventory/forms"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Forms</span>
          </Link>
          <Link
            to="/inventory/materials"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link
            to="/inventory/reports"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-600 mt-1">Track and manage recyclable materials</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profilePic || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border cursor-pointer hover:ring-2 hover:ring-green-500"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    <label
                      htmlFor="upload-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Upload Picture
                    </label>
                    <input
                      type="file"
                      id="upload-profile"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileUpload}
                    />
                    <Link
                      to="/inventory/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => alert("Logged out")}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                + Add Item
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Collected</p>
                <h2 className="text-3xl font-bold">{inventory.reduce((sum, i) => sum + i.stock, 0)}</h2>
                <p className="text-emerald-100 text-sm mt-1">Items in inventory</p>
              </div>
              <CubeIcon className="w-10 h-10 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Weight</p>
                <h2 className="text-3xl font-bold">{totalWeight.toFixed(1)} kg</h2>
                <p className="text-blue-100 text-sm mt-1">Material weight</p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Requests</p>
                <h2 className="text-3xl font-bold">{requests.filter((r) => r.status === "Pending").length}</h2>
                <p className="text-orange-100 text-sm mt-1">Awaiting approval</p>
              </div>
              <DocumentChartBarIcon className="w-10 h-10 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed Orders</p>
                <h2 className="text-3xl font-bold">{requests.filter((r) => r.status === "Accepted").length}</h2>
                <p className="text-purple-100 text-sm mt-1">Successfully processed</p>
              </div>
              <ArrowTrendingUpIcon className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Enhanced Search bar */}
        <div className="mb-8 relative w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
          <input
            type="text"
            placeholder="Search by name, color, or processed form..."
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Enhanced Production Requests */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Production Requests</h3>
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{req.team}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p><strong>Item:</strong> {req.inventoryItemId?.name || 'Unknown Item'}</p>
                  <p><strong>Quantity:</strong> {req.requestedQty}</p>
                  <p><strong>Priority:</strong> {req.priority}</p>
                  {req.notes && <p><strong>Notes:</strong> {req.notes}</p>}
                </div>
                {req.status === "Pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRequestAction(req._id, "Approved")}
                      className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequestAction(req._id, "Rejected")}
                      className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Inventory Items & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventory.map((item) => (
              <div key={item._id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                {item.imageUrl ? (
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                    <CubeIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Code: <span className="font-semibold text-gray-700">{item.itemCode}</span>
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                    {item.color}
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-medium rounded-full">
                    {item.type}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-700 flex justify-between">
                    <span>Weight:</span> <span className="font-semibold">{item.weight} Kg</span>
                  </p>
                  <p className="text-gray-700 flex justify-between">
                    <span>Stock Level:</span> <span className="font-semibold">{item.stock}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Levels</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="stock" 
                    fill="url(#stockGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Material Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={colorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {colorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
