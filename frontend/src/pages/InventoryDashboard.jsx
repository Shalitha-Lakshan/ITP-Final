import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  UserCircleIcon, CubeIcon, ChartBarIcon, DocumentChartBarIcon,
  ArrowTrendingUpIcon, InboxArrowDownIcon, CheckIcon, XMarkIcon
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

const sortingData = [
  { name: "Mud Color", value: 400 },
  { name: "Rices", value: 300 },
  { name: "Powder", value: 300 },
];

const COLORS = ["#16a34a", "#FF9800", "#4CAF50"]; // green, orange, light green

export default function InventoryDashboard() {
  const [bottles, setBottles] = useState("");
  const [sorting, setSorting] = useState({ mud: "", rices: "", powder: "" });
  const [requests, setRequests] = useState([
    { id: 1, team: "Production A", item: "Rices", qty: 200, status: "Pending" },
    { id: 2, team: "Production B", item: "Powder", qty: 150, status: "Pending" },
  ]);

  const handleRequestAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

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
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          {/* ✅ Profile icon wrapped with Link */}
          <Link to="/inventory/profile">
            <UserCircleIcon
              className="w-10 h-10 text-gray-700 cursor-pointer hover:text-green-600 transition"
            />
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-gray-500">Total Collected</p>
            <h2 className="text-2xl font-bold text-green-600">10,500 Bottles</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500">Sorted (Kg)</p>
            <h2 className="text-2xl font-bold text-green-500">5,200</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
            <p className="text-gray-500">Pending Requests</p>
            <h2 className="text-2xl font-bold text-orange-500">{requests.filter(r => r.status==="Pending").length}</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500">Completed Orders</p>
            <h2 className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status==="Accepted").length}</h2>
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
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Submit
              </button>
            </form>
          </div>

          {/* Sorting Entry */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Sorting Details</h3>
            <form className="space-y-3">
              <input type="number" placeholder="Mud Color (Kg)" value={sorting.mud}
                onChange={(e)=>setSorting({...sorting, mud:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"/>
              <input type="number" placeholder="Rices (Kg)" value={sorting.rices}
                onChange={(e)=>setSorting({...sorting, rices:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"/>
              <input type="number" placeholder="Powder (Kg)" value={sorting.powder}
                onChange={(e)=>setSorting({...sorting, powder:e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"/>
              <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
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
                  <p className="text-sm text-gray-500">{req.qty} Kg of {req.item}</p>
                  <p className={`text-xs ${req.status==="Pending" ? "text-orange-500" : req.status==="Accepted" ? "text-green-600" : "text-red-500"}`}>
                    {req.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handleRequestAction(req.id,"Accepted")} className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
                    <CheckIcon className="w-4 h-4"/>
                  </button>
                  <button onClick={()=>handleRequestAction(req.id,"Rejected")} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                    <XMarkIcon className="w-4 h-4"/>
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

          {/* Production Requests Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Production Requests</h3>
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
