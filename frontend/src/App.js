import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import AboutUs from "./pages/AboutUs";
import Register from "./components/register/register";
import Login from "./pages/Login";
import InventoryDashboard from "./components/Inventory/InventoryDashboard";
import FAQ from "./pages/FAQ";
import InventoryProfile from "./components/Inventory/InventoryProfile";
import InventoryForms from "./components/Inventory/InventoryForms";
import InventorySorting from "./components/Inventory/InventorySorting";
import ReportPage from "./components/Inventory/ReportPage";
import ProductionDashboard from "./components/Production/ProductionDashboard";
import Products from "./components/products/Products";
import RawMaterials from "./components/products/RawMaterials";



function App() {
  return (
    <div className="App">
      

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/inventory/profile" element={<InventoryProfile />} />
        <Route path="/inventory/forms" element={<InventoryForms />} />
        <Route path="/inventory/sorting" element={<InventorySorting />} />
        <Route path="/inventory/reports" element={<ReportPage />} />
        <Route path="/production/dashboard" element={<ProductionDashboard />} />
        <Route path="/production/product" element={<Products />} />
        <Route path="/raw-materials" element={<RawMaterials/>} />

      </Routes>
    </div>
  );
}

export default App;
