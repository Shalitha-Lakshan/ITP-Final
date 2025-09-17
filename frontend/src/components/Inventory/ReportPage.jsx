import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer,
} from "recharts";

// 🎨 Chart Colors
const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444"];

export default function ReportPage() {
  // 📦 Mock Inventory Stock
  const [stock] = useState({
    mud: 300,
    colors: 250,
    powders: 200,
    rice: 150,
  });

  // 📦 Mock Requests Data
  const [requests] = useState([
    { id: 1, team: "Production A", item: "Colors", qty: 100, status: "Accepted", date: "2025-08-01" },
    { id: 2, team: "Production B", item: "Powders", qty: 120, status: "Rejected", date: "2025-08-05" },
    { id: 3, team: "Production C", item: "Rice", qty: 80, status: "Accepted", date: "2025-08-10" },
    { id: 4, team: "Production D", item: "Mud", qty: 50, status: "Accepted", date: "2025-08-15" },
  ]);

  // 🔎 Filters
  const [filterItem, setFilterItem] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Apply Filters
  const filteredRequests = requests.filter((r) => {
    return (
      (filterItem ? r.item === filterItem : true) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (filterDate ? r.date === filterDate : true)
    );
  });

  const totalStock = stock.mud + stock.colors + stock.powders + stock.rice;

  // 📌 Download CSV
  const handleDownloadCSV = () => {
    const headers = ["Team", "Item", "Quantity", "Status", "Date"];
    const csvRows = [
      headers.join(","),
      ...filteredRequests.map((r) => [r.team, r.item, r.qty, r.status, r.date].join(",")),
    ];
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_inventory_report.csv";
    a.click();
  };

  // 📌 Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 15);

    autoTable(doc, {
      head: [["Team", "Item", "Quantity", "Status", "Date"]],
      body: filteredRequests.map((r) => [r.team, r.item, r.qty, r.status, r.date]),
      startY: 20,
    });

    doc.save("filtered_inventory_report.pdf");
  };

  // 📊 Chart Data
  const stockData = [
    { name: "Mud", value: stock.mud },
    { name: "Colors", value: stock.colors },
    { name: "Powders", value: stock.powders },
    { name: "Rice", value: stock.rice },
  ];

  const requestsByItem = Object.values(
    requests.reduce((acc, r) => {
      acc[r.item] = acc[r.item] || { name: r.item, total: 0 };
      acc[r.item].total += r.qty;
      return acc;
    }, {})
  );

  const requestsOverTime = requests.map((r) => ({
    date: r.date,
    qty: r.qty,
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <DocumentChartBarIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inventory Hub</h2>
              <p className="text-sm text-gray-500">Reports & Analytics</p>
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
            to="/inventory/materials" 
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link 
            to="/inventory/reports" 
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
        </nav>
      </aside>

      {/* Main Reports Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
                <p className="text-gray-600 mt-1">Comprehensive analytics and data insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Filter Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filter by Item */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Item</label>
              <select
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Items</option>
                <option value="Mud">Mud</option>
                <option value="Colors">Colors</option>
                <option value="Powders">Powders</option>
                <option value="Rice">Rice</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Filter by Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Report Table */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DocumentChartBarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Filtered Results</h2>
              <p className="text-sm text-gray-600">Showing {filteredRequests.length} records</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-900 rounded-tl-xl">Team</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Item</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Quantity</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900 rounded-tr-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((r, index) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-4 font-medium text-gray-900">{r.team}</td>
                      <td className="p-4 text-gray-700">{r.item}</td>
                      <td className="p-4 text-gray-700">{r.qty} kg</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          r.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{r.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <DocumentChartBarIcon className="w-12 h-12 text-gray-300" />
                        <span>No matching records found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Stock Summary */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CubeIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Stock Summary</h2>
              <p className="text-sm text-gray-600">Real-time inventory levels</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-sm font-medium text-blue-700">Mud</p>
              <p className="text-2xl font-bold text-blue-900">{stock.mud} Kg</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <p className="text-sm font-medium text-purple-700">Colors</p>
              <p className="text-2xl font-bold text-purple-900">{stock.colors} Kg</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-sm font-medium text-green-700">Powders</p>
              <p className="text-2xl font-bold text-green-900">{stock.powders} Kg</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <p className="text-sm font-medium text-orange-700">Rice</p>
              <p className="text-2xl font-bold text-orange-900">{stock.rice} Kg</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-700">Total Stock</p>
            <p className="text-3xl font-bold text-gray-900">{totalStock} Kg</p>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Stock Distribution Pie Chart */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Stock Distribution</h3>
                <p className="text-sm text-gray-600">Current inventory breakdown</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="pieGradient4" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <Pie 
                  data={stockData} 
                  dataKey="value" 
                  nameKey="name" 
                  outerRadius={100} 
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill="url(#pieGradient1)" />
                  <Cell fill="url(#pieGradient2)" />
                  <Cell fill="url(#pieGradient3)" />
                  <Cell fill="url(#pieGradient4)" />
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Requests by Item Bar Chart */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Requests by Item</h3>
                <p className="text-sm text-gray-600">Total request quantities</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={requestsByItem} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
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
                  dataKey="total" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Requests Over Time Line Chart */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DocumentChartBarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Requests Over Time</h3>
                <p className="text-sm text-gray-600">Request trends by date</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={requestsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
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
                <Line 
                  type="monotone" 
                  dataKey="qty" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#lineGradient)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
