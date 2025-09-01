import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import AboutUs from "./pages/AboutUs";
import Register from "./components/register/register";
import Login from "./pages/Login";
import InventoryDashboard from "./components/Inventory/InventoryDashboard";
import InventoryProfile from "./components/Inventory/InventoryProfile";
import InventoryForms from "./components/Inventory/InventoryForms";
import InventorySorting from "./components/Inventory/InventorySorting";
import ReportPage from "./components/Inventory/ReportPage";
import ProductionDashboard from "./components/Production/ProductionDashboard";
import UnifiedFinanceDashboard from "./components/finance/UnifiedFinanceDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";
import SalesDashboard from "./components/sales/SalesDashboard";
import TransportDashboard from "./components/transport/TransportDashboard";
import InventoryMaterials from "./components/Inventory/InventoryMaterials";
import FAQ from "./components/business/FAQ";
import Contact from "./components/business/Contact";
import HelpCenter from "./components/business/HelpCenter";






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
        <Route path="/inventory/profile" element={<InventoryProfile />} />
        <Route path="/inventory/forms" element={<InventoryForms />} />
        <Route path="/inventory/sorting" element={<InventorySorting />} />
        <Route path="/inventory/reports" element={<ReportPage />} />
        <Route path="/inventory/materials" element={<InventoryMaterials />} />
        <Route path="/production" element={<ProductionDashboard />} />
        <Route path="/finance" element={<UnifiedFinanceDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/sales" element={<SalesDashboard />} />
        <Route path="/transport" element={<TransportDashboard />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />

        

      </Routes>
    </div>
  );
}

export default App;
