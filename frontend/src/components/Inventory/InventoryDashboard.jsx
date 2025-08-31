import React, { useState } from "react";
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
  const [inventory, setInventory] = useState([
    { id: 1, name: "Clear PET Bottles", color: "Clear", type: "Whole Bottles", weight: 1250.5, stock: 50000, lastUpdated: "2024-07-20 16:00" },
    { id: 2, name: "Green HDPE Bottles", color: "Green", type: "Whole Bottles", weight: 890.2, stock: 35000, lastUpdated: "2024-07-20 16:45" },
    { id: 3, name: "Brown Glass Bottles", color: "Brown", type: "Whole Bottles", weight: 1500.7, stock: 28000, lastUpdated: "2024-07-20 17:30" },
    { id: 4, name: "Recycled PET Powder", color: "Mixed", type: "Powder", weight: 600.1, stock: 12000, lastUpdated: "2024-07-21 14:00" },
  ]);

  const [requests, setRequests] = useState([
    { id: 1, team: "Production A", item: "Clear PET Bottles", qty: 5000, status: "Pending" },
    { id: 2, team: "Production B", item: "Recycled PET Powder", qty: 2000, status: "Pending" },
    { id: 3, team: "Production C", item: "Green HDPE Bottles", qty: 3000, status: "Accepted" },
  ]);

  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [minTime, setMinTime] = useState("00:00");

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  const [newItem, setNewItem] = useState({
    name: "",
    color: "",
    type: "",
    weight: "",
    stock: "",
    lastUpdatedDate: "",
    lastUpdatedTime: "",
  });

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
              updatedInventory[invIndex] = { ...updatedInventory[invIndex], stock: updatedInventory[invIndex].stock - req.qty };
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

  const barData = inventory.map((item) => ({ name: item.name, stock: item.stock }));

  const colorData = [
    { name: "Clear", value: inventory.filter((i) => i.color === "Clear").length },
    { name: "Green", value: inventory.filter((i) => i.color === "Green").length },
    { name: "Brown", value: inventory.filter((i) => i.color === "Brown").length },
    { name: "Mixed", value: inventory.filter((i) => i.color === "Mixed").length },
  ];
  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "lastUpdatedDate") {
      setNewItem({ ...newItem, lastUpdatedDate: value });
      if (value === todayDateString) {
        const hours = today.getHours().toString().padStart(2, "0");
        const minutes = today.getMinutes().toString().padStart(2, "0");
        setMinTime(`${hours}:${minutes}`);
      } else {
        setMinTime("00:00");
      }
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const { name, color, type, weight, stock, lastUpdatedDate, lastUpdatedTime } = newItem;
    if (!name || !color || !type || !weight || !stock || !lastUpdatedDate || !lastUpdatedTime) {
      alert("⚠️ Please fill all fields including Date and Time");
      return;
    }

    const selectedDateTime = new Date(`${lastUpdatedDate}T${lastUpdatedTime}`);
    const now = new Date();
    if (selectedDateTime > now) {
      alert("⚠️ Cannot select a future time");
      return;
    }

    const newEntry = {
      ...newItem,
      id: inventory.length + 1,
      weight: parseFloat(weight),
      stock: parseInt(stock),
      lastUpdated: `${lastUpdatedDate} ${lastUpdatedTime}`,
    };
    setInventory([...inventory, newEntry]);
    setNewItem({ name: "", color: "", type: "", weight: "", stock: "", lastUpdatedDate: "", lastUpdatedTime: "" });
    setShowForm(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-green-600 text-white w-64 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">EcoRecycle</h2>
        <nav className="space-y-4">
          <Link to="/inventory" className="flex items-center gap-2 bg-green-700 p-2 rounded-lg transition"><ChartBarIcon className="w-5 h-5" /> Dashboard</Link>
          <Link to="/inventory/forms" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"><CubeIcon className="w-5 h-5" /> Inventory Forms</Link>
          <Link to="/inventory/sorting" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg"><ArrowTrendingUpIcon className="w-5 h-5" /> Sorting</Link>
          <Link to="/inventory/reports" className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"><DocumentChartBarIcon className="w-5 h-5" /> Reports</Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-start mb-6 relative">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-gray-500">Track and manage recyclable materials</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={profilePic || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-10 h-10 rounded-full border cursor-pointer hover:ring-2 hover:ring-green-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  <label htmlFor="upload-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Upload Picture</label>
                  <input type="file" id="upload-profile" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                  <Link to="/inventory/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={() => alert("Logged out")}>Logout</button>
                </div>
              )}
            </div>

            <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">+ Add Item</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-gray-500">Total Collected</p>
            <h2 className="text-2xl font-bold text-green-600">10,500 Bottles</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500">Total Stock (Kg)</p>
            <h2 className="text-2xl font-bold text-green-500">{totalWeight}</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-500">
            <p className="text-gray-500">Pending Requests</p>
            <h2 className="text-2xl font-bold text-orange-500">{requests.filter((r) => r.status === "Pending").length}</h2>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500">Completed Orders</p>
            <h2 className="text-2xl font-bold text-blue-600">{requests.filter((r) => r.status === "Accepted").length}</h2>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6 relative w-full">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input type="text" placeholder="Search by name, color, or processed form..." className="w-full pl-10 p-3 border rounded-lg shadow focus:ring-2 focus:ring-green-500" />
        </div>

        {/* Add Item Form */}
        {showForm && (
          <form onSubmit={handleAddItem} className="mb-6 bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Item Name</label>
              <input type="text" name="name" value={newItem.name} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Color</label>
              <select name="color" value={newItem.color} onChange={handleInputChange} className="w-full border p-2 rounded">
                <option value="">Select Color</option>
                <option value="Clear">Clear</option>
                <option value="Green">Green</option>
                <option value="Brown">Brown</option>
                <option value="Blue">Blue</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Processed Form</label>
              <select name="type" value={newItem.type} onChange={handleInputChange} className="w-full border p-2 rounded">
                <option value="">Select Form</option>
                <option value="Whole Bottles">Whole Bottles</option>
                <option value="Crushed">Crushed</option>
                <option value="Powder">Powder</option>
                <option value="Pieces">Pieces</option>
                <option value="Wire">Wire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Weight (Kg)</label>
              <input type="number" step="0.1" name="weight" value={newItem.weight} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input type="number" name="stock" value={newItem.stock} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Updated Date</label>
              <input type="date" name="lastUpdatedDate" value={newItem.lastUpdatedDate} min={todayDateString} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Updated Time</label>
              <input type="time" name="lastUpdatedTime" value={newItem.lastUpdatedTime} min={minTime} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Save Item</button>
            </div>
          </form>
        )}

        {/* Production Requests */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Production Requests</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{req.team}</p>
                  <p className="text-sm text-gray-500">{req.qty} units of {req.item}</p>
                  <p className={`text-xs ${req.status==="Pending"?"text-orange-500":req.status==="Accepted"?"text-green-600":"text-red-500"}`}>{req.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRequestAction(req.id, "Accepted")} className="p-2 bg-green-500 text-white rounded hover:bg-green-600"><CheckIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleRequestAction(req.id, "Rejected")} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {inventory.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                <div className="flex gap-2 my-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{item.color}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{item.type}</span>
                </div>
                <p className="text-gray-600">Weight: <b>{item.weight} Kg</b></p>
                <p className="text-gray-600">Stock Level: <b>{item.stock}</b></p>
                <p className="text-sm text-gray-400 mt-2">Last updated: {item.lastUpdated}</p>
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
                  <Pie data={colorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {colorData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
