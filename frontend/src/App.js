import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import AboutUs from "./pages/AboutUs";
import Register from "./components/register/register";
import Login from "./pages/Login";
import InventoryDashboard from "./pages/InventoryDashboard";
import FAQ from "./pages/FAQ";
import InventoryProfile from "./pages/InventoryProfile";
import InventoryForms from "./pages/InventoryForms";
import InventorySorting from "./pages/InventorySorting";




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
        

      </Routes>
    </div>
  );
}

export default App;
