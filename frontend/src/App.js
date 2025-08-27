import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import AboutUs from "./pages/AboutUs";
import Register from "./components/register/register";

function App() {
  return (
    <div className="App">
      

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </div>
  );
}

export default App;
