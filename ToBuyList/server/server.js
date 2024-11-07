// Initial console log to check if the script starts executing
console.log("Hooo");

// Import required modules
require("dotenv").config();

const mongoose = require("mongoose"); // Mongoose to connect to MongoDB
const bcrypt = require("bcrypt"); // Bcrypt for password hashing
const jwt = require("jsonwebtoken");
const express = require("express"); // Express for server setup
const User = require("./models/User"); // User model for database interaction
const ToBuyItem = require("./models/ToBuyList");
const ToBuyList = require("./models/ToBuyList");

// Import the Expense model at the top if not done yet
const Expense = require("./models/Expense");

const cors = require("cors"); // Import CORS middleware

// MongoDB connection string - replace <password> with the actual password
const dbURI = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
mongoose
	.connect(dbURI)
	.then(() => console.log("Connected to MongoDB successfully"))
	.catch((error) => console.error("Failed to connect to MongoDB", error));

// Initialize Express app
const app = express();
app.use(cors()); // Allows requests from any origin
// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

console.log("Server is living"); // Confirm server setup

// oooooooooooooooooooooooooooooooooooooooooooooooooooooo
// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
	// Extract the token from the "Authorization" header
	const token = req.header("Authorization")?.split(" ")[1]; // Expects "Bearer <token>"

	// If there's no token, respond with an unauthorized error
	if (!token) {
		return res
			.status(401)
			.json({ message: "Access Denied: No token provided" });
	}

	try {
		// Verify the token using the secret key
		const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
		req.user = verified; // Store user info from token in the request object
		next(); // Continue to the next middleware or route
	} catch (error) {
		// If the token is invalid, respond with a forbidden error
		res.status(403).json({ message: "Invalid token" });
	}
};
// oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo

// Route: User Registration
app.post("/register", async (req, res) => {
	console.log("Request received"); // Log to confirm the route is hit
	console.log(req.body); // Log request body for debugging

	try {
		// Destructure user details from the request body
		const { username, email, password } = req.body;

		// Check if the username or email already exists in the database
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "Username or email is already in use" });
		}

		// Hash the user's password for secure storage
		const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for added security

		// Create and save the new user with hashed password
		const newUser = new User({ username, email, password: hashedPassword });
		await newUser.save();

		// Respond with success message
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		// Error handling if registration fails
		res.status(500).json({ message: "Registration failed", error });
	}
});

// This is the new step
// const jwt = require("jsonwebtoken"); // Import JWT for token handling

// Login Route
app.post("/login", async (req, res) => {
	try {
		// Extract email and password from the request body
		const { email, password } = req.body;

		// Find the user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Verify the password using bcrypt
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ message: "Invalid password" });
		}

		// Generate a JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
			expiresIn: "1h",
		});

		// Respond with the token
		res.status(200).json({ message: "Login successful", token });
	} catch (error) {
		res.status(500).json({ message: "Login failed", error });
	}
});

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Route to get the user's to-buy list
app.get("/tobuylist", authenticateToken, async (req, res) => {
	try {
		const userItems = await ToBuyItem.find({ userId: req.user.userId });
		res.status(200).json(userItems);
	} catch (error) {
		console.log(error); // Log error for debugging
		res.status(500).json({ message: "Failed to fetch to-buy list", error });
	}
});

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Route to add an item to the user's to-buy list
// Route to add an item to the user's to-buy list in MongoDB
app.post("/tobuylist", authenticateToken, async (req, res) => {
	try {
		// Extract item details from request body and userId from the authenticated user
		const { itemName, category } = req.body;
		const newItem = new ToBuyItem({
			itemName,
			category,
			userId: req.user.userId, // Associate item with the current user
		});

		// Save the new item to MongoDB
		await newItem.save();

		res
			.status(201)
			.json({ message: "Item added to to-buy list", item: newItem });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to add item to to-buy list", error });
	}
});

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// DELETE route to remove an item from ToBuyList
app.delete("/tobuylist/:itemId", authenticateToken, async (req, res) => {
	try {
		const { itemId } = req.params;
		console.log("Attempting to delete item with ID:", itemId); // Debugging log

		const deletedItem = await ToBuyList.findByIdAndDelete(itemId);

		if (!deletedItem) {
			console.log("Item not found"); // Debugging log
			return res.status(404).json({ message: "Item not found in to-buy list" });
		}

		console.log("Item successfully deleted:", deletedItem); // Debugging log
		res
			.status(200)
			.json({ message: "Item removed from to-buy list", item: deletedItem });
	} catch (error) {
		console.error("Error in DELETE route:", error); // Detailed error log
		res.status(500).json({ message: "Failed to remove item", error });
	}
});

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Route to get distinct month-year values from the expenses
app.get("/expenses/months", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userId; // Make sure we're filtering for the authenticated user only

		// Use aggregation to get unique month-year values
		const months = await Expense.aggregate([
			{ $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Ensure user ID is an ObjectId
			{
				$group: {
					_id: { $dateToString: { format: "%m-%Y", date: "$purchaseDate" } },
				},
			},
			{ $sort: { _id: -1 } }, // Sort month-year in descending order
		]);

		// Extract the month-year strings into an array
		const monthYearList = months.map((month) => month._id);
		res.status(200).json(monthYearList);
	} catch (error) {
		console.error("Error fetching months:", error); // Log error for debugging
		res.status(500).json({ message: "Failed to fetch months", error });
	}
});

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Route to add a new expense
app.post("/expenses", authenticateToken, async (req, res) => {
	try {
		const { itemName, category, amount, purchaseDate } = req.body;

		// Create a new expense entry with user association
		const newExpense = new Expense({
			itemName,
			category,
			amount,
			purchaseDate: purchaseDate || new Date(),
			userId: req.user.userId, // Link the expense to the authenticated user
		});

		// Save the expense to MongoDB
		await newExpense.save();

		res
			.status(201)
			.json({ message: "Expense added successfully", expense: newExpense });
	} catch (error) {
		res.status(500).json({ message: "Failed to add expense", error });
	}
});

//ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// Route to get expenses for a specific month and year
app.get("/expenses/:monthYear", authenticateToken, async (req, res) => {
	try {
		const { monthYear } = req.params; // monthYear format should be MM-YYYY
		const [month, year] = monthYear.split("-"); // Split MM-YYYY into separate values

		// Construct the date range for the specified month
		const startDate = new Date(year, month - 1, 1); // First day of the month
		const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

		// Find expenses within this date range for the authenticated user
		const userExpenses = await Expense.find({
			userId: req.user.userId,
			purchaseDate: { $gte: startDate, $lte: endDate },
		});

		res.status(200).json(userExpenses);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch expenses", error });
	}
});
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
app.get(
	"/expenses/category-totals/:monthYear",
	authenticateToken,
	async (req, res) => {
		try {
			const { monthYear } = req.params;
			const [month, year] = monthYear.split("-");
			const startDate = new Date(year, month - 1, 1);
			const endDate = new Date(year, month, 0, 23, 59, 59);

			const categoryTotals = await Expense.aggregate([
				{
					$match: {
						userId: new mongoose.Types.ObjectId(req.user.userId),
						purchaseDate: { $gte: startDate, $lte: endDate },
					},
				},
				{
					$group: {
						_id: "$category",
						totalAmount: { $sum: "$amount" },
					},
				},
			]);

			res.status(200).json(categoryTotals);
		} catch (error) {
			console.error("Error fetching category totals:", error);
			res
				.status(500)
				.json({ message: "Failed to fetch category totals", error });
		}
	}
);

//ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
// Route: Basic Test Endpoint to check server status
app.get("/", (req, res) => {
	res.send("Server is up and crying!"); // Responds to basic GET request
});

// Set the port for the server, defaulting to 3000 if no other port is specified
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
