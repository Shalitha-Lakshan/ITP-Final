import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, LayoutDashboard, Boxes, Package, Factory, FileText, Settings, LogOut } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Recycled PET Filament",
      price: 29.99,
      stock: 150,
      category: "Filament",
      points: 300,
    },
    {
      id: 2,
      name: "Eco-Friendly Tote Bag",
      price: 24.99,
      stock: 60,
      category: "Accessories",
      points: 250,
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (id) => {
    alert(`Edit product with ID: ${id}`);
    // TODO: Add modal or edit page
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
                  to="/raw-materials"
                  className="flex items-center space-x-2 p-2 rounded-lg w-full hover:bg-green-700"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-4 py-2">Category</th>
                <th className="border border-gray-200 px-4 py-2">Price (LKR)</th>
                <th className="border border-gray-200 px-4 py-2">Stock</th>
                <th className="border border-gray-200 px-4 py-2">Points</th>
                <th className="border border-gray-200 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{p.name}</td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {p.category}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      LKR {p.price}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {p.stock}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {p.points}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <Pencil size={16} /> <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <Trash2 size={16} /> <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 border border-gray-200"
                  >
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
