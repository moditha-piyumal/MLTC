// Retrieve the to-buy list from localStorage (if available), otherwise initialize an empty array
// This line attempts to load any existing to-buy list from localStorage, which allows the list to persist even after a page refresh.
// If no such list exists in localStorage, an empty array is initialized to store the new to-buy items.
let toBuyList = JSON.parse(localStorage.getItem("toBuyList")) || [];

// Array to store expenses (will load expenses for the current month later)
// This is initialized as an empty array. It will be used to store expenses for the current month.
// When a new expense is added, the array will be updated, and the data will be saved to localStorage.
let expenses = [];

// Event listener for form submission (Step 1)
// This event listener is triggered when the user submits the form to add an item to the to-buy list.
// It retrieves the form input values (item name and category), validates them, and then creates a new item object to store in the to-buy list.
// The list is updated both in memory and in localStorage, and the displayed list on the page is refreshed.
document
	.getElementById("toBuyForm")
	.addEventListener("submit", function (event) {
		event.preventDefault(); // Prevent the form from refreshing the page

		// Get values from the form inputs
		const itemName = document.getElementById("buyItemName").value;
		const category = document.getElementById("buyCategory").value;

		// Validate that the item name and category are not empty
		if (!itemName || !category) {
			alert("Please enter an item name and select a category.");
			return;
		}

		// Create a new item object
		const newItem = {
			id: toBuyList.length + 1, // Generate a unique ID for each item
			name: itemName,
			category: category,
			price: null, // Price will be added later when item is bought
		};

		// Add the item to the toBuyList array (latest item at the beginning)
		toBuyList.unshift(newItem);

		// Clear the form after submission
		document.getElementById("toBuyForm").reset();

		// Save the updated to-buy list to localStorage
		saveToBuyList();

		// Update the display of the to-buy list
		displayToBuyList();
	});

// Function to display the to-buy list on the page (Step 1)
// This function is responsible for rendering the list of to-buy items on the page.
// It clears any previously displayed items and iterates over the toBuyList array, creating a div for each item.
// Each div contains the item’s name, category, an input for entering the price when bought, and a "Bought" button to mark it as purchased.
function displayToBuyList() {
	const toBuyListDiv = document.getElementById("toBuyList");
	toBuyListDiv.innerHTML = ""; // Clear the previous items before displaying

	toBuyList.forEach(function (item) {
		// Create a div for each item
		const itemDiv = document.createElement("div");
		itemDiv.classList.add("to-buy-item"); // Add class for styling

		// Add the item name, category, input field for price, and Bought button
		itemDiv.innerHTML = `
            <div>${item.name}</div>
            <div>${item.category}</div>
            <input type="number" id="priceInput-${item.id}" placeholder="Enter price" class="price-input">
            <button onclick="moveToExpenses(${item.id})">Bought</button>
        `;

		// Append the item to the to-buy list section
		toBuyListDiv.appendChild(itemDiv);
	});
}

// Function to move an item from the to-buy list to the expense list (Step 2)
// This function is called when the user clicks the "Bought" button for an item in the to-buy list.
// It retrieves the price entered by the user, checks if it is valid, and moves the item to the expenses list for the current month.
// The expenses array is updated, saved in localStorage, and both the to-buy and expense lists are refreshed.
function moveToExpenses(itemId) {
	// Find the item in the to-buy list by its ID
	const item = toBuyList.find((i) => i.id === itemId);
	if (!item) return;

	// Get the price input field value from the to-buy item
	const priceInput = document.getElementById(`priceInput-${itemId}`);
	const price = parseFloat(priceInput.value);

	// Validate that a valid price is entered
	if (isNaN(price) || price <= 0) {
		alert("Please enter a valid price.");
		return;
	}

	// First, retrieve the existing expenses for the current month-year from localStorage
	const currentMonthYear = getCurrentMonthYear();
	expenses = loadExpensesForMonth(currentMonthYear); // Retrieve existing expenses for the current month

	// Move the item to the expenses list
	const expense = {
		id: expenses.length + 1, // Generate a new ID for the expense
		name: item.name,
		category: item.category,
		amount: price, // Use the entered price
		date: new Date().toLocaleString(), // Add the current date
		monthYear: currentMonthYear, // Add the current month and year (Step 3)
	};

	expenses.push(expense); // Add the item to the expenses array

	// Remove the item from the to-buy list
	toBuyList = toBuyList.filter((i) => i.id !== itemId);

	// Save the updated to-buy list to localStorage
	saveToBuyList();

	// Save the expenses (both new and previous) to localStorage
	saveExpenses();

	// Update the display for both lists
	displayToBuyList();
	displayExpensesForMonth(currentMonthYear); // Show updated expenses for the current month

	displayCategoryTotalsForMonth(currentMonthYear);
}

// Function to get the current month and year in a "YYYY-MM" format (Step 3)
// This function generates a string representing the current month and year, which is used to categorize expenses by month.
// It retrieves the current date from the system clock, extracts the year and month, and formats it as "YYYY-MM" (e.g., "2024-10").
function getCurrentMonthYear() {
	const date = new Date();
	const year = date.getFullYear(); // Get current year
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Get current month (months are 0-indexed)
	return `${year}-${month}`; // Format as "YYYY-MM"
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

// Load and display the to-buy list from localStorage on page load
// This function is called when the page first loads. It displays the to-buy list by calling displayToBuyList().
// It also displays expenses for the current month by calling displayExpenses(), ensuring the user sees the correct data on page load.
window.onload = function () {
	displayToBuyList();
	displayExpenses();
};

// Function to display the expense list on the page for the selected month and year
// This function retrieves expenses for the current month (or a selected month in later steps) and displays them on the page.
// It loops through the list of expenses for that month, creates div elements for each expense, and adds them to the expense list section of the page.
function displayExpenses() {
	const currentMonthYear = getCurrentMonthYear(); // Get the current month and year
	const expensesForMonth = loadExpensesForMonth(currentMonthYear); // Retrieve expenses for the current month and year

	const expenseListDiv = document.getElementById("expenseList");
	expenseListDiv.innerHTML = ""; // Clear the previous list before displaying

	expensesForMonth.forEach(function (expense) {
		// Create a div for each expense
		const expenseDiv = document.createElement("div");
		expenseDiv.classList.add("expenses-item"); // Add class for styling

		// Add the expense details (name, category, price, and date)
		expenseDiv.innerHTML = `
            <div>${expense.name}</div>
            <div>${expense.category}</div>
            <div>$${expense.amount.toFixed(2)}</div>
            <div>${expense.date}</div>
        `;

		// Append the expense item to the expense list
		expenseListDiv.appendChild(expenseDiv);
	});
}

// Function to populate the month-year dropdown with available months from localStorage (Step 5)
// This function generates the options for a dropdown menu that allows the user to select a month and view the corresponding expenses.
// It loops through localStorage to find all keys starting with "expenses_" and extracts the month and year from those keys.
// The current month is automatically selected by default, but if no data exists for the current month, the first available month is selected.
function populateMonthDropdown() {
	const monthDropdown = document.getElementById("monthDropdown");
	monthDropdown.innerHTML = ""; // Clear any existing options

	// Add an option for each month-year key found in localStorage
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith("expenses_")) {
			const monthYear = key.split("_")[1]; // Extract the month-year part of the key
			const option = document.createElement("option");
			option.value = monthYear;
			option.textContent = monthYear;
			monthDropdown.appendChild(option);
		}
	}

	// Automatically select the current month and year by default
	const currentMonthYear = getCurrentMonthYear();
	if (monthDropdown.querySelector(`option[value="${currentMonthYear}"]`)) {
		monthDropdown.value = currentMonthYear;
	} else if (monthDropdown.options.length > 0) {
		// If the current month isn't in the list, select the first available month-year
		monthDropdown.value = monthDropdown.options[0].value;
	}
}

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
function displayExpensesForMonth(monthYear) {
	const expensesForMonth = loadExpensesForMonth(monthYear); // Retrieve expenses for the selected month and year

	const expenseListDiv = document.getElementById("expenseList");
	expenseListDiv.innerHTML = ""; // Clear the previous list before displaying

	expensesForMonth.forEach(function (expense) {
		// Create a div for each expense
		const expenseDiv = document.createElement("div");
		expenseDiv.classList.add("expenses-item"); // Add class for styling

		// Add the expense details (name, category, price, and date)
		expenseDiv.innerHTML = `
            <div>${expense.name}</div>
            <div>${expense.category}</div>
            <div>$${expense.amount.toFixed(2)}</div>
            <div>${expense.date}</div>
        `;

		// Append the expense item to the expense list
		expenseListDiv.appendChild(expenseDiv);
	});
}

// Load and display the to-buy list and expenses for the current month on page load
// This is an extended onload function that not only displays the to-buy list but also populates the month dropdown.
// It ensures that expenses for the current month are shown by default.
window.onload = function () {
	displayToBuyList();
	populateMonthDropdown(); // Populate the month dropdown when the page loads
	const currentMonthYear = getCurrentMonthYear(); // Get the current month-year
	displayExpensesForMonth(currentMonthYear); // Display expenses for the current month
	displayCategoryTotalsForMonth(currentMonthYear); // Display category totals for the current month
};

// Last Section

// Function to calculate and display category totals
function displayCategoryTotalsForMonth(monthYear) {
	// Load the expenses for the selected month-year
	const expensesForMonth = loadExpensesForMonth(monthYear);

	// Object to store totals for each category
	const categoryTotals = {
		EssentialFood: 0,
		LuxuryFood: 0,
		Transportation: 0,
		Healthcare: 0,
		Utilities: 0,
		Clothes: 0,
		Others: 0,
	};

	// Variable to store the total expenses for the selected month
	let totalExpenses = 0;

	// Calculate totals for each category and the overall total
	expensesForMonth.forEach((expense) => {
		categoryTotals[expense.category] += expense.amount;
		totalExpenses += expense.amount;
	});

	// Display the category totals in the totals-section
	const totalsSection = document.getElementById("totals-section");
	totalsSection.innerHTML = ""; // Clear previous totals before displaying new ones

	// Loop through each category to display the total and percentage
	for (const category in categoryTotals) {
		let categoryTotal = categoryTotals[category];
		let percentage =
			totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

		// Create a div to display the category total and percentage
		const totalDiv = document.createElement("div");
		totalDiv.classList.add("category-total"); // Add a class for styling if needed
		totalDiv.innerHTML = `
            <p>${category}: $${categoryTotal.toFixed(2)} (${percentage.toFixed(
			2
		)}%)</p>
        `;

		// Append the totalDiv to the totals-section
		totalsSection.appendChild(totalDiv);
	}
}
