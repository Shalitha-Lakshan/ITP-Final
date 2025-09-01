const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, required: true }, // processed form
    weight: { type: Number, required: true },
    stock: { type: Number, required: true },
    lastUpdated: { type: String, required: true },
    imageUrl: { type: String, required: true }, // e.g. /uploads/xxxx.png
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
