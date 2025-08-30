import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  CubeIcon, ChartBarIcon, DocumentChartBarIcon,
  ArrowTrendingUpIcon, InboxArrowDownIcon,
  CheckIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

// Mock Data
const collectionData = [
  { month: "Jan", bottles: 1200 },
  { month: "Feb", bottles: 1900 },
  { month: "Mar", bottles: 1500 },
  { month: "Apr", bottles: 2100 },
  { month: "May", bottles: 2500 },
];

const COLORS = ["#16a34a", "#FF9800", "#4CAF50"];

export default function InventoryDashboard() {
  const [bottles, setBottles] = useState("");
  const [sortingInput, setSortingInput] = useState({ mud: "", rices: "", powder: "" });

  // ✅ Inventory stock (initial values)
  const [sortingStock, setSortingStock] = useState({ mud: 500, rices: 400, powder: 300 });

  const [requests, setRequests] = useState([
    { id: 1, team: "Production A", item: "rices", qty: 200, status: "Pending" },
    { id: 2, team: "Production B", item: "powder", qty: 150, status: "Pending" },
  ]);

  // Profile state
  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // ✅ Accept/Reject with stock update
  const handleRequestAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          if (action === "Accepted") {
            const itemKey = req.item.toLowerCase();
            if (sortingStock[itemKey] >= req.qty) {
              // reduce stock
              setSortingStock((prevStock) => ({
                ...prevStock,
                [itemKey]: prevStock[itemKey] - req.qty,
              }));
              return { ...req, status: "Accepted" };
            } else {
              alert(`Not enough stock of ${req.item} to accept request!`);
              return req;
            }
          }
          if (action === "Rejected") {
            return { ...req, status: "Rejected" };
          }
        }
        return req;
      })
    );
  };

  // ✅ Add sorting details to inventory
  const handleSortingSubmit = (e) => {
    e.preventDefault();
    setSortingStock((prev) => ({
      mud: prev.mud + Number(sortingInput.mud || 0),
      rices: prev.rices + Number(sortingInput.rices || 0),
      powder: prev.powder + Number(sortingInput.powder || 0),
    }));
    setSortingInput({ mud: "", rices: "", powder: "" });
    alert("Sorting stock updated successfully!");
  };

  // ✅ Live stock data for charts
  const sortingData = [
    { name: "Mud Color", value: sortingStock.mud },
    { name: "Rices", value: sortingStock.rices },
    { name: "Powder", value: sortingStock.powder },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-green-600 text-white w-64 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">EcoRecycle</h2>
        <nav className="space-y-4">
          <Link to="/inventory" className="flex items-center gap-2 bg-green-700 p-2 rounded-lg">
            <ChartBarIcon className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/inventory/forms" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <CubeIcon className="w-5 h-5" /> Inventory Forms
          </Link>
          <Link to="/inventory/sorting" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <ArrowTrendingUpIcon className="w-5 h-5" /> Sorting
          </Link>
          <Link to="/inventory/reports" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition">
            <DocumentChartBarIcon className="w-5 h-5" /> Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10 relative">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
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
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-gray-500">Total Collected</p>
            <h2 className="text-2xl font-bold text-green-600">10,500 Bottles</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500">Total Stock (Kg)</p>
            <h2 className="text-2xl font-bold text-green-500">
              {sortingStock.mud + sortingStock.rices + sortingStock.powder}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
            <p className="text-gray-500">Pending Requests</p>
            <h2 className="text-2xl font-bold text-orange-500">
              {requests.filter(r => r.status === "Pending").length}
            </h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500">Completed Orders</p>
            <h2 className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === "Accepted").length}
            </h2>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Receive Bottles */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <InboxArrowDownIcon className="w-6 h-6 text-green-600" /> Receive Bottles
            </h3>
            <form className="space-y-4">
              <input
                type="number"
                placeholder="Number of bottles"
                value={bottles}
                onChange={(e) => setBottles(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Sorting Entry */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Sorting Details</h3>
            <form className="space-y-3" onSubmit={handleSortingSubmit}>
              <input
                type="number"
                placeholder="Mud Color (Kg)"
                value={sortingInput.mud}
                onChange={(e)=>setSortingInput({...sortingInput, mud:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Rices (Kg)"
                value={sortingInput.rices}
                onChange={(e)=>setSortingInput({...sortingInput, rices:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Powder (Kg)"
                value={sortingInput.powder}
                onChange={(e)=>setSortingInput({...sortingInput, powder:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                Save Sorting
              </button>
            </form>
          </div>
        </div>

        {/* Production Requests */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-lg font-semibold mb-4">Production Requests</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{req.team}</p>
                  <p className="text-sm text-gray-500">
                    {req.qty} Kg of {req.item}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collection Trend */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Bottle Collection Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bottles" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sorting Distribution */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Sorting Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sortingData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {sortingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Levels */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Stock Levels</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sortingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
