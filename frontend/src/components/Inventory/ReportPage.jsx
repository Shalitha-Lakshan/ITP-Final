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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-green-600 text-white w-64 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">EcoRecycle</h2>
        <nav className="space-y-4">
          <Link to="/inventory" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <ChartBarIcon className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/inventory/forms" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <CubeIcon className="w-5 h-5" /> Inventory Forms
          </Link>
          <Link to="/inventory/materials" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <ArrowTrendingUpIcon className="w-5 h-5" /> Raw Materials
          </Link>
          <Link to="/inventory/reports" className="flex items-center gap-2 bg-green-700 p-2 rounded-lg">
            <DocumentChartBarIcon className="w-5 h-5" /> Reports
          </Link>
        </nav>
      </aside>

      {/* Main Reports Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
            <DocumentChartBarIcon className="w-8 h-8 text-green-600" /> Inventory Reports
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="w-5 h-5" /> CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
            >
              <ArrowDownTrayIcon className="w-5 h-5" /> PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Item */}
            <select
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Items</option>
              <option value="Mud">Mud</option>
              <option value="Colors">Colors</option>
              <option value="Powders">Powders</option>
              <option value="Rice">Rice</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Filter by Date */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Filtered Results</h2>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">Team</th>
                <th className="p-3 border">Item</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{r.team}</td>
                    <td className="p-3 border">{r.item}</td>
                    <td className="p-3 border">{r.qty}</td>
                    <td className="p-3 border">{r.status}</td>
                    <td className="p-3 border">{r.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Stock Summary */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Current Stock</h2>
          <p>Mud: {stock.mud} Kg</p>
          <p>Colors: {stock.colors} Kg</p>
          <p>Powders: {stock.powders} Kg</p>
          <p>Rice: {stock.rice} Kg</p>
          <p className="font-bold mt-2">Total: {totalStock} Kg</p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Stock Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Stock Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stockData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Requests by Item Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Requests by Item</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requestsByItem}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Requests Over Time Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Requests Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={requestsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="qty" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
