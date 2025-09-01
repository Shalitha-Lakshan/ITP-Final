import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function InventorySorting() {
  const [sorting, setSorting] = useState({ mud: 0, rices: 0, powder: 0 });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Updated Sorting:\nMud: ${sorting.mud} Kg\nRices: ${sorting.rices} Kg\nPowder: ${sorting.powder} Kg`);
  };

  const sortingData = [
    { name: "Mud Color", value: sorting.mud },
    { name: "Rices", value: sorting.rices },
    { name: "Powder", value: sorting.powder },
  ];

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
              <p className="text-sm text-gray-500">Sorting & Processing</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/inventory"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
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
            to="/inventory/sorting"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Sorting</span>
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
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sorting Management</h1>
              <p className="text-gray-600 mt-1">Manage and track material sorting operations</p>
            </div>
            <Link to="/inventory/profile">
              <UserCircleIcon className="w-10 h-10 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
            </Link>
          </div>
        </div>

        {/* Enhanced Update Sorting Form */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Update Sorting Stock</h3>
          </div>
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mud Color (Kg)</label>
              <input
                type="text"
                placeholder="Enter quantity"
                value={sorting.mud}
                maxLength={3}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,3}$/.test(val)) {
                    setSorting({ ...sorting, mud: val === "" ? 0 : Number(val) });
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Rices (Kg)</label>
              <input
                type="text"
                placeholder="Enter quantity"
                value={sorting.rices}
                maxLength={3}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,3}$/.test(val)) {
                    setSorting({ ...sorting, rices: val === "" ? 0 : Number(val) });
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Powder (Kg)</label>
              <input
                type="text"
                placeholder="Enter quantity"
                value={sorting.powder}
                maxLength={3}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,3}$/.test(val)) {
                    setSorting({
                      ...sorting,
                      powder: val === "" ? 0 : Number(val),
                    });
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Enhanced Sorting Stock Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Current Sorting Stock</h3>
              <p className="text-sm text-gray-600">Real-time inventory levels by material type</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sortingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="sortingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#sortingGradient)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
