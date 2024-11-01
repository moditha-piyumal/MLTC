// Import Mongoose to define the schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// Export the model to use it in other parts of the app
module.exports = mongoose.model("User", userSchema);
