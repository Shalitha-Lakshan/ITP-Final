import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

export default function InventoryForms() {
  const [formData, setFormData] = useState({
    transporterName: "",
    vehicleNo: "",
    bottleType: "",
    quantity: "",
  });

  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // Track editing row

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity" && !/^\d{0,3}$/.test(value)) return;

    if (name === "vehicleNo") {
      // Allow only capital letters, digits, and dash while typing
      if (!/^[A-Z0-9-]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { transporterName, vehicleNo, bottleType, quantity } = formData;

    // Validate required fields
    if (!transporterName || !vehicleNo || !bottleType || !quantity) {
      alert("⚠️ Please fill all fields");
      return;
    }

    // Vehicle number validation: 3 capital letters - 4 digits (e.g., ABC-1234)
    const vehicleRegex = /^[A-Z]{3}-\d{4}$/;
    if (!vehicleRegex.test(vehicleNo)) {
      alert("⚠️ Vehicle Number must be in format: ABC-1234");
      return;
    }

    const timestamp = new Date().toLocaleString();

    if (editIndex !== null) {
      const updatedRecords = [...records];
      updatedRecords[editIndex] = { ...formData, timestamp };
      setRecords(updatedRecords);
      setEditIndex(null);
      alert("✅ Record updated successfully!");
    } else {
      setRecords([...records, { ...formData, timestamp }]);
      alert("✅ Bottles received successfully!");
    }

    setFormData({ transporterName: "", vehicleNo: "", bottleType: "", quantity: "" });
  };

  const handleEdit = (index) => {
    setFormData(records[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const updatedRecords = records.filter((_, i) => i !== index);
      setRecords(updatedRecords);
      if (editIndex === index) setEditIndex(null);
    }
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
              <p className="text-sm text-gray-500">Forms & Data Entry</p>
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
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Forms</h1>
              <p className="text-gray-600 mt-1">Receive bottles from transporters</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">Bottle Receipt Form</h2>

            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Transporter Name</label>
                <input
                  type="text"
                  name="transporterName"
                  value={formData.transporterName}
                  onChange={handleChange}
                  placeholder="Enter transporter name"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={formData.vehicleNo}
                  onChange={handleChange}
                  placeholder="Format: ABC-1234"
                  maxLength="8"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Bottle Type</label>
              <select
                name="bottleType"
                value={formData.bottleType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select bottle type</option>
                <option value="PET">PET (Polyethylene Terephthalate)</option>
                <option value="HDPE">HDPE (High-Density Polyethylene)</option>
                <option value="PVC">PVC (Polyvinyl Chloride)</option>
                <option value="LDPE">LDPE (Low-Density Polyethylene)</option>
                <option value="PP">PP (Polypropylene)</option>
                <option value="PS">PS (Polystyrene)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Quantity (Bottles)</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity (max 999)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                {editIndex !== null ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </form>

          {/* Records Table */}
          {records.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">Received Bottles Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-green-700 text-white">
                    <tr>
                      <th className="p-3 border">Bottle Type</th>
                      <th className="p-3 border">Quantity</th>
                      <th className="p-3 border">Timestamp</th>
                      <th className="p-3 border">Transporter Name</th>
                      <th className="p-3 border">Vehicle Number</th>
                      <th className="p-3 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="p-3 border">{rec.bottleType}</td>
                        <td className="p-3 border">{rec.quantity}</td>
                        <td className="p-3 border">{rec.timestamp}</td>
                        <td className="p-3 border">{rec.transporterName}</td>
                        <td className="p-3 border">{rec.vehicleNo}</td>
                        <td className="p-3 border space-x-2">
                          <button
                            onClick={() => handleEdit(index)}
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
