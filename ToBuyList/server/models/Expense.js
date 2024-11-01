const mongoose = require("mongoose");

// Define the Expense schema
const expenseSchema = new mongoose.Schema({
	itemName: { type: String, required: true },
	category: { type: String, required: true },
	amount: { type: Number, required: true }, // Expense amount
	purchaseDate: { type: Date, required: true }, // Date of purchase
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the user
});

// Export the Expense model
module.exports = mongoose.model("Expense", expenseSchema);
