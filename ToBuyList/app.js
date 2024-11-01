// Function to handle login
document
	.getElementById("loginForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent form refresh

		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		try {
			// Send login credentials to the backend
			const response = await fetch("http://localhost:3000/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				throw new Error("Invalid login credentials");
			}

			const data = await response.json();
			localStorage.setItem("token", data.token); // Store the JWT token

			// Toggle visibility to show app content and hide login
			document.getElementById("login-section").style.display = "none";
			document.getElementById("app-content").style.display = "block";

			// Fetch and display the to-buy list and expense list immediately after login
			await displayToBuyList();
			const currentMonthYear = getCurrentMonthYear(); // Get the current month-year
			await displayExpensesForMonth(currentMonthYear);
			await displayCategoryTotalsForMonth(currentMonthYear);
			await populateMonthDropdown(); // Populate the month dropdown after login

			console.log("Login successful, data fetched and displayed.");
		} catch (error) {
			document.getElementById("loginError").style.display = "block";
			console.error("Error during login:", error);
		}
	});

// Toggle functions for registration and login views
const showLogin = () => {
	document.getElementById("registerSection").style.display = "none";
	document.getElementById("login-section").style.display = "block";
};

const showRegister = () => {
	document.getElementById("login-section").style.display = "none";
	document.getElementById("registerSection").style.display = "block";
};

// Function to handle logout
const handleLogout = () => {
	// Clear the token from localStorage
	localStorage.removeItem("token");

	// Hide the main app content
	document.getElementById("app-content").style.display = "none";

	// Redirect to login view
	showLogin();
	alert("You have been logged out.");
};

// Function to handle registration
const handleRegistration = async (event) => {
	event.preventDefault(); // Prevent form from refreshing the page

	// Get values from the form
	const username = document.getElementById("registerUsername").value;
	const email = document.getElementById("registerEmail").value;
	const password = document.getElementById("registerPassword").value;

	try {
		// Send a POST request to the /register endpoint
		const response = await fetch("http://localhost:3000/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, email, password }),
		});

		const data = await response.json();

		if (response.ok) {
			alert(data.message); // Registration success message
			showLogin(); // Switch to login section
		} else {
			alert(data.message); // Display error message
		}
	} catch (error) {
		console.error("Error during registration:", error);
		alert("Registration failed. Please try again.");
	}
};

// Attach event listener for the registration form submission
document
	.getElementById("registerForm")
	.addEventListener("submit", handleRegistration);

// Check token on load to determine initial visibility
window.onload = function () {
	const token = localStorage.getItem("token");
	if (token) {
		// If logged in, show app content and hide login form
		document.getElementById("login-section").style.display = "none";
		document.getElementById("app-content").style.display = "block";
	} else {
		// If not logged in, show login form only
		document.getElementById("login-section").style.display = "block";
		document.getElementById("app-content").style.display = "none";
	}
};

// Retrieve the to-buy list from localStorage (if available), otherwise initialize an empty array
// This line attempts to load any existing to-buy list from localStorage, which allows the list to persist even after a page refresh.
// If no such list exists in localStorage, an empty array is initialized to store the new to-buy items.
// Event listener for form submission to add items directly to the backend
// NEW CODE: Add a to-buy list item to the backend
const addToBuyItem = async (itemName, category) => {
	console.log("Adding item:", itemName, category); // Log to check if function is triggered
	try {
		const response = await fetch("http://localhost:3000/tobuylist", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ itemName, category }),
		});
		if (!response.ok) throw new Error("Failed to add item to the to-buy list");

		const newItem = await response.json();
		console.log("Item added:", newItem); // Log the response from backend
		return newItem;
	} catch (error) {
		console.error("Error adding item to to-buy list:", error);
	}
};

document
	.getElementById("toBuyForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the form from refreshing the page

		// Get values from the form inputs
		const itemName = document.getElementById("buyItemName").value;
		const category = document.getElementById("buyCategory").value;

		// Validate that the item name and category are not empty
		if (!itemName || !category) {
			alert("Please enter an item name and select a category.");
			return;
		}

		// Add the item to the backend and refresh the displayed list
		await addToBuyItem(itemName, category);
		displayToBuyList(); // Refresh the list to include the newly added item

		// Clear the form after submission
		document.getElementById("toBuyForm").reset();
	});

// let toBuyList = JSON.parse(localStorage.getItem("toBuyList")) || [];
let toBuyList = []; // Initialize as an empty array to store fetched items

// NEW CODE: Fetch the to-buy list from the backend server
const fetchToBuyList = async () => {
	try {
		const response = await fetch("http://localhost:3000/tobuylist", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`, // Uses the token stored in localStorage
			},
		});
		if (!response.ok) throw new Error("Failed to fetch to-buy list");

		const items = await response.json();
		return items;
	} catch (error) {
		console.error("Error fetching to-buy list:", error);
		return [];
	}
};

// Array to store expenses (will load expenses for the current month later)
// This is initialized as an empty array. It will be used to store expenses for the current month.
// When a new expense is added, the array will be updated, and the data will be saved to localStorage.
let expenses = [];

// Event listener for form submission (Step 1)
// This event listener is triggered when the user submits the form to add an item to the to-buy list.
// It retrieves the form input values (item name and category), validates them, and then creates a new item object to store in the to-buy list.
// The list is updated both in memory and in localStorage, and the displayed list on the page is refreshed.
// UPDATED CODE: Event listener for form submission to add items directly to the backend
// Event listener for form submission to add items directly to the backend
// document
// 	.getElementById("toBuyForm")
// 	.addEventListener("submit", async function (event) {
// 		event.preventDefault(); // Prevent the form from refreshing the page

// 		// Get values from the form inputs
// 		const itemName = document.getElementById("buyItemName").value;
// 		const category = document.getElementById("buyCategory").value;

// 		// Validate that the item name and category are not empty
// 		if (!itemName || !category) {
// 			alert("Please enter an item name and select a category.");
// 			return;
// 		}

// 		// Add the item to the backend and refresh the displayed list
// 		await addToBuyItem(itemName, category);
// 		displayToBuyList(); // Refresh the list to include the newly added item

// 		// Clear the form after submission
// 		document.getElementById("toBuyForm").reset();
// 	});

// Function to display the to-buy list on the page (Step 1)
// This function is responsible for rendering the list of to-buy items on the page.
// It clears any previously displayed items and iterates over the toBuyList array, creating a div for each item.
// Each div contains the item’s name, category, an input for entering the price when bought, and a "Bought" button to mark it as purchased.
// function displayToBuyList() {
// 	const toBuyListDiv = document.getElementById("toBuyList");
// 	toBuyListDiv.innerHTML = ""; // Clear the previous items before displaying

// 	toBuyList.forEach(function (item) {
// 		// Create a div for each item
// 		const itemDiv = document.createElement("div");
// 		itemDiv.classList.add("to-buy-item"); // Add class for styling

// 		// Add the item name, category, input field for price, and Bought button
// 		itemDiv.innerHTML = `
//             <div class="itemName">${item.name}-</div>
//             <div>${item.category}</div>
//             <input type="number" id="priceInput-${item.id}" placeholder="Enter price" class="price-input">
//             <button onclick="moveToExpenses(${item.id})">Bought</button>
//         `;

// 		// Append the item to the to-buy list section
// 		toBuyListDiv.appendChild(itemDiv);
// 	});
// }
// NEW CODE: Updated function to display to-buy list items fetched from backend
async function displayToBuyList() {
	toBuyList = await fetchToBuyList(); // Fetch the list from backend instead of localStorage
	console.log("Items to display:", toBuyList); // Log the items for debugging

	const toBuyListDiv = document.getElementById("toBuyList"); // Moved inside the function
	toBuyListDiv.innerHTML = ""; // Clear previous items before displaying new ones

	toBuyList.forEach(function (item) {
		// Create a div for each item
		const itemDiv = document.createElement("div");
		itemDiv.classList.add("to-buy-item");

		// Add item details
		itemDiv.innerHTML = `
            <div class="itemName">${item.itemName}-</div>
            <div>${item.category}</div>
            <input type="number" id="priceInput-${item._id}" placeholder="Enter price" class="price-input">
            <button onclick="moveToExpenses('${item._id}')">Bought</button>
        `;

		// Append the item to the to-buy list section
		toBuyListDiv.appendChild(itemDiv);
	});
}

// Function to move an item from the to-buy list to the expense list (Step 2)
// This function is called when the user clicks the "Bought" button for an item in the to-buy list.
// It retrieves the price entered by the user, checks if it is valid, and moves the item to the expenses list for the current month.
// The expenses array is updated, saved in localStorage, and both the to-buy and expense lists are refreshed.
async function moveToExpenses(itemId) {
	// Find the item in the to-buy list by its ID
	const item = toBuyList.find((i) => i._id === itemId); // Use MongoDB's _id field
	if (!item) return;

	// Get the price input field value from the to-buy item
	const priceInput = document.getElementById(`priceInput-${itemId}`);
	const price = parseFloat(priceInput.value);

	// Validate that a valid price is entered
	if (isNaN(price) || price <= 0) {
		alert("Please enter a valid price.");
		return;
	}

	try {
		// 1. Add the item to the Expense List (POST request to backend)
		const response = await fetch("http://localhost:3000/expenses", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				itemName: item.itemName,
				category: item.category,
				amount: price,
				purchaseDate: new Date().toISOString(), // Use current date for purchase
			}),
		});

		// Check if the POST request was successful
		if (!response.ok) {
			throw new Error("Failed to add item to expenses.");
		}

		// 2. Remove the item from the To-Buy List (DELETE request to backend)
		const deleteResponse = await fetch(
			`http://localhost:3000/tobuylist/${itemId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);

		// Check if the DELETE request was successful
		if (!deleteResponse.ok) {
			throw new Error("Failed to remove item from to-buy list.");
		}

		// 3. Update the frontend display
		toBuyList = toBuyList.filter((i) => i._id !== itemId); // Filter out deleted item
		const currentMonthYear = getCurrentMonthYear();
		displayToBuyList();
		displayExpensesForMonth(currentMonthYear); // Update expenses display for the current month
		displayCategoryTotalsForMonth(currentMonthYear);
	} catch (error) {
		console.error("Error transferring item:", error);
		alert("An error occurred while transferring the item.");
	}
}

// Function to get the current month and year in a "YYYY-MM" format (Step 3)
// This function generates a string representing the current month and year, which is used to categorize expenses by month.
// It retrieves the current date from the system clock, extracts the year and month, and formats it as "YYYY-MM" (e.g., "2024-10").
function getCurrentMonthYear() {
	const date = new Date();
	const year = date.getFullYear(); // Get current year
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Get current month (months are 0-indexed)
	return `${month}-${year}`; // Formats as "MM-YYYY"
}

// Function to save the to-buy list to localStorage (Step 2)
// This function stores the current state of the to-buy list in localStorage.
// It converts the toBuyList array into a JSON string and saves it under the key "toBuyList" so that the list persists between page loads.
function saveToBuyList() {
	localStorage.setItem("toBuyList", JSON.stringify(toBuyList));
}

// Function to save expenses to localStorage based on the current month and year (Step 4)
// This function saves the current expenses array to localStorage, using the current month and year as part of the key.
// It ensures that expenses are categorized by month, and only expenses for the current month are saved under the specific key for that month.
function saveExpenses() {
	const currentMonthYear = getCurrentMonthYear(); // Get the current month and year
	localStorage.setItem(
		`expenses_${currentMonthYear}`,
		JSON.stringify(expenses)
	);
}

// Function to load expenses for a specific month and year from localStorage (Step 4)
// This function retrieves expenses from localStorage based on the provided month and year.
// It looks for a key in localStorage that matches the pattern "expenses_YYYY-MM" and returns the parsed array of expenses for that month.
// If no expenses are found for the specified month, an empty array is returned.
function loadExpensesForMonth(monthYear) {
	const storedExpenses = localStorage.getItem(`expenses_${monthYear}`);
	return storedExpenses ? JSON.parse(storedExpenses) : [];
}
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
// Function to fetch expenses for a specific month and year
const fetchExpensesForMonth = async (monthYear) => {
	console.log("Calling fetchExpensesForMonth with monthYear:", monthYear); // Start of function

	try {
		const response = await fetch(
			`http://localhost:3000/expenses/${monthYear}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`, // Retrieves token from localStorage
				},
			}
		);

		if (!response.ok) throw new Error("Failed to fetch expenses");

		const expenses = await response.json();
		console.log(
			"Fetched expenses from backend in fetchExpensesForMonth:",
			expenses
		); // Log fetched expenses
		return expenses;
	} catch (error) {
		console.error("Error fetching expenses in fetchExpensesForMonth:", error);
		return [];
	}
};

//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

// Load and display the to-buy list from localStorage on page load
// This function is called when the page first loads. It displays the to-buy list by calling displayToBuyList().
// It also displays expenses for the current month by calling displayExpenses(), ensuring the user sees the correct data on page load.
// window.onload = function () {
// 	displayToBuyList();
// 	displayExpenses();
// };

// Function to display the expense list on the page for the selected month and year
// This function retrieves expenses for the current month (or a selected month in later steps) and displays them on the page.
// It loops through the list of expenses for that month, creates div elements for each expense, and adds them to the expense list section of the page.
// Function to display expenses for a selected month-year

//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
async function displayExpensesForMonth(monthYear) {
	console.log("Starting displayExpensesForMonth with monthYear:", monthYear);

	const expensesForMonth = await fetchExpensesForMonth(monthYear);
	console.log(
		"Expenses received in displayExpensesForMonth:",
		expensesForMonth
	); // Verify return value

	const expenseListDiv = document.getElementById("expenseList");
	if (!expenseListDiv) {
		console.error("Expense list div not found");
		return;
	}
	expenseListDiv.innerHTML = ""; // Clear any previous list

	if (expensesForMonth.length === 0) {
		console.log("No expenses found for display.");
		return;
	}

	expensesForMonth.forEach(function (expense) {
		const expenseDiv = document.createElement("div");
		expenseDiv.classList.add("expenses-item");

		expenseDiv.innerHTML = `
            <div>${expense.itemName}</div>
            <div>${expense.category}</div>
            <div>$${expense.amount.toFixed(2)}</div>
            <div>${new Date(expense.purchaseDate).toLocaleDateString()}</div>
        `;

		expenseListDiv.appendChild(expenseDiv);
	});

	console.log("Expenses displayed successfully.");
}

//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

// Function to populate the month-year dropdown with available months from localStorage (Step 5)
// This function generates the options for a dropdown menu that allows the user to select a month and view the corresponding expenses.
// It loops through localStorage to find all keys starting with "expenses_" and extracts the month and year from those keys.
// The current month is automatically selected by default, but if no data exists for the current month, the first available month is selected.
// NEW CODE: Fetch months from backend and populate the dropdown
const populateMonthDropdown = async () => {
	console.log("Month Drop Down Function is called");
	try {
		const response = await fetch("http://localhost:3000/expenses/months", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});

		if (!response.ok) throw new Error("Failed to fetch months");

		const monthYearList = await response.json(); // Array of month-year strings

		const monthDropdown = document.getElementById("monthDropdown");
		monthDropdown.innerHTML = ""; // Clear any existing options

		// Populate the dropdown with months from the backend
		monthYearList.forEach((monthYear) => {
			const option = document.createElement("option");
			option.value = monthYear;
			option.textContent = monthYear;
			monthDropdown.appendChild(option);
		});

		// Automatically select the current month if available
		const currentMonthYear = getCurrentMonthYear();
		if (monthDropdown.querySelector(`option[value="${currentMonthYear}"]`)) {
			monthDropdown.value = currentMonthYear;
		} else if (monthDropdown.options.length > 0) {
			// If the current month isn't in the list, select the first available month-year
			monthDropdown.value = monthDropdown.options[0].value;
		}
	} catch (error) {
		console.error("Error fetching months:", error);
	}
};

// function populateMonthDropdown() {
// 	const monthDropdown = document.getElementById("monthDropdown");
// 	monthDropdown.innerHTML = ""; // Clear any existing options

// 	// Add an option for each month-year key found in localStorage
// 	for (let i = 0; i < localStorage.length; i++) {
// 		const key = localStorage.key(i);
// 		if (key.startsWith("expenses_")) {
// 			const monthYear = key.split("_")[1]; // Extract the month-year part of the key
// 			const option = document.createElement("option");
// 			option.value = monthYear;
// 			option.textContent = monthYear;
// 			monthDropdown.appendChild(option);
// 		}
// 	}

// 	// Automatically select the current month and year by default
// 	const currentMonthYear = getCurrentMonthYear();
// 	if (monthDropdown.querySelector(`option[value="${currentMonthYear}"]`)) {
// 		monthDropdown.value = currentMonthYear;
// 	} else if (monthDropdown.options.length > 0) {
// 		// If the current month isn't in the list, select the first available month-year
// 		monthDropdown.value = monthDropdown.options[0].value;
// 	}
// }

// Event listener for month dropdown selection
// This event listener detects when the user selects a new month-year from the dropdown menu.
// It retrieves and displays the expenses for the selected month by calling displayExpensesForMonth().
// Event listener for month dropdown selection
document
	.getElementById("monthDropdown")
	.addEventListener("change", function () {
		const selectedMonthYear = this.value;
		displayExpensesForMonth(selectedMonthYear); // Display expenses for the selected month-year
		displayCategoryTotalsForMonth(selectedMonthYear); // Display category totals for the selected month-year
	});

// Function to display expenses for the selected month-year (Step 5)
// This function is similar to the earlier displayExpenses function but works for a specific month-year chosen by the user.
// It retrieves the expenses for the selected month from localStorage and displays them on the page.
// function displayExpensesForMonth(monthYear) {
// 	const expensesForMonth = loadExpensesForMonth(monthYear); // Retrieve expenses for the selected month and year

// 	const expenseListDiv = document.getElementById("expenseList");
// 	expenseListDiv.innerHTML = ""; // Clear the previous list before displaying

// 	expensesForMonth.forEach(function (expense) {
// 		// Create a div for each expense
// 		const expenseDiv = document.createElement("div");
// 		expenseDiv.classList.add("expenses-item"); // Add class for styling

// 		// Add the expense details (name, category, price, and date)
// 		expenseDiv.innerHTML = `
//             <div>${expense.name}</div>
//             <div>${expense.category}</div>
//             <div>$${expense.amount.toFixed(2)}</div>
//             <div>${expense.date}</div>
//         `;

// 		// Append the expense item to the expense list
// 		expenseListDiv.appendChild(expenseDiv);
// 	});
// }

// Load and display the to-buy list and expenses for the current month on page load
// This is an extended onload function that not only displays the to-buy list but also populates the month dropdown.
// It ensures that expenses for the current month are shown by default.
// window.onload = function () {
// 	const token = localStorage.getItem("token");
// 	console.log("Token value:", token);

// 	if (token) {
// 		document.getElementById("login-section").style.display = "none";
// 		document.getElementById("app-content").style.display = "block";

// 		displayToBuyList();
// 		console.log("Page loaded, calling displayExpensesForMonth...");
// 		const currentMonthYear = getCurrentMonthYear();
// 		console.log("Current month-year for expenses:", currentMonthYear);
// 		displayExpensesForMonth(currentMonthYear);
// 		displayCategoryTotalsForMonth(currentMonthYear);

// 		console.log("Calling populateMonthDropdown"); // Add this
// 		try {
// 			populateMonthDropdown();
// 		} catch (error) {
// 			console.error("Error calling populateMonthDropdown:", error);
// 		}
// 	} else {
// 		document.getElementById("login-section").style.display = "block";
// 		document.getElementById("app-content").style.display = "none";
// 	}
// };

// Last Section
// This is made to be somewhat separate from the other code. This function is called in certain places, but, it is not very important to the functionality and is a display effect only.

// Function to calculate and display category totals
async function displayCategoryTotalsForMonth(monthYear) {
	try {
		const response = await fetch(
			`http://localhost:3000/expenses/category-totals/${monthYear}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch category totals");
		}

		const categoryTotals = await response.json();
		const totalsSection = document.getElementById("totals-section");
		totalsSection.innerHTML = ""; // Clear previous totals before displaying new ones

		let totalExpenses = 0;
		categoryTotals.forEach((total) => {
			totalExpenses += total.totalAmount;
		});

		categoryTotals.forEach((total) => {
			let percentage =
				totalExpenses > 0 ? (total.totalAmount / totalExpenses) * 100 : 0;
			const totalDiv = document.createElement("div");
			totalDiv.classList.add("category-total");
			totalDiv.innerHTML = `
                <p>
                    <span class="category-name">${total._id}</span> 
                    <span class="category-total-amount">$${total.totalAmount.toFixed(
											2
										)}</span> 
                    <span class="category-percentage">${percentage.toFixed(
											2
										)}%</span>
                </p>
            `;
			totalsSection.appendChild(totalDiv);
		});
	} catch (error) {
		console.error("Error fetching category totals:", error);
	}
}
