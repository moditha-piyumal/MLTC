// Select elements from the DOM

// Select elements from the DOM
const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const categoryTotalsDiv = document.getElementById("categoryTotals");

// Array to store expenses (we'll load from localStorage if available)
let expenses = [];

// Object to store category totals
let categoryTotals = {
	EssentialFood: 0,
	LuxuryFood: 0,
	Transportation: 0,
	Healthcare: 0,
	Utilities: 0,
	Clothes: 0,
	Others: 0,
};

// Load expenses for the current month when the page loads
loadExpenses();

// Populate the dropdown with months that have stored data
populateMonthDropdown();

// Event listener for form submission
form.addEventListener("submit", function (event) {
	event.preventDefault(); // Prevent page refresh

	// Get values from form inputs
	const amount = parseFloat(document.getElementById("amount").value); // Convert to a number
	const description = document.getElementById("description").value;
	const category = document.getElementById("category").value;

	// Ensure the amount is a valid number before proceeding
	if (isNaN(amount) || amount <= 0) {
		alert("Please enter a valid amount.");
		return;
	}

	// Create an expense object
	const expense = {
		amount: amount,
		description: description,
		category: category,
		date: new Date().toLocaleString(), // Add a timestamp
	};

	// Add the expense to the array
	expenses.unshift(expense); // Add the latest expense at the top

	// Update category totals
	categoryTotals[category] += amount; // Add the expense amount to the right category

	// Save to localStorage
	saveExpenses();

	// Update the display
	displayExpenses();
	displayCategoryTotals();

	// Reset the form
	form.reset();
});

// Function to display expenses

function displayExpenses() {
	expenseList.innerHTML = ""; // Clear the list before updating

	// Create the grid headings
	const headerRow = document.createElement("div");
	headerRow.classList.add("expense-header"); // Add class for styling

	headerRow.innerHTML = `
        <div>Amount</div>
        <div>Description</div>
        <div>Category</div>
        <div>Date</div>
    `;

	expenseList.appendChild(headerRow); // Append the header to the list

	// Render each expense in the grid
	expenses.forEach(function (expense) {
		const expenseItem = document.createElement("div");
		expenseItem.innerHTML = `
            <div>$${expense.amount}</div>
            <div>${expense.description}</div>
            <div>${expense.category}</div>
            <div>${expense.date}</div>
        `;
		expenseList.appendChild(expenseItem);
	});
}

// Function to display category totals with percentages and apply scaleX()
function displayCategoryTotals() {
	categoryTotalsDiv.innerHTML = ""; // Clear the totals before updating

	const totalExpenses = calculateTotalExpenses(); // Get the total expenses

	// Loop over each category and calculate the percentage
	for (let category in categoryTotals) {
		let percentage = (categoryTotals[category] / totalExpenses) * 100;
		if (isNaN(percentage)) percentage = 0; // Handle case when totalExpenses is 0

		// Dynamically construct the class name for each category's bar
		const scaleValue = percentage / 100; // Convert to decimal for scaleX
		const categoryBar = document.querySelector(`.category-bar-${category}`);

		// Apply the scale transformation to the category bar
		if (categoryBar) {
			categoryBar.style.transform = `scaleX(${scaleValue})`;
		}

		// Create a div to display the category total and percentage as text
		const totalItem = document.createElement("div");
		totalItem.classList.add("category-total"); // Add class for styling

		// Display the category total and percentage in numbers
		totalItem.innerHTML = `<p>${category}: $${categoryTotals[category].toFixed(
			2
		)} (${percentage.toFixed(2)}%)</p>`;

		// Append the total item to the categoryTotalsDiv
		categoryTotalsDiv.appendChild(totalItem);
	}
}

// Function to calculate total monthly expenses
function calculateTotalExpenses() {
	let total = 0;
	for (let category in categoryTotals) {
		total += categoryTotals[category];
	}
	return total;
}

// Save the expenses to localStorage
function saveExpenses() {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();
	const storageKey = `expenses_${currentYear}_${currentMonth}`;

	localStorage.setItem(storageKey, JSON.stringify(expenses));
}

// Load the expenses from localStorage for the current month
function loadExpenses() {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();
	const storageKey = `expenses_${currentYear}_${currentMonth}`;

	const storedExpenses = localStorage.getItem(storageKey); // Load expenses for the current month
	if (storedExpenses) {
		expenses = JSON.parse(storedExpenses); // Convert back to array
		expenses.forEach((expense) => {
			categoryTotals[expense.category] += parseFloat(expense.amount); // Update the totals from stored data
		});
		displayExpenses(); // Display the expenses on the page
		displayCategoryTotals(); // Display category totals
	}
}

// Reset category totals
function resetCategoryTotals() {
	for (let category in categoryTotals) {
		categoryTotals[category] = 0;
	}
}

// Populate the dropdown with months that have stored data
function populateMonthDropdown() {
	const monthDropdown = document.getElementById("monthDropdown");

	// Clear any existing options (except the placeholder)
	monthDropdown.innerHTML = '<option value="">Select a month</option>';

	// Loop through localStorage to find keys that start with "expenses_"
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);

		if (key.startsWith("expenses_")) {
			// Extract year and month from the key (e.g., "expenses_2024_09")
			const [_, year, month] = key.split("_");
			const monthOption = `${year}-${month}`;

			// Add the month as an option in the dropdown
			const option = document.createElement("option");
			option.value = key; // Use the key as the value
			option.textContent = monthOption; // Display the year-month format
			monthDropdown.appendChild(option);
		}
	}
}

// Event listener for when a month is selected from the dropdown
document
	.getElementById("monthDropdown")
	.addEventListener("change", function () {
		const selectedKey = this.value; // Get the selected key (e.g., "expenses_2024_10")

		if (selectedKey) {
			loadExpensesForMonth(selectedKey); // Load the expenses for the selected month
		}
	});

// Function to load expenses for the selected month
function loadExpensesForMonth(storageKey) {
	resetCategoryTotals(); // Reset totals before updating
	const storedExpenses = localStorage.getItem(storageKey); // Retrieve expenses for the selected month
	if (storedExpenses) {
		expenses = JSON.parse(storedExpenses); // Convert back to array
		expenses.forEach((expense) => {
			categoryTotals[expense.category] += parseFloat(expense.amount); // Update the totals from stored data
		});

		displayExpenses(); // Display the expenses on the page
		displayCategoryTotals(); // Display category totals
	}
}
