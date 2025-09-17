const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Inventory = require("../Model/InventoryModel");

// ================= Multer Storage Config =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // save in backend/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ================= Auto-generate Item Code =================
const generateItemCode = async () => {
  const lastItem = await Inventory.findOne().sort({ createdAt: -1 });
  const lastCode = lastItem ? parseInt(lastItem.itemCode.split("-")[1]) : 0;
  const nextCode = (lastCode + 1).toString().padStart(5, "0");
  return `RMI-${nextCode}`;
};

// ================= Routes =================

// 📥 Get all inventory items
router.get("/", async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add new inventory item
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { name, color, type, weight, stock, lastUpdated } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate required fields (image is optional now)
    if (!name || !color || !type || !weight || !stock) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["name", "color", "type", "weight", "stock"],
        received: { name, color, type, weight, stock }
      });
    }

    const itemCode = await generateItemCode();

    const newItem = new Inventory({
      itemCode,
      name: name.trim(),
      color: color.trim(),
      type: type.trim(),
      weight: parseFloat(weight),
      stock: parseInt(stock),
      lastUpdated: lastUpdated || new Date().toISOString(),
      imageUrl,
    });

    console.log("Attempting to save item:", newItem);
    const savedItem = await newItem.save();
    console.log("Item saved successfully:", savedItem);
    
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error adding inventory:", err);
    res.status(500).json({ 
      error: err.message,
      details: err.errors || null
    });
  }
});

// ✏️ Update inventory item
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, type, weight, stock, lastUpdated } = req.body;

    let updatedData = { name, color, type, weight, stock, lastUpdated };
    if (req.file) {
      updatedData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🗑 Delete inventory item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting inventory:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
