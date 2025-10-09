import React, { useState, useEffect } from "react";
import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../common/LogoutButton";
import StockLevelsChart from "./StockLevelsChart";
import {
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [requestCount, setRequestCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const menuItems = [
    { name: "Inventory Overview", key: "overview", icon: <CubeIcon className="w-5 h-5" /> },
    { name: "Stock Management", key: "stock", icon: <ChartBarIcon className="w-5 h-5" /> },
    { name: "Analytics", key: "analytics", icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
  ];

  useEffect(() => {
    fetchInventory();
    fetchRequests();
    // Auto-refresh every 30 seconds to show new items and requests
    const interval = setInterval(() => {
      fetchInventory();
      fetchRequests();
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

  // Custom label for pie slices: show Color and Percentage in the slice color
  const renderSliceLabel = (props) => {
    const { cx, cy, midAngle, innerRadius = 0, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    // place label at the middle of the slice
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    const pct = `${(percent * 100).toFixed(0)}%`;
    return (
      <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {pct}
      </text>
    );
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/production-requests");
      if (Array.isArray(res.data)) {
        const pending = res.data.filter(r => (r.status || '').toLowerCase() === 'pending').length;
        setRequestCount(pending);
      } else {
        setRequestCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch production requests:", err);
      setRequestCount(0);
    }
  };



  // removed profile icon and upload handler

  const totalWeight = inventory.reduce((sum, i) => sum + i.weight, 0);

  // Apply search filter: Processed Form only (prefix match)
  const filteredInventory = inventory.filter((item) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return true;
    return String(item.type || '').toLowerCase().startsWith(needle);
  });

  const barData = inventory
    .map((item) => ({ name: item.name, stock: Number(item.stock) || 0 }))
    .sort((a, b) => b.stock - a.stock);

  const colorData = [
    { name: "Clear", value: inventory.filter((i) => i.color === "Clear").length },
    { name: "Green", value: inventory.filter((i) => i.color === "Green").length },
    { name: "Brown", value: inventory.filter((i) => i.color === "Brown").length },
    { name: "Mixed", value: inventory.filter((i) => i.color === "Mixed").length },
  ];
  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"];

  // Custom tick for prettier item names on X axis
  const renderNameTick = (props) => {
    const { x, y, payload } = props;
    const name = String(payload?.value ?? "");
    const maxLen = 16;
    const display = name.length > maxLen ? `${name.slice(0, maxLen)}…` : name;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={12}
          textAnchor="end"
          fill="#0f172a"
          fontSize={12}
          fontWeight={500}
          transform="rotate(-30)"
        >
          {display}
        </text>
        {/* Native tooltip on hover shows the full name */}
        <title>{name}</title>
      </g>
    );
  };

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
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Overview</span>
          </Link>
          <Link
            to="/inventory/stock"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </Link>
          <Link
            to="/inventory/requests"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link
            to="/inventory/deliveries"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="font-medium">Delivery Records</span>
          </Link>
          
          <Link
            to="/inventory/analytics"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link
            to="/inventory/materials"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link
            to="/inventory/reports"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header (profile icon removed) */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-600 mt-1">Track and manage recyclable materials</p>
            </div>
            {/* right side intentionally left empty to remove profile icon */}
            <div />
          </div>
        </header>

        <div className="p-6">

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Collected</p>
                <h2 className="text-3xl font-bold">{(inventory.reduce((sum, i) => sum + (Number(i.stock) || 0), 0)).toFixed(3)} Kg</h2>
                <p className="text-emerald-100 text-sm mt-1">Items in inventory</p>
              </div>
              <CubeIcon className="w-10 h-10 text-emerald-200" />
            </div>
          </div>

          <Link
            to="/inventory/requests"
            className="block bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6 hover:from-blue-600 hover:to-blue-700 transition-colors"
            title="Go to Production Requests"
         >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Pending Requests</p>
                <h2 className="text-3xl font-bold">{requestCount}</h2>
                <p className="text-blue-100 text-sm mt-1">Awaiting action</p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-blue-200" />
            </div>
          </Link>

          <Link
            to="/inventory/materials?highlight=low"
            state={{ highlightLowStock: true }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6 hover:from-orange-600 hover:to-orange-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                <h2 className="text-3xl font-bold">{inventory.filter((i) => i.stock < 10).length}</h2>
                <p className="text-orange-100 text-sm mt-1">Need restocking</p>
              </div>
              <DocumentChartBarIcon className="w-10 h-10 text-orange-200" />
            </div>
          </Link>

          <Link
            to="/inventory/materials"
            className="block bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl p-6 hover:from-purple-600 hover:to-purple-700 transition-colors"
            title="Go to Raw Materials"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Material Types</p>
                <h2 className="text-3xl font-bold">{inventory.length}</h2>
                <p className="text-purple-100 text-sm mt-1">Different materials</p>
              </div>
              <ArrowTrendingUpIcon className="w-10 h-10 text-purple-200" />
            </div>
          </Link>
        </div>

        {/* Enhanced Search bar */}
        <div className="mb-8 relative w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
          <input
            type="text"
            value={searchTerm}
            onKeyDown={(e) => {
              const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
              const isLetter = /^[a-zA-Z]$/.test(e.key);
              const isSpace = e.key === ' ';
              if (!isLetter && !isSpace && !allowedControl.includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const v = e.target.value;
              const lettersOnly = /^[\p{L}\s]*$/u; // letters and spaces only
              if (!lettersOnly.test(v)) return;
              setSearchTerm(v);
            }}
            placeholder="Search Processed Form..."
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>


        {/* Enhanced Inventory Items & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInventory.map((item) => (
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  <span className="font-extrabold text-emerald-700">{Number(item.stock || 0).toFixed(3)} Kg</span>
                  <span className="mx-2 text-gray-300">—</span>
                  {item.type}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Code: <span className="font-semibold text-gray-700">{item.itemCode}</span>
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                    {item.color}
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-medium rounded-full">
                    {item.name}
                  </span>
                </div>
                {/* Removed separate weight/stock rows; stock displayed inline with title */}
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </p>
              </div>
            ))}
            {inventory.length > 0 && filteredInventory.length === 0 && (
              <div className="md:col-span-2 text-center text-gray-500 bg-gray-50 p-8 rounded-xl border border-gray-200">
                <p className="text-lg font-medium">No items match your search</p>
                <p className="text-sm">Try a different Processed Form</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Stock Levels</h2>
              <StockLevelsChart inventory={inventory} height={380} />
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
                    label={renderSliceLabel}
                    labelLine={false}
                  >
                    {colorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
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
