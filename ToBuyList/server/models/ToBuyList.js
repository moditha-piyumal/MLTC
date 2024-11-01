// models/ToBuyList.js
const mongoose = require("mongoose");

// Define the structure (schema) of each to-buy list item
const toBuyItemSchema = new mongoose.Schema({
	itemName: { type: String, required: true },
	category: { type: String, required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the user who owns the item
});

// Create a model based on the schema
module.exports = mongoose.model("ToBuyItem", toBuyItemSchema);
