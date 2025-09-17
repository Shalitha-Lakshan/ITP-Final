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
        const response = await axios.get("http://localhost:5000/api/inventory");
        // Sort by creation date (oldest first, newest last)
        const sortedData = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setInventory(sortedData);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, []);

  // Input change with validation
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Validation logic
    if (name === "name") {
      // Item Name: only letters and spaces allowed
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (name === "weight") {
      // Weight: max 3 digits, no special chars/letters, no negatives, allows decimals
      const weightRegex = /^\d{0,3}(\.\d*)?$/;
      if (value !== "" && (!weightRegex.test(value) || parseFloat(value) < 0)) {
        return; // Don't update if invalid
      }
    } else if (name === "stock") {
      // Stock: no special characters or letters, no negatives
      const stockRegex = /^\d*$/;
      if (value !== "" && (!stockRegex.test(value) || parseInt(value) < 0)) {
        return; // Don't update if invalid
      }
    }
    
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

    if (!name || !color || !type || !weight || !stock || !lastUpdatedDate || !lastUpdatedTime) {
      alert("⚠️ Please fill all required fields");
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
      if (image) {
        formData.append("image", image);
      }

      if (editItemId !== null) {
        const response = await axios.put(
          `http://localhost:5000/api/inventory/${editItemId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setInventory((prev) =>
          prev.map((item) => (item._id === editItemId ? response.data : item))
        );
        setEditItemId(null);
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/inventory/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        // Add new item to the end of the list (newest last)
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
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      alert(`Error saving item: ${error.response?.data?.message || error.message}`);
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
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
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
              <input 
                type="text" 
                name="name" 
                value={newItem.name} 
                onChange={handleInputChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter item name (letters and spaces only)"
              />
              <p className="text-xs text-gray-500 mt-1">Only letters and spaces allowed</p>
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
              <input 
                type="text" 
                name="weight" 
                value={newItem.weight} 
                onChange={handleInputChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter weight (max 3 digits, decimals allowed)"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 3 digits, no negative numbers</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input 
                type="text" 
                name="stock" 
                value={newItem.stock} 
                onChange={handleInputChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter stock quantity (numbers only)"
              />
              <p className="text-xs text-gray-500 mt-1">Numbers only, no negative values</p>
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
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Inventory List</h2>
            <div className="text-sm text-gray-500">
              Total Items: <span className="font-semibold text-gray-900">{inventory.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-center border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Item Code</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Image</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Item Name</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Color</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Processed Form</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Weight (Kg)</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Stock</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Last Updated</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const getColorBadge = (color) => {
                    const colorClasses = {
                      'Clear': 'bg-gray-100 text-gray-800 border border-gray-300',
                      'Green': 'bg-green-100 text-green-800 border border-green-300',
                      'Brown': 'bg-amber-100 text-amber-800 border border-amber-300',
                      'Blue': 'bg-blue-100 text-blue-800 border border-blue-300',
                      'Mixed': 'bg-purple-100 text-purple-800 border border-purple-300'
                    };
                    return colorClasses[color] || 'bg-gray-100 text-gray-800 border border-gray-300';
                  };

                  const getTypeBadge = (type) => {
                    const typeClasses = {
                      'Whole Bottles': 'bg-emerald-100 text-emerald-800',
                      'Crushed': 'bg-orange-100 text-orange-800',
                      'Powder': 'bg-pink-100 text-pink-800',
                      'Pieces': 'bg-cyan-100 text-cyan-800',
                      'Wire': 'bg-indigo-100 text-indigo-800'
                    };
                    return typeClasses[type] || 'bg-gray-100 text-gray-800';
                  };

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="p-3 border border-gray-200 font-mono text-sm font-semibold text-blue-600">
                        {item.itemCode}
                      </td>
                      <td className="p-3 border border-gray-200">
                        {item.imageUrl ? (
                          <div className="flex justify-center">
                            <img
                              src={`http://localhost:5000${item.imageUrl}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200" style={{display: 'none'}}>
                              <CubeIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                              <CubeIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 border border-gray-200 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="p-3 border border-gray-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorBadge(item.color)}`}>
                          {item.color}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200 font-semibold text-gray-900">
                        {item.weight} kg
                      </td>
                      <td className="p-3 border border-gray-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.stock > 100 ? 'bg-green-100 text-green-800' :
                          item.stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200 text-sm text-gray-600">
                        {item.lastUpdated}
                      </td>
                      <td className="p-3 border border-gray-200">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm" 
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm" 
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500 bg-gray-50">
                      <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-lg font-medium">No items added yet</p>
                      <p className="text-sm">Click "Add Item" to get started</p>
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
