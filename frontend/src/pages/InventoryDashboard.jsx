import React from "react";
import {
  Home,
  User,
  PieChart,
  Archive,
  ClipboardList,
  FileText,
  BarChart2,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Dummy data for charts
const bottleData = [
  { name: "Mon", bottles: 400 },
  { name: "Tue", bottles: 300 },
  { name: "Wed", bottles: 500 },
  { name: "Thu", bottles: 200 },
  { name: "Fri", bottles: 700 },
  { name: "Sat", bottles: 600 },
  { name: "Sun", bottles: 800 },
];

const pieData = [
  { name: "Mud Color", value: 400 },
  { name: "Rice", value: 300 },
  { name: "Powder", value: 300 },
];

const COLORS = ["#16A34A", "#86EFAC", "#22C55E"];

const InventoryDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Inventory</h2>
        <nav className="flex flex-col space-y-4">
          <a href="/inventory" className="flex items-center gap-3 hover:text-green-200">
            <Home className="h-5 w-5" /> Dashboard
          </a>
          <a href="/profile" className="flex items-center gap-3 hover:text-green-200">
            <User className="h-5 w-5" /> Profile
          </a>
          <a href="/sorting" className="flex items-center gap-3 hover:text-green-200">
            <Archive className="h-5 w-5" /> Sorting
          </a>
          <a href="/requests" className="flex items-center gap-3 hover:text-green-200">
            <ClipboardList className="h-5 w-5" /> Requests
          </a>
          <a href="/reports" className="flex items-center gap-3 hover:text-green-200">
            <FileText className="h-5 w-5" /> Reports
          </a>
          <a href="/analytics" className="flex items-center gap-3 hover:text-green-200">
            <BarChart2 className="h-5 w-5" /> Analytics
          </a>
          <a href="/logout" className="flex items-center gap-3 text-red-300 hover:text-red-400 mt-6">
            <LogOut className="h-5 w-5" /> Logout
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Inventory Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">Inventory Manager</span>
            <img
              src="https://ui-avatars.com/api/?name=Inventory+Manager&background=16A34A&color=fff"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-green-600"
            />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Collected Bottles</h3>
            <p className="text-3xl font-bold text-green-700">12,450</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Sorted Plastics</h3>
            <p className="text-3xl font-bold text-green-700">8,230</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-red-500">5</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Bottles Collected (Weekly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bottleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bottles" stroke="#16A34A" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Sorting Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryDashboard;
