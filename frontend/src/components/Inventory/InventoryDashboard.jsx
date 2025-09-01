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
  const [requests, setRequests] = useState([
    {
      id: 1,
      team: "Production A",
      item: "Clear PET Bottles",
      qty: 5000,
      status: "Pending",
    },
    {
      id: 2,
      team: "Production B",
      item: "Recycled PET Powder",
      qty: 2000,
      status: "Pending",
    },
    {
      id: 3,
      team: "Production C",
      item: "Green HDPE Bottles",
      qty: 3000,
      status: "Accepted",
    },
  ]);

  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/inventory");
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  const handleRequestAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          if (action === "Accepted") {
            const invIndex = inventory.findIndex((i) => i.name === req.item);
            if (invIndex !== -1 && inventory[invIndex].stock >= req.qty) {
              const updatedInventory = [...inventory];
              updatedInventory[invIndex] = {
                ...updatedInventory[invIndex],
                stock: updatedInventory[invIndex].stock - req.qty,
              };
              setInventory(updatedInventory);
              return { ...req, status: "Accepted" };
            } else {
              alert(`Not enough stock of ${req.item} to accept request!`);
              return req;
            }
          }
          if (action === "Rejected") return { ...req, status: "Rejected" };
        }
        return req;
      })
    );
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
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">EcoCycle Inventory</h2>
              <p className="text-sm text-gray-500">Waste Management System</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/inventory"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-green-600 text-white shadow-lg"
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-gray-500">Total Collected</p>
            <h2 className="text-2xl font-bold text-green-600">
              {inventory.reduce((sum, i) => sum + i.stock, 0)} Bottles
            </h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500">Total Stock (Kg)</p>
            <h2 className="text-2xl font-bold text-green-500">{totalWeight}</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
            <p className="text-gray-500">Pending Requests</p>
            <h2 className="text-2xl font-bold text-orange-500">
              {requests.filter((r) => r.status === "Pending").length}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500">Completed Orders</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {requests.filter((r) => r.status === "Accepted").length}
            </h2>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6 relative w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, color, or processed form..."
            className="w-full pl-10 p-3 border rounded-lg shadow focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Production Requests */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Production Requests</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{req.team}</p>
                  <p className="text-sm text-gray-500">
                    {req.qty} units of {req.item}
                  </p>
                  <p
                    className={`text-xs ${
                      req.status === "Pending"
                        ? "text-orange-500"
                        : req.status === "Accepted"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {req.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestAction(req.id, "Accepted")}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.id, "Rejected")}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Items & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventory.map((item) => (
              <div key={item._id} className="bg-white p-5 rounded-xl shadow-md">
                {item.imageUrl && (
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                <p className="text-sm text-gray-500 mb-1">
                  Code: <b>{item.itemCode}</b>
                </p>
                <div className="flex gap-2 my-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {item.color}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-600">
                  Weight: <b>{item.weight} Kg</b>
                </p>
                <p className="text-gray-600">
                  Stock Level: <b>{item.stock}</b>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-md">
              <h2 className="font-semibold mb-3">Stock Levels</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-md">
              <h2 className="font-semibold mb-3">Color Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={colorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {colorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
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
