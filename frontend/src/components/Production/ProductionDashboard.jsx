import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  LayoutDashboard,
  Boxes,
  FileText,
  Factory,
  Settings,
  PackagePlus,
  LogOut,
  Search,
} from "lucide-react";

const ProductionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Production vs Sales data for analytics
  const productionData = [
    { month: "Jan", produced: 1200, sold: 1100 },
    { month: "Feb", produced: 1350, sold: 1250 },
    { month: "Mar", produced: 1400, sold: 1380 },
    { month: "Apr", produced: 1300, sold: 1200 },
    { month: "May", produced: 1500, sold: 1450 },
    { month: "Jun", produced: 1600, sold: 1550 },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState([
    {
      name: "Recycled PET Filament",
      price: 29.99,
      stock: 150,
      category: "Filament",
      imageUrl:
        "https://images.unsplash.com/photo-1616627989828-b522c7f9c799?w=400",
      description:
        "High-quality filament made from 100% recycled PET plastic bottles, ideal for 3D printing.",
      points: 300,
    },
    {
      name: "Eco-Friendly Tote Bag",
      price: 24.99,
      stock: 60,
      category: "Accessories",
      imageUrl:
        "https://images.unsplash.com/photo-1606813909021-1a482d2730f2?w=400",
      description:
        "Durable tote bag made from recycled plastic bottles, perfect for shopping.",
      points: 250,
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    imageUrl: "",
    description: "",
    category: "",
    points: "",
  });

  // Sample data (replace with API calls later)
  const overview = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock < 50).length,
    totalValue: products
      .reduce((sum, p) => sum + p.price * p.stock, 0)
      .toFixed(2),
    avgPrice: (
      products.reduce((sum, p) => sum + p.price, 0) / products.length
    ).toFixed(2),
  };

  const rawMaterials = [
    { name: "Rice (Mixed)", qty: 50, weight: "5kg" },
    { name: "Bottle (Mixed)", qty: 200, weight: "50kg" },
    { name: "Hi (Clear)", qty: 0, weight: "5kg" },
    { name: "Clear PET Bottles", qty: 50000, weight: "1250.5kg" },
    { name: "Green HDPE Bottles", qty: 35000, weight: "890.2kg" },
  ];

  // Filtered products by search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productionSales = [
    { month: "Jan", produced: 120, sold: 100 },
    { month: "Feb", produced: 140, sold: 110 },
    { month: "Mar", produced: 160, sold: 120 },
    { month: "Apr", produced: 180, sold: 150 },
    { month: "May", produced: 130, sold: 115 },
    { month: "Jun", produced: 150, sold: 135 },
  ];

  const revenueData = [
    { product: "Bottles", revenue: 4 },
    { product: "Containers", revenue: 3 },
    { product: "Bags", revenue: 2 },
    { product: "Sheets", revenue: 1 },
    { product: "Other", revenue: 0.5 },
  ];

  const recentActivity = [
    { type: "Production", detail: "100 units of Recycled PET Filament completed" },
    { type: "Quality Check", detail: "Batch #2024-001 passed inspection" },
    { type: "Inventory", detail: "Raw materials restocked - 500kg PET bottles" },
    { type: "Maintenance", detail: "Machine #3 scheduled for maintenance" },
  ];

  const menuItems = [
    { name: "Overview", key: "overview", icon: <LayoutDashboard size={20} /> },
    { name: "Production Planning", key: "planning", icon: <Factory size={20} /> },
    { name: "Raw Materials", key: "materials", icon: <Package size={20} /> },
    { name: "Quality Control", key: "quality", icon: <Settings size={20} /> },
    { name: "Analytics", key: "analytics", icon: <TrendingUp size={20} /> },
    { name: "Reports", key: "reports", icon: <FileText size={20} /> },
  ];

  const productionSchedule = [
    { id: 1, product: "Recycled PET Bottles", quantity: 500, startDate: "2025-09-02", endDate: "2025-09-05", status: "In Progress", priority: "High" },
    { id: 2, product: "Eco-friendly Bags", quantity: 200, startDate: "2025-09-03", endDate: "2025-09-06", status: "Scheduled", priority: "Medium" },
    { id: 3, product: "Recycled Paper", quantity: 1000, startDate: "2025-09-04", endDate: "2025-09-08", status: "Scheduled", priority: "Low" },
  ];

  const qualityMetrics = [
    { metric: "Defect Rate", value: "2.1%", target: "< 3%", status: "Good" },
    { metric: "First Pass Yield", value: "94.5%", target: "> 90%", status: "Excellent" },
    { metric: "Customer Satisfaction", value: "4.7/5", target: "> 4.5", status: "Excellent" },
    { metric: "On-time Delivery", value: "96.2%", target: "> 95%", status: "Good" },
  ];

  const machineStatus = [
    { id: 1, name: "Extruder #1", status: "Running", efficiency: 95, lastMaintenance: "2025-08-15" },
    { id: 2, name: "Molding Machine #2", status: "Maintenance", efficiency: 0, lastMaintenance: "2025-09-01" },
    { id: 3, name: "Shredder #1", status: "Running", efficiency: 88, lastMaintenance: "2025-08-20" },
    { id: 4, name: "Washing Unit #1", status: "Running", efficiency: 92, lastMaintenance: "2025-08-25" },
  ];

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    setProducts([
      ...products,
      {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        imageUrl: newProduct.imageUrl,
        description: newProduct.description,
        category: newProduct.category,
        points: parseInt(newProduct.points) || 0,
      },
    ]);

    // Reset form
    setNewProduct({
      name: "",
      price: "",
      stock: "",
      imageUrl: "",
      description: "",
      category: "",
      points: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Factory className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Production Hub</h2>
              <p className="text-sm text-gray-500">Manufacturing Operations</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/logout"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>


      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
              <p className="text-gray-600 mt-1">Manufacturing operations and inventory management</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PackagePlus size={16} className="mr-2 inline" />
                Add Product
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Render Content Based on Active Tab */}
          {activeTab === "overview" && (
            <>
              {/* Enhanced Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Products</p>
                  <h2 className="text-3xl font-bold">{overview.totalProducts}</h2>
                  <p className="text-emerald-100 text-sm mt-1">Active inventory</p>
                </div>
                <Package size={40} className="text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Value</p>
                  <h2 className="text-3xl font-bold">LKR {overview.totalValue}</h2>
                  <p className="text-blue-100 text-sm mt-1">Inventory worth</p>
                </div>
                <DollarSign size={40} className="text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Production Rate</p>
                  <h2 className="text-3xl font-bold">95%</h2>
                  <p className="text-purple-100 text-sm mt-1">Efficiency</p>
                </div>
                <TrendingUp size={40} className="text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                  <h2 className="text-3xl font-bold">{overview.lowStock}</h2>
                  <p className="text-orange-100 text-sm mt-1">Need attention</p>
                </div>
                <AlertTriangle size={40} className="text-orange-200" />
              </div>
            </div>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white shadow rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">➕ Add New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleChange}
                      pattern="^[A-Za-z\s]+$"
                      title="Only letters and spaces are allowed"
                      required
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Price (LKR)</label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter price in LKR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Stock Level
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter stock level"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Category</option>
                      <option value="Household Items">Household Items</option>
                      <option value="Fashion & Accessories">Fashion & Accessories</option>
                      <option value="Furniture & Home Decor">Furniture & Home Decor</option>
                      <option value="Construction Materials">Construction Materials</option>
                      <option value="Stationery & Office Supplies">Stationery & Office Supplies</option>
                      <option value="Outdoor & Travel">Outdoor & Travel</option>
                      <option value="Toys & Kids Items">Toys & Kids Items</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border rounded-lg p-2"
                    />
                    {newProduct.imageUrl && (
                      <img
                        src={newProduct.imageUrl}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Reward Points</label>
                    <input
                      type="number"
                      name="points"
                      value={newProduct.points}
                      onChange={handleChange}
                      min="0"
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter redeemable points"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                    placeholder="Enter product description"
                  ></textarea>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Section */}
          <div className="bg-white shadow rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Products</h3>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className="border p-4 rounded-xl shadow-sm hover:shadow-md bg-white flex flex-col"
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-lg">{p.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {p.description}
                    </p>
                    <p className="text-sm text-gray-500">Category: {p.category}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <span className="text-green-600 font-bold">LKR {p.price}</span>
                        <p className="text-xs text-gray-500">{p.points} pts</p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            p.stock < 50
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {p.stock < 50 ? "Low Stock" : "High Stock"}
                        </span>
                      </div>
                    </div>
                    
                    {p.points > 0 && (
                      <p className="text-xs text-center text-green-700 mt-2 bg-green-50 py-1 rounded">
                        Or redeem with {p.points} points
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No products found.</p>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Production vs Sales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionSales}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="produced" fill="#3b82f6" /> {/* blue-500 */}
                  <Bar dataKey="sold" fill="#22c55e" /> {/* green-500 */}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Revenue by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                  />{" "}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Raw Materials + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Raw Materials</h3>
              <ul className="space-y-2">
                {rawMaterials.map((m, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between border-b pb-2 text-sm text-gray-600"
                  >
                    <span>{m.name}</span>
                    <span>
                      {m.qty} ({m.weight})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <ul className="space-y-2">
                {recentActivity.map((a, idx) => (
                  <li
                    key={idx}
                    className="text-sm border-b pb-2 text-gray-600"
                  >
                    <span className="font-semibold text-gray-800">
                      {a.type}:{" "}
                    </span>
                    {a.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
            </>
          )}

          {/* Production Planning Tab */}
          {activeTab === "planning" && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Production Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Product</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Quantity</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Start Date</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">End Date</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Priority</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productionSchedule.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{item.product}</td>
                          <td className="py-3 px-2 text-center">{item.quantity}</td>
                          <td className="py-3 px-2 text-center">{item.startDate}</td>
                          <td className="py-3 px-2 text-center">{item.endDate}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.priority === "High" ? "bg-red-100 text-red-800" :
                              item.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Machine Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {machineStatus.map((machine) => (
                    <div key={machine.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{machine.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          machine.status === "Running" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {machine.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Efficiency:</span>
                          <span className="text-sm font-medium">{machine.efficiency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Maintenance:</span>
                          <span className="text-sm">{machine.lastMaintenance}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Raw Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Material Inventory</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>PET Bottles</span>
                      <span className="font-bold">2,500 kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Plastic Containers</span>
                      <span className="font-bold">1,800 kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Paper Waste</span>
                      <span className="font-bold">3,200 kg</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Incoming Materials</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Collection Route A</p>
                      <p className="text-gray-600">Expected: 500kg PET</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Collection Route B</p>
                      <p className="text-gray-600">Expected: 300kg Paper</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Low Stock Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="text-orange-500" size={16} />
                      <span className="text-sm">Glass bottles running low</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="text-red-500" size={16} />
                      <span className="text-sm">Metal cans critical</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quality Control Tab */}
          {activeTab === "quality" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6">Quality Metrics</h3>
                  <div className="space-y-4">
                    {qualityMetrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-sm text-gray-600">Target: {metric.target}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{metric.value}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            metric.status === "Excellent" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6">Recent Quality Checks</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium">Batch #2024-045</p>
                      <p className="text-sm text-gray-600">Passed all quality tests</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className="font-medium">Batch #2024-044</p>
                      <p className="text-sm text-gray-600">Minor defects detected</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium">Batch #2024-043</p>
                      <p className="text-sm text-gray-600">Excellent quality rating</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Production vs Sales</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="produced" fill="#3b82f6" name="Produced" />
                      <Bar dataKey="sold" fill="#22c55e" name="Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Revenue by Product</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Factory size={48} className="mx-auto text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Production Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Monthly production summary</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Settings size={48} className="mx-auto text-green-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Quality Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Quality control analysis</p>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Package size={48} className="mx-auto text-purple-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Inventory Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Stock and materials analysis</p>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
