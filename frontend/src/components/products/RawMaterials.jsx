// RowMaterials.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  LayoutDashboard,
  Boxes,
  Package,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

export default function RowMaterials() {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    team: "Production A",
    item: "",
    qty: "",
  });

  // Load inventory and requests from localStorage
  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem("inventory")) || [];
    setInventory(savedInventory);

    const savedRequests = JSON.parse(localStorage.getItem("requests")) || [];
    setRequests(savedRequests);
  }, []);

  // Save requests to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("requests", JSON.stringify(requests));
  }, [requests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item || !formData.qty) {
      alert("⚠️ Please select an item and enter quantity");
      return;
    }

    const newRequest = {
      id: Date.now(),
      team: formData.team,
      item: formData.item,
      qty: parseInt(formData.qty),
      status: "Pending",
    };

    setRequests([...requests, newRequest]);
    setFormData({ team: "Production A", item: "", qty: "" });
    alert("✅ Request submitted!");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-600 text-white flex flex-col">
        <div className="p-6 text-xl font-bold flex items-center space-x-2 border-b border-green-700">
          <Factory className="text-white" />
          <span>Manufacturer</span>
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <Link
            to="/production/dashboard"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
          >
            <LayoutDashboard /> <span>Dashboard</span>
          </Link>

          <Link
            to="/production/product"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
          >
            <Boxes /> <span>Products</span>
          </Link>

          <Link
            to="/inventory/materials"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700 bg-green-700"
          >
            <Package /> <span>Raw Materials</span>
          </Link>

          <Link
            to="/production"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
          >
            <Factory /> <span>Production</span>
          </Link>

          <Link
            to="/production/reports"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
          >
            <FileText /> <span>Reports</span>
          </Link>

          <Link
            to="/production/settings"
            className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
          >
            <Settings /> <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-green-700">
          <Link
            to="/logout"
            className="flex items-center space-x-2 p-2 hover:bg-red-600 rounded-lg w-full text-left text-red-600 hover:text-white"
          >
            <LogOut /> <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Request Raw Materials</h1>

        {/* Request Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-8 max-w-lg"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium">Team Name</label>
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Select Item</label>
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Choose Material --</option>
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.name}>
                  {inv.name} ({inv.stock} units)
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              min="1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Submit Request
          </button>
        </form>

        {/* Request History */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Your Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{req.item}</p>
                    <p className="text-sm text-gray-500">
                      {req.qty} units | {req.team}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
