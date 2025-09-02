const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, required: true }, // processed form
    weight: { type: Number, required: true },
    stock: { type: Number, required: true },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
    imageUrl: { type: String, default: null }, // Optional image
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
