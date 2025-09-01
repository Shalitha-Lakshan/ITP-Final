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
    const { name, color, type, weight, stock, lastUpdated } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const itemCode = await generateItemCode();

    const newItem = new Inventory({
      itemCode,
      name,
      color,
      type,
      weight: parseFloat(weight),
      stock: parseInt(stock),
      lastUpdated: lastUpdated
        ? new Date(lastUpdated).toISOString()
        : new Date().toISOString(),
      imageUrl,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
