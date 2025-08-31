import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
    { type: "Materials received", detail: "Plastic bottles" },
    { type: "New product added", detail: "Eco Containers" },
    { type: "Stock updated", detail: "Recycled Bags" },
    { type: "Low stock alert", detail: "Bottle Sheets" },
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
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-green-600 text-white flex flex-col">
        <div className="p-6 text-xl font-bold flex items-center space-x-2 border-b border-green-700">
          <Factory className="text-white" />
          <span>Manufacturer</span>
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <LayoutDashboard /> <span>Dashboard</span>
          </button>
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <Boxes /> <span>Products</span>
          </button>
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <Package /> <span>Raw Materials</span>
          </button>
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <Factory /> <span>Production</span>
          </button>
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <FileText /> <span>Reports</span>
          </button>
          <button className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-lg w-full text-left">
            <Settings /> <span>Settings</span>
          </button>
        </nav>
        <div className="p-4 border-t border-green-700">
          <button className="flex items-center space-x-2 p-2 hover:bg-red-600 rounded-lg w-full text-left text-red-600 hover:text-white">
            <LogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manufacturer System</h1>
            <p className="text-gray-500 text-sm">
              Manage materials and products
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1">
              <PackagePlus /> <span>Receive Materials</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            >
              <PackagePlus /> <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6 overflow-y-auto">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white shadow rounded-2xl flex items-center space-x-3 border-l-4 border-blue-500">
              <Package className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <h2 className="text-xl font-bold">{overview.totalProducts}</h2>
              </div>
            </div>
            <div className="p-4 bg-white shadow rounded-2xl flex items-center space-x-3 border-l-4 border-orange-500">
              <AlertTriangle className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <h2 className="text-xl font-bold">{overview.lowStock}</h2>
              </div>
            </div>
            <div className="p-4 bg-white shadow rounded-2xl flex items-center space-x-3 border-l-4 border-green-600">
              <DollarSign className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <h2 className="text-xl font-bold">LKR {overview.totalValue}</h2>
              </div>
            </div>
            <div className="p-4 bg-white shadow rounded-2xl flex items-center space-x-3 border-l-4 border-green-500">
              <TrendingUp className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <h2 className="text-xl font-bold">LKR {overview.avgPrice}</h2>
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
        </main>
      </div>
    </div>
  );
};

export default ProductionDashboard;
