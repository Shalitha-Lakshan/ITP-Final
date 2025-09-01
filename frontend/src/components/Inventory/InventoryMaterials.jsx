import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function InventoryMaterials() {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];
  const [minTime, setMinTime] = useState("00:00");

  const [newItem, setNewItem] = useState({
    name: "",
    color: "",
    type: "",
    weight: "",
    stock: "",
    lastUpdatedDate: "",
    lastUpdatedTime: "",
    image: null,
    imagePreview: null,
  });

  // Fetch inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/inventory");
        setInventory(response.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "lastUpdatedDate") {
      setNewItem({ ...newItem, lastUpdatedDate: value });
      if (value === todayDateString) {
        const hours = today.getHours().toString().padStart(2, "0");
        const minutes = today.getMinutes().toString().padStart(2, "0");
        setMinTime(`${hours}:${minutes}`);
      } else {
        setMinTime("00:00");
      }
    } else if (name === "image") {
      const file = files[0];
      if (file) {
        setNewItem({
          ...newItem,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      }
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  // Add or Update
  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    const {
      name,
      color,
      type,
      weight,
      stock,
      lastUpdatedDate,
      lastUpdatedTime,
      image,
    } = newItem;

    if (!name || !color || !type || !weight || !stock || !lastUpdatedDate || !lastUpdatedTime || !image) {
      alert("⚠️ Please fill all fields including Date, Time, and Image");
      return;
    }

    const selectedDateTime = new Date(`${lastUpdatedDate}T${lastUpdatedTime}`);
    if (selectedDateTime > new Date()) {
      alert("⚠️ Cannot select a future time");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("color", color);
      formData.append("type", type);
      formData.append("weight", weight);
      formData.append("stock", stock);
      formData.append("lastUpdated", `${lastUpdatedDate} ${lastUpdatedTime}`);
      formData.append("image", image);

      if (editItemId !== null) {
        const response = await axios.put(
          `http://localhost:5000/inventory/${editItemId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setInventory((prev) =>
          prev.map((item) => (item._id === editItemId ? response.data : item))
        );
        setEditItemId(null);
      } else {
        const response = await axios.post(
          "http://localhost:5000/inventory/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setInventory([...inventory, response.data]);
      }

      // Reset
      setNewItem({
        name: "",
        color: "",
        type: "",
        weight: "",
        stock: "",
        lastUpdatedDate: "",
        lastUpdatedTime: "",
        image: null,
        imagePreview: null,
      });
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error saving item to database");
    }
  };

  // Edit
  const handleEdit = (item) => {
    setNewItem({
      name: item.name,
      color: item.color,
      type: item.type,
      weight: item.weight,
      stock: item.stock,
      lastUpdatedDate: item.lastUpdated.split(" ")[0],
      lastUpdatedTime: item.lastUpdated.split(" ")[1],
      image: null,
      imagePreview: item.imageUrl ? `http://localhost:5000/${item.imageUrl}` : null,
    });
    setEditItemId(item._id);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/inventory/${id}`);
        setInventory((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
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
              <p className="text-sm text-gray-500">Raw Materials</p>
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
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
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
              <h1 className="text-3xl font-bold text-gray-900">Raw Materials Management</h1>
              <p className="text-gray-600 mt-1">Add, edit, and manage inventory materials</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {editItemId !== null ? "Edit Item" : "+ Add Item"}
            </button>
          </div>
        </header>

        <div className="p-6">

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleAddOrUpdateItem}
            className="mb-6 bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* --- inputs --- */}
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
              <input type="date" name="lastUpdatedDate" value={newItem.lastUpdatedDate} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Updated Time</label>
              <input type="time" name="lastUpdatedTime" value={newItem.lastUpdatedTime} min={minTime} onChange={handleInputChange} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Item Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleInputChange} className="w-full border p-2 rounded" />
              {newItem.imagePreview && (
                <img src={newItem.imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                {editItemId !== null ? "Update Item" : "Save Item"}
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Inventory List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Item Code</th>
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Item Name</th>
                  <th className="p-2 border">Color</th>
                  <th className="p-2 border">Processed Form</th>
                  <th className="p-2 border">Weight (Kg)</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Last Updated</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item._id}>
                    <td className="p-2 border">{item.itemCode}</td>
                    <td className="p-2 border">
                      {item.imageUrl ? (
                        <img
                          src={`http://localhost:5000/${item.imageUrl}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover mx-auto rounded"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.color}</td>
                    <td className="p-2 border">{item.type}</td>
                    <td className="p-2 border">{item.weight}</td>
                    <td className="p-2 border">{item.stock}</td>
                    <td className="p-2 border">{item.lastUpdated}</td>
                    <td className="p-2 border flex justify-center gap-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-4 text-gray-500">
                      No items added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
