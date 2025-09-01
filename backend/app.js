import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🟢 Static file serving (Images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --- routes ---
import inventoryRoutes from "./Routes/InventoryRoutes.js";
app.use("/inventory", inventoryRoutes);

// Connect DB & Start Server
mongoose
  .connect("mongodb+srv://admin:PQiukNPIiWtkL4eU@cluster0.hm0ymbf.mongodb.net/")
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  })
  .catch((err) => console.error(err));
