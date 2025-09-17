const Inventory = require("../Model/InventoryModel");

// Generate unique item code RML-001, RML-002
const generateItemCode = async () => {
  const lastItem = await Inventory.findOne().sort({ _id: -1 });
  if (!lastItem) return "RML-001";
  const lastNumber = parseInt(lastItem.itemCode.split("-")[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `RML-${nextNumber}`;
};

// Add inventory item
exports.addInventory = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { name, color, type, weight, stock, lastUpdated } = req.body;
    
    // Validate required fields
    if (!name || !color || !type || !weight || !stock) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: ["name", "color", "type", "weight", "stock"],
        received: { name, color, type, weight, stock }
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
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
    console.error("Error saving inventory item:", err);
    res.status(500).json({ 
      message: err.message,
      error: err.name,
      details: err.errors || null
    });
  }
};

// Get all inventory items
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ _id: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const { name, color, type, weight, stock, lastUpdated } = req.body;

    item.name = name || item.name;
    item.color = color || item.color;
    item.type = type || item.type;
    if (weight) item.weight = parseFloat(weight);
    if (stock) item.stock = parseInt(stock);
    if (lastUpdated) item.lastUpdated = new Date(lastUpdated).toISOString();
    if (req.file) item.imageUrl = `/uploads/${req.file.filename}`;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
