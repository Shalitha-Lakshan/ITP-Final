import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductsPage from "./pages/ProductsPage";
import AboutUs from "./pages/AboutUs";
import Register from "./components/register/register";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import InventoryDashboard from "./components/Inventory/InventoryDashboard";
import InventoryProfile from "./components/Inventory/InventoryProfile";
import InventoryForms from "./components/Inventory/InventoryForms";
import InventorySorting from "./components/Inventory/InventorySorting";
import ReportPage from "./components/Inventory/ReportPage";
import ProductionDashboard from "./components/Production/ProductionDashboard";
import UnifiedFinanceDashboard from "./components/finance/UnifiedFinanceDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import SalesDashboard from "./components/sales/SalesDashboard";
import TransportDashboard from "./components/transport/TransportDashboard";
import InventoryMaterials from "./components/Inventory/InventoryMaterials";
import FAQ from "./components/business/FAQ";
import Contact from "./components/business/Contact";
import HelpCenter from "./components/business/HelpCenter";






function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Protected Routes - General User */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes - Admin Only */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes - Manager/Admin */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute requiredRole="inventory">
                <InventoryDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/profile" 
            element={
              <ProtectedRoute>
                <InventoryProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/forms" 
            element={
              <ProtectedRoute>
                <InventoryForms />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/sorting" 
            element={
              <ProtectedRoute>
                <InventorySorting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/reports" 
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory/materials" 
            element={
              <ProtectedRoute>
                <InventoryMaterials />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/production" 
            element={
              <ProtectedRoute requiredRole="production">
                <ProductionDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute requiredRole="finance">
                <UnifiedFinanceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <ProtectedRoute requiredRole="sales">
                <SalesDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transport" 
            element={
              <ProtectedRoute requiredRole="transport">
                <TransportDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy Routes - Redirect to new dashboard */}
          <Route 
            path="/user-dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager-dashboard" 
            element={
              <ProtectedRoute requiredRole="manager">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
