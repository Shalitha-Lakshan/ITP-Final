import React, { useState, useEffect } from "react";
import axios from "axios";


import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";



export default function InventoryMaterials() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightByQuery = ["1", "true", "low", "yes"].includes((searchParams.get("highlight") || "").toLowerCase());
  const highlightLowStock = Boolean(location.state?.highlightLowStock) || highlightByQuery;
  const LOW_STOCK_THRESHOLD = 10;
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];
  const [minTime, setMinTime] = useState("00:00");

  const [newItem, setNewItem] = useState({
    name: "",
    color: "",
    type: "",
    stock: "",
    lastUpdatedDate: "",
    lastUpdatedTime: "",
    image: null,
    imagePreview: null,
  });

  // Numeric helpers and constraints for Stock (Kg)
  const MIN_KG = 0.01;
  const MAX_KG = 100000;
  const formatClamp3 = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    const clamped = Math.max(MIN_KG, Math.min(MAX_KG, n));
    return clamped.toFixed(3);
  };
  const handleNumericKeyDown = (e) => {
    // Disallow scientific notation and signs in number input
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
      return;
    }
    const isDecimalPoint = e.key === '.';
    if (isDecimalPoint) {
      const { value } = e.currentTarget;
      // Only one decimal point, not as first character
      if (value.includes('.') || value.length === 0) {
        e.preventDefault();
      }
      return;
    }
    // If current value is exactly '0.0', block another '0' (prevents 0.00) but allow 0.01, 0.02, ...
    if (/^\d$/.test(e.key)) {
      const { value } = e.currentTarget;
      if (value === '0.0' && e.key === '0') {
        e.preventDefault();
        return;
      }
    }
  };

  const sanitizeStockPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (typeof text !== 'string') return;
    // keep only digits and one dot
    let cleaned = text.replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
      // remove subsequent dots
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    // prevent starting with dot
    if (cleaned.startsWith('.')) cleaned = '0' + cleaned;
    // limit to 3 decimals
    if (firstDot !== -1) {
      const [intPart, decPart = ''] = cleaned.split('.');
      cleaned = intPart + '.' + decPart.slice(0, 3);
    }
    // clamp range
    const num = Number(cleaned);
    if (!Number.isNaN(num)) {
      cleaned = formatClamp3(num);
    }
    const target = e.currentTarget;
    setNewItem((prev) => ({ ...prev, stock: cleaned }));
    // place caret at end on next tick
    requestAnimationFrame(() => {
      try { target.setSelectionRange(cleaned.length, cleaned.length); } catch {}
    });
  };

  // Derived: filtered inventory by Processed Form only (prefix match)
  const filteredInventory = inventory.filter((item) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return true;
    return String(item.type || "").toLowerCase().startsWith(needle);
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

  // Auto-scroll to the first low stock row when coming from dashboard
  useEffect(() => {
    if (!highlightLowStock || !Array.isArray(inventory) || inventory.length === 0) return;
    const firstLow = inventory.find((it) => Number(it.stock) < LOW_STOCK_THRESHOLD);
    if (firstLow) {
      const el = document.getElementById(`row-${firstLow._id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightLowStock, inventory]);

  // Input change with validation
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Validation logic
    if (name === "name") {
      // Item Name: only letters (all languages) and spaces allowed
      const nameRegex = /^[\p{L}\s]*$/u;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (name === "stock") {
      // Stock (Kg): allow decimals up to 3 places, no negatives
      const stockRegex = /^\d*(\.\d{0,3})?$/;
      if (value !== "" && !stockRegex.test(value)) {
        return; // Don't update if invalid
      }
      // Prevent entering exactly 0.000 while typing
      if (value === "0.000") {
        return;
      }
      // Prevent typing more than the maximum allowed (100000)
      if (value !== "") {
        const num = parseFloat(value);
        if (!Number.isNaN(num) && num > 100000) {
          return;
        }
      }
    }
    
    if (name === "lastUpdatedDate") {
      setNewItem((prev) => ({ ...prev, lastUpdatedDate: value }));
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
        setNewItem((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      }
    } else {
      setNewItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add or Update
  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();
    const {
      name,
      color,
      type,
      stock,
      lastUpdatedDate,
      lastUpdatedTime,
      image,
    } = newItem;

    if (!name || !color || !type || !stock) {
      alert("⚠️ Please fill all required fields");
      return;
    }

    // Validate stock range and precision
    const stockNum = parseFloat(stock);
    if (isNaN(stockNum)) {
      alert("⚠️ Stock must be a number");
      return;
    }
    if (stockNum < 0.01 || stockNum > 100000) {
      alert("⚠️ Stock must be between 0.01 and 100000 Kg");
      return;
    }
    const decimalPart = (stock.toString().split('.')[1] || '');
    if (decimalPart.length > 3) {
      alert("⚠️ Stock can have at most 3 decimal places");
      return;
    }

    // No last updated validation needed; timestamp will be set automatically on edit

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("color", color);
      formData.append("type", type);
      formData.append("stock", stock);
      if (image) {
        formData.append("image", image);
      }

      if (editItemId !== null) {
        // Automatically set lastUpdated to now for edits
        formData.append("lastUpdated", new Date().toISOString());
        const response = await axios.put(
          `http://localhost:5000/api/inventory/${editItemId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setInventory((prev) =>
          prev.map((item) => (item._id === editItemId ? response.data : item))
        );
        setEditItemId(null);
        alert("✅ Item updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/inventory/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        // Check if this was a stock update for existing item or a new item
        if (response.data.message === "Stock updated for existing item") {
          // Update the existing item in the inventory list by _id
          setInventory((prev) =>
            prev.map((item) => (item._id === response.data._id ? response.data : item))
          );
          alert(`✅ Stock updated! Added ${response.data.stockAdded} Kg to existing "${response.data.name}" (${response.data.color}, ${response.data.type}). New total: ${response.data.stock} Kg`);
        } else {
          // Add new item to the end of the list (newest last)
          setInventory([...inventory, response.data]);
          alert("✅ New item added to inventory successfully!");
        }
      }

      // Reset
      setNewItem({
        name: "",
        color: "",
        type: "",
        stock: "",
        lastUpdatedDate: "",
        lastUpdatedTime: "",
        image: null,
        imagePreview: null,
      });
      setShowForm(false);
      try { window.dispatchEvent(new CustomEvent('inventory:materials-updated')); } catch {}
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
        try { window.dispatchEvent(new CustomEvent('inventory:materials-updated')); } catch {}
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
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Overview</span>
          </Link>
          <Link
            to="/inventory/stock"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </Link>
          <Link
            to="/inventory/requests"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link
            to="/inventory/deliveries"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="font-medium">Delivery Records</span>
          </Link>
          <Link
            to="/inventory/analytics"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link
            to="/inventory/materials"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          >
   
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link
            to="/inventory/reports"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <LogoutButton />
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
            {/* Information Banner */}
            {editItemId === null && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Smart Stock Management</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      If you add an item with the same <strong>Item Name</strong>, <strong>Color</strong>, and <strong>Processed Form</strong> as an existing item, 
                      the stock quantities will be automatically combined instead of creating a duplicate entry.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* --- inputs --- */}
            <div>
              <label className="block text-sm font-medium">Type of Bottle</label>
              <input 
                type="text" 
                name="name" 
                value={newItem.name} 
                onChange={handleInputChange} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter type of bottle (letters and spaces only)"
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
                <option value="Red">Red</option>
                <option value="Yellow">Yellow</option>
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
                <option value="Plastic Bottle Cap/Lid">Plastic Bottle Cap/Lid</option>
                <option value="Plastic Bottle Yarn">Plastic Bottle Yarn</option>
                <option value="Pellets">Pellets</option>
                <option value="Granules">Granules</option>
                <option value="Bales">Bales</option>
                <option value="Regrind">Regrind</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Stock (Kg)</label>
              <input 
                type="number" 
                name="stock" 
                value={newItem.stock} 
                onChange={handleInputChange}
                onKeyDown={handleNumericKeyDown}
                onPaste={sanitizeStockPaste}
                onBlur={(e)=> setNewItem((prev)=> ({ ...prev, stock: formatClamp3(e.target.value) }))}
                onWheel={(e)=> e.currentTarget.blur()}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter stock in Kg (up to 3 decimals)"
                min="0.01"
                max="100000"
                step="0.001"
              />
              <p className="text-xs text-gray-500 mt-1">Allowed range: 0.01–100000 Kg. Up to 3 decimal places.</p>
            </div>

            {/* Last Updated fields removed for both Add and Edit; timestamp handled automatically */}

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
          {highlightLowStock && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
              Low stock items are highlighted in red.
            </div>
          )}
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">Inventory List</h2>
            <div className="text-sm text-gray-500">
              Total Items: <span className="font-semibold text-gray-900">{inventory.length}</span>
            </div>
            <div className="ml-auto w-full max-w-md relative">
              <input
                type="text"
                value={searchTerm}
                onKeyDown={(e) => {
                  const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                  const isLetter = /^[a-zA-Z]$/.test(e.key);
                  const isSpace = e.key === ' ';
                  if (!isLetter && !isSpace && !allowedControl.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  const lettersOnly = /^[\p{L}\s]*$/u; // letters and spaces only
                  if (!lettersOnly.test(v)) return;
                  setSearchTerm(v);
                }}
                placeholder="Search Processed Form..."
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-center border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Item Code</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Image</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Type of Bottle</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Color</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Processed Form</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Stock</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-indigo-50">Last Updated</th>
                  <th className="p-4 border border-gray-200 text-sm font-semibold text-gray-700 bg-blue-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
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
                      'Wire': 'bg-indigo-100 text-indigo-800',
                      'Plastic Bottle Cap/Lid': 'bg-blue-100 text-blue-800',
                      'Plastic Bottle Yarn': 'bg-purple-100 text-purple-800',
                      'Pellets': 'bg-teal-100 text-teal-800',
                      'Granules': 'bg-lime-100 text-lime-800',
                      'Bales': 'bg-amber-100 text-amber-800',
                      'Regrind': 'bg-rose-100 text-rose-800'
                    };
                    return typeClasses[type] || 'bg-gray-100 text-gray-800';
                  };

                  return (
                    <tr
                      key={item._id}
                      id={`row-${item._id}`}
                      className={`${highlightLowStock && Number(item.stock) < LOW_STOCK_THRESHOLD ? 'bg-red-100 ring-2 ring-red-200' : ''} hover:bg-gray-50 transition-colors duration-200`}
                    >
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
                      <td className="p-3 border border-gray-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.stock > 100 ? 'bg-green-100 text-green-800' :
                          item.stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Number(item.stock || 0).toFixed(3)} Kg
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200 text-sm text-gray-600">
                        {(() => {
                          try {
                            const d = new Date(item.lastUpdated);
                            const dateStr = d.toLocaleDateString('en-US', { timeZone: 'Asia/Colombo' });
                            const timeStr = d.toLocaleTimeString('en-LK', {
                              timeZone: 'Asia/Colombo',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            });
                            return `${dateStr} ${timeStr}`;
                          } catch (e) {
                            return item.lastUpdated;
                          }
                        })()}
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
                {inventory.length > 0 && filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 bg-gray-50">
                      <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-lg font-medium">No items match your search</p>
                      <p className="text-sm">Try a different Processed Form (e.g. Whole Bottles, Crushed, Powder, etc.)</p>
                    </td>
                  </tr>
                )}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 bg-gray-50">
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
