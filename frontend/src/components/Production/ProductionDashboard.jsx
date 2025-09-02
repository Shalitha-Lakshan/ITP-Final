import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import {
  LayoutDashboard,
  Factory,
  Package,
  Settings,
  TrendingUp,
  FileText,
  Search,
  Plus,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ShoppingCart,
  LogOut,
  PackagePlus,
  DollarSign,
} from "lucide-react";
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
  LineChart,
  Line,
  Legend,
} from "recharts";

const ProductionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [acceptedMaterials, setAcceptedMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestForm, setRequestForm] = useState({
    team: '',
    requestedQty: '',
    notes: '',
    priority: 'Medium'
  });

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
  const [products, setProducts] = useState([]);

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

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create production request
  const createProductionRequest = async () => {
    try {
      // First check if backend server is running
      try {
        await axios.get('http://localhost:5000/api/health');
      } catch (healthError) {
        alert('Backend server is not running. Please start the backend server first.');
        return;
      }

      const requestData = {
        team: requestForm.team,
        inventoryItemId: selectedItem._id,
        requestedQty: parseInt(requestForm.requestedQty),
        notes: requestForm.notes,
        priority: requestForm.priority
      };

      console.log('Sending request data:', requestData);
      console.log('Selected item:', selectedItem);
      
      const response = await axios.post('http://localhost:5000/api/production-requests', requestData);
      console.log('Request response:', response.data);
      
      // Reset form and close modal
      setRequestForm({ team: '', requestedQty: '', notes: '', priority: 'Medium' });
      setShowRequestModal(false);
      setSelectedItem(null);
      
      alert('Production request created successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request data that failed:', {
        team: requestForm.team,
        inventoryItemId: selectedItem?._id,
        requestedQty: requestForm.requestedQty,
        notes: requestForm.notes,
        priority: requestForm.priority
      });
      
      let errorMessage = 'Failed to create production request. ';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to backend server. Please ensure the backend server is running on port 5000.';
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data?.message || 'Invalid request data.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Inventory item not found.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check the console for more details and try again.';
      }
      
      alert(errorMessage);
    }
  };

  // Handle request form changes
  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  // Open request modal
  const openRequestModal = (item) => {
    setSelectedItem(item);
    setShowRequestModal(true);
  };

  // Fetch accepted materials
  const fetchAcceptedMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/production-requests/status/Approved');
      setAcceptedMaterials(response.data);
    } catch (error) {
      console.error('Error fetching accepted materials:', error);
    }
  };

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Don't show alert for fetch errors, just log them
    }
  };

  // Load data when component mounts and when tabs change
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchProducts();
    } else if (activeTab === 'materials') {
      fetchInventoryData();
      fetchAcceptedMaterials();
    }
  }, [activeTab]);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation logic
    if (name === 'name') {
      // Product Name: only letters and spaces, no numbers or special characters
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (name === 'price') {
      // Price: max 4 digits, no special characters or letters
      const priceRegex = /^\d{0,4}(\.\d{0,2})?$/;
      if (value !== '' && !priceRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (name === 'stock' || name === 'points') {
      // Stock Level and Reward Points: no negative numbers
      if (value < 0) {
        return; // Don't update if negative
      }
    }
    
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

  // Add product to database
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Please fill in all required fields: Product Name, Price, and Category');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        imageUrl: newProduct.imageUrl,
        description: newProduct.description,
        category: newProduct.category,
        points: parseInt(newProduct.points) || 0,
      };

      const response = await axios.post('http://localhost:5000/api/products', productData);
      
      if (response.status === 201) {
        // Add to local state for immediate display
        setProducts([...products, response.data.product]);
        
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
        
        alert('Product created successfully!');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      let errorMessage = 'Failed to create product. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to backend server. Please ensure the backend server is running.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    }
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
          <LogoutButton />
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
                      title="Only letters and spaces are allowed - no numbers or special characters"
                      required
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name (letters and spaces only)"
                    />
                    {newProduct.name && !/^[A-Za-z\s]*$/.test(newProduct.name) && (
                      <p className="text-red-500 text-xs mt-1">Product name can only contain letters and spaces</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Price (LKR)</label>
                    <input
                      type="text"
                      name="price"
                      value={newProduct.price}
                      onChange={handleChange}
                      pattern="^\d{1,4}(\.\d{1,2})?$"
                      title="Maximum 4 digits, numbers only (e.g., 1234 or 1234.56)"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter price (max 4 digits, e.g., 1234.56)"
                    />
                    {newProduct.price && !/^\d{0,4}(\.\d{0,2})?$/.test(newProduct.price) && (
                      <p className="text-red-500 text-xs mt-1">Price must be maximum 4 digits with optional decimal (e.g., 1234.56)</p>
                    )}
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
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter stock level (positive numbers only)"
                    />
                    {newProduct.stock < 0 && (
                      <p className="text-red-500 text-xs mt-1">Stock level cannot be negative</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reward points (positive numbers only)"
                    />
                    {newProduct.points < 0 && (
                      <p className="text-red-500 text-xs mt-1">Reward points cannot be negative</p>
                    )}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Raw Materials Inventory</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      fetchInventoryData();
                      fetchAcceptedMaterials();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Package size={18} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Inventory Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventoryItems.map((item) => (
                      <div key={item._id} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.stock < 100 ? 'bg-red-100 text-red-800' :
                            item.stock < 500 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.stock < 100 ? 'Low Stock' :
                             item.stock < 500 ? 'Medium Stock' : 'High Stock'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Color:</span>
                            <span className="font-medium">{item.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weight:</span>
                            <span className="font-medium">{item.weight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-bold text-lg">{item.stock} units</span>
                          </div>
                        </div>

                        <button
                          onClick={() => openRequestModal(item)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                          <ShoppingCart size={16} />
                          <span>Request Material</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {inventoryItems.length === 0 && (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No inventory items found</p>
                    </div>
                  )}

                  {/* Accepted Materials Section */}
                  {acceptedMaterials.length > 0 && (
                    <div className="bg-white shadow-lg rounded-2xl p-6 mt-6">
                      <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={24} />
                        Approved Materials Ready for Production
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {acceptedMaterials.map((material) => (
                          <div key={material._id} className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{material.inventoryItemId?.name || 'Unknown Item'}</h4>
                                <p className="text-sm text-gray-600">Request ID: {material.requestId}</p>
                              </div>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Approved
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Team:</span>
                                <span className="font-medium">{material.team}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{material.requestedQty} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Priority:</span>
                                <span className={`font-medium ${
                                  material.priority === 'High' ? 'text-red-600' :
                                  material.priority === 'Medium' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {material.priority}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approved:</span>
                                <span className="font-medium text-green-600">
                                  {new Date(material.approvedDate).toLocaleDateString()} at{' '}
                                  {new Date(material.approvedDate).toLocaleTimeString()}
                                </span>
                              </div>
                              {material.approvedBy && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Approved by:</span>
                                  <span className="font-medium">{material.approvedBy}</span>
                                </div>
                              )}
                              {material.notes && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                  <p className="text-xs text-gray-600"><strong>Notes:</strong> {material.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Production Request Modal */}
          {showRequestModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold mb-4">Request Material: {selectedItem.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team/Department</label>
                    <input
                      type="text"
                      name="team"
                      value={requestForm.team}
                      onChange={handleRequestFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Production Team A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested Quantity (Available: {selectedItem.stock})
                    </label>
                    <input
                      type="number"
                      name="requestedQty"
                      value={requestForm.requestedQty}
                      onChange={handleRequestFormChange}
                      max={selectedItem.stock}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={requestForm.priority}
                      onChange={handleRequestFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={requestForm.notes}
                      onChange={handleRequestFormChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes or requirements..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={createProductionRequest}
                    disabled={!requestForm.team || !requestForm.requestedQty}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedItem(null);
                      setRequestForm({ team: '', requestedQty: '', notes: '', priority: 'Medium' });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
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
