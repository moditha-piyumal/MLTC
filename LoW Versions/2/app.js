// ======= PART 1: Initial Setup =======
let studyTime,
	restTime,
	cycleCount,
	currentCycle = 1;
let intervalID;
let isStudyPhase = true;

// Score variables
let sessionScore = 0;
let dailyScore = 0;
let totalScore = 0;
let dailyScoresHistory =
	JSON.parse(localStorage.getItem("dailyScoresHistory")) || [];

// LocalStorage keys
const DAILY_SCORE_KEY = "dailyScore";
const TOTAL_SCORE_KEY = "totalScore";
const LAST_OPEN_DATE_KEY = "lastOpenDate"; // New key for date tracking

// ======= PART 2: Selecting DOM Elements =======
var studyInput = document.querySelector("#studyRange");
var studyValueDisplay = document.querySelector("#studyValue");
var restInput = document.querySelector("#restRange");
var restValueDisplay = document.querySelector("#restValue");
var cycleInput = document.querySelector("#cycleRange");
var cycleValueDisplay = document.querySelector("#cycleValue");
var alertMessage1 = document.getElementById("alertMessage1");
var alertMessage2 = document.getElementById("alertMessage2");
var alertMessage3 = document.getElementById("alertMessage3");
var alertMessage4 = document.getElementById("alertMessage4");

var startButton = document.querySelector("#startButton");

// ======= PART 3: Selecting Display Elements =======
var studyTimeDisplay = document.querySelector("#studyTimeDisplay");
var restTimeDisplay = document.querySelector("#restTimeDisplay");

// Select score display elements
var sessionScoreDisplay = document.querySelector("#sessionScore");
var dailyScoreDisplay = document.querySelector("#dailyScore");
var totalScoreDisplay = document.querySelector("#totalScore");

// Initialize score displays to 0
sessionScoreDisplay.innerHTML = "0";
dailyScoreDisplay.innerHTML = "0";
totalScoreDisplay.innerHTML = "0";

// ======= PART 4: Selecting Circular Progress Elements =======
var studyProgressCircle = document.querySelector(
	".circle-container.study-time"
);
var restProgressCircle = document.querySelector(".circle-container.rest-time");

// ======= PART 5: Update Display for Range Sliders =======
studyInput.addEventListener("input", function () {
	studyValueDisplay.textContent = studyInput.value;

	// Check if rest time is greater than or equal to study time
	if (parseInt(restInput.value) >= parseInt(studyInput.value)) {
		alertMessage1.style.display = "block";
		alertMessage1.textContent =
			"Rest Time must be less than Study Time. Please select a lower value.";
		startButton.disabled = true; // Disable the Start button
	} else {
		alertMessage1.style.display = "none";
		startButton.disabled = false; // Enable the Start button
	}
});

restInput.addEventListener("input", function () {
	restTime = parseInt(this.value);

	// Check if rest time is greater than or equal to study time
	if (restTime >= parseInt(studyInput.value)) {
		alertMessage1.style.display = "block";
		alertMessage1.textContent =
			"Rest Time must be less than Study Time. Please select a lower value.";
		startButton.disabled = true; // Disable the Start button
	} else {
		alertMessage1.style.display = "none";
		startButton.disabled = false; // Enable the Start button
	}
	restValueDisplay.textContent = restInput.value;
});

cycleInput.addEventListener("input", function () {
	cycleValueDisplay.textContent = cycleInput.value;
});

// ======= PART 6: Progress Bar Functions =======
// Function to set the progress of the circular bar
function setCircleProgress(progress, type) {
	const circle = document.querySelector(`.circle-container.${type}`);
	circle.style.background = `conic-gradient(
        #D2E0FB ${progress * 3.6}deg,
        #001F3F 0deg, #631a09 180deg,
        #001F3F 360deg
    )`;
}

// Function to update the circular progress bar
function updateCircleProgress(timeLeft, totalTime, type) {
	const progress = ((totalTime - timeLeft) / totalTime) * 100; // Calculate percentage
	setCircleProgress(progress, type);
}

// ======= PART 7: Sounds for Study and Rest End =======
let studyEndSound = new Audio("path_to_study_end.wav");
let restEndSound = new Audio("path_to_rest_end.wav");

// ======= PART 8: Study Timer Function =======
function startStudyTimer() {
	studyTime = parseInt(studyInput.value) * 60;
	document.querySelector(
		"#timerTitle"
	).innerHTML = `Study Time! (Turn ${currentCycle} of ${cycleCount})`;

	// Show study time
	studyTimeDisplay.innerHTML = `Study Time: ${studyTime}`;

	intervalID = setInterval(function () {
		studyTimeDisplay.innerHTML = `Study Time: ${studyTime}`;
		updateCircleProgress(
			studyTime,
			parseInt(studyInput.value) * 60,
			"study-time"
		);
		studyTime--;

		if (studyTime < 0) {
			clearInterval(intervalID);
			studyEndSound.play(); // Play the sound when study time ends

			// Call a separate function to handle scoring
			handleStudySessionScoring();

			// Add a small delay before starting the rest timer to render 100% progress
			setTimeout(startRestTimer, 100);
		}
	}, 100); // 1 second interval
}

// 1000x

// Separate function to handle scoring for the study session
function handleStudySessionScoring() {
	let studyMinutes = parseInt(studyInput.value);
	let studySessionPoints = 0;

	// Basic scoring: 1 point for every minute
	studySessionPoints += studyMinutes;

	// Bonus points for longer study sessions
	if (studyMinutes > 40) {
		studySessionPoints += studyMinutes; // Extra points, so 2 points per minute
		// Show the alert message
		alertMessage2.style.display = "block";
		alertMessage2.textContent =
			"Your Study Time was more than 40 minutes. That was impressive. Score was doubled. Hooray!";

		// Hide the alert message after 10 seconds
		setTimeout(function () {
			alertMessage2.style.display = "none";
		}, 10000); // 10000 milliseconds = 10 seconds
	}

	// Penalty for shorter study sessions
	if (studyMinutes < 20) {
		studySessionPoints -= 5;
		// Show the alert message
		alertMessage3.style.display = "block";
		alertMessage3.textContent =
			"Your Study Time was lesser than 20 minutes. A penalty of 5 points was incurred.";

		// Hide the alert message after 10 seconds
		setTimeout(function () {
			alertMessage3.style.display = "none";
		}, 10000); // 10000 milliseconds = 10 seconds
	}

	// Penalty if the study session is longer than the rest session by 5 minutes or less
	if (studyMinutes - parseInt(restInput.value) <= 5) {
		studySessionPoints -= 7;

		// Show the alert message
		alertMessage4.style.display = "block";
		alertMessage4.textContent =
			"Your Rest Timer is just five minutes lesser than your Study Time. A penalty of 7 points was incurred.";

		// Hide the alert message after 10 seconds
		setTimeout(function () {
			alertMessage4.style.display = "none";
		}, 10000); // 10000 milliseconds = 10 seconds
	}

	// Update the session score
	sessionScore += studySessionPoints;

	// Prevent negative scores
	if (sessionScore < 0) sessionScore = 0;

	// Display the updated session score
	sessionScoreDisplay.innerHTML = sessionScore;
}

// ======= PART 9: Rest Timer Function =======
function startRestTimer() {
	updateDateAndScore(); // Call the function to check and update the date before starting the rest timer

	restTime = parseInt(restInput.value) * 60;
	document.querySelector(
		"#timerTitle"
	).innerHTML = `Rest Time! (Turn ${currentCycle} of ${cycleCount})`;

	// Show rest time
	restTimeDisplay.innerHTML = `Rest Time: ${restTime}`;

	intervalID = setInterval(function () {
		restTimeDisplay.innerHTML = `Rest Time: ${restTime}`;
		updateCircleProgress(restTime, parseInt(restInput.value) * 60, "rest-time");
		restTime--;

		if (restTime < 0) {
			clearInterval(intervalID);
			restEndSound.play(); // Play the sound when rest time ends
			currentCycle++;

			console.log("Current cycle:", currentCycle, "Cycle count:", cycleCount); // Debugging line

			if (currentCycle > cycleCount) {
				// All turns are completed
				console.log("All cycles completed"); // Debugging line

				// Update session score with all completed study sessions' points
				sessionScoreDisplay.innerHTML = sessionScore;

				// Add the session score to the daily and total scores
				dailyScore += sessionScore;
				totalScore += sessionScore;
				// Save the updated scores to localStorage
				saveScores();

				// Update daily and total score displays
				dailyScoreDisplay.innerHTML = dailyScore;
				totalScoreDisplay.innerHTML = totalScore;

				// Reset the displays
				studyTimeDisplay.innerHTML = "All Turns are Completed!";
				restTimeDisplay.innerHTML = "We are so Proud of You!";

				document.querySelector("#timerTitle").innerHTML = "Well Done!";

				// Reset progress circles
				setCircleProgress(0, "study-time");
				setCircleProgress(0, "rest-time");

				// Enable the start button and sliders
				startButton.disabled = false;
				studyInput.disabled = false;
				restInput.disabled = false;
				cycleInput.disabled = false;
			} else {
				// Add a small delay before starting the next study timer
				setTimeout(startStudyTimer, 100);
			}
		}
	}, 100); // 1 second interval
}

// 1000x

// ======= PART 10: Start Button Event Listener =======
startButton.addEventListener("click", function () {
	cycleCount = parseInt(cycleInput.value); // Set the number of cycles
	currentCycle = 1; // Reset the cycle counter
	sessionScore = 0; // Reset session score at the start of a new session
	sessionScoreDisplay.innerHTML = 0;
	startStudyTimer(); // Start the first cycle

	// Disable the sliders and button once the timer starts
	startButton.disabled = true;
	studyInput.disabled = true;
	restInput.disabled = true;
	cycleInput.disabled = true;
});

// ======= PART 11: Stop Button Event Listener =======
stopButton.addEventListener("click", function () {
	clearInterval(intervalID);
	document.querySelector("#timerTitle").innerHTML = "Pomodoro Stopped";

	// Check if the stop button is pressed during study time
	if (isStudyPhase) {
		// Apply a penalty for stopping during study time
		totalSessionScore = sessionScore - 10; // Apply penalty for stopping early during study
		if (totalSessionScore < 0) totalSessionScore = 0; // Prevent negative scores

		// Update the session score display
		sessionScoreDisplay.innerHTML = totalSessionScore;

		// Update daily and total scores
		dailyScore += totalSessionScore;
		totalScore += totalSessionScore;
	} else {
		// If stop is pressed during rest time, add the session score as usual
		dailyScore += sessionScore;
		totalScore += sessionScore;

		// Apply penalty for not completing all turns
		dailyScore -= 5; // Adjust this penalty if necessary
		totalScore -= 5;

		if (dailyScore < 0) dailyScore = 0;
		if (totalScore < 0) totalScore = 0;
	}

	// Save the updated scores to localStorage
	saveScores();

	// Update the daily and total score displays
	dailyScoreDisplay.innerHTML = dailyScore;
	totalScoreDisplay.innerHTML = totalScore;

	// Reset the displays
	studyTimeDisplay.innerHTML = "";
	restTimeDisplay.innerHTML = "";

	// Reset progress circles
	setCircleProgress(0, "study-time");
	setCircleProgress(0, "rest-time");

	// Enable sliders and start button again
	startButton.disabled = false;
	studyInput.disabled = false;
	restInput.disabled = false;
	cycleInput.disabled = false;
});

// ======= PART 12: Score Management Functions =======
function saveScores() {
	// Save the current daily and total scores to localStorage
	localStorage.setItem(DAILY_SCORE_KEY, dailyScore);
	localStorage.setItem(TOTAL_SCORE_KEY, totalScore);
}

// ======= PART 13: Load Scores from Local Storage =======
function loadScores() {
	// Get the daily score from localStorage, or set to 0 if not found
	const storedDailyScore = localStorage.getItem(DAILY_SCORE_KEY);
	if (storedDailyScore) {
		dailyScore = parseInt(storedDailyScore);
	} else {
		dailyScore = 0;
	}

	// Get the total score from localStorage, or set to 0 if not found
	const storedTotalScore = localStorage.getItem(TOTAL_SCORE_KEY);
	if (storedTotalScore) {
		totalScore = parseInt(storedTotalScore);
	} else {
		totalScore = 0;
	}

	// Log values for debugging
	console.log("Loaded dailyScore:", dailyScore);
	console.log("Loaded totalScore:", totalScore);

	// Update the score displays
	dailyScoreDisplay.innerHTML = dailyScore;
	totalScoreDisplay.innerHTML = totalScore;
}

function checkAndResetDailyScore() {
	const currentDate = new Date().toLocaleDateString(); // Get current date as a string
	const lastOpenDate = localStorage.getItem(LAST_OPEN_DATE_KEY);

	// If the last open date is different from today's date, reset the daily score
	if (lastOpenDate !== currentDate) {
		dailyScore = 0; // Reset the daily score
		localStorage.setItem(DAILY_SCORE_KEY, dailyScore); // Update in localStorage
		localStorage.setItem(LAST_OPEN_DATE_KEY, currentDate); // Update the last open date
	}

	// Log value for debugging
	console.log("After reset check, dailyScore:", dailyScore);

	// Update the daily score display
	dailyScoreDisplay.innerHTML = dailyScore;
}

// ======= PART 14: Load Scores When Page Loads =======
loadScores();
checkAndResetDailyScore(); // Call the function to reset daily score if needed

// ======= PART 15: Clear Scores Button Event Listener =======
/*
var clearScoresButton = document.querySelector("#timerTitle");
clearScoresButton.addEventListener("click", function () {
    // Clear scores from localStorage
    localStorage.clear();

    // Reset scores in the variables
    sessionScore = 0;
    dailyScore = 0;
    totalScore = 0;

    // Update the score displays
    sessionScoreDisplay.innerHTML = "0";
    dailyScoreDisplay.innerHTML = "0";
    totalScoreDisplay.innerHTML = "0";

    // Optionally show an alert or message to indicate scores have been cleared
    // alert("All scores have been cleared!");
});
*/

// ======= PART 16: Check and Update Date and Score =======
function updateDateAndScore() {
	const currentDate = new Date().toLocaleDateString(); // Get the current date as a string
	const lastOpenDate = localStorage.getItem(LAST_OPEN_DATE_KEY);

	// If the last open date is different from today's date, reset the daily score
	if (lastOpenDate !== currentDate) {
		// Save the previous day's score in the history array
		if (dailyScore > 0) {
			dailyScoresHistory.unshift({ date: lastOpenDate, score: dailyScore });
			localStorage.setItem(
				"dailyScoresHistory",
				JSON.stringify(dailyScoresHistory)
			);
		}

		dailyScore = 0; // Reset the daily score
		localStorage.setItem(DAILY_SCORE_KEY, dailyScore); // Update in localStorage
		localStorage.setItem(LAST_OPEN_DATE_KEY, currentDate); // Update the last open date

		// Update the daily score display
		dailyScoreDisplay.innerHTML = dailyScore;

		// Update the list display
		updateDailyScoresList();
	}

	// Log value for debugging
	console.log("After reset check, dailyScore:", dailyScore);
}

// ======= PART 17: Update and Display Daily Scores List =======

// Function to update the daily scores list
function updateDailyScoresList() {
	const dailyScoresList = document.createElement("div");
	dailyScoresList.innerHTML = "<h3>Past Daily Scores:</h3>";

	if (dailyScoresHistory.length === 0) {
		dailyScoresList.innerHTML += "<p>No scores recorded yet.</p>";
	} else {
		dailyScoresHistory.forEach((entry) => {
			const date = new Date(entry.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
			dailyScoresList.innerHTML += `<p>Date: ${date}, Score: ${entry.score}</p>`;
		});
	}
	// dailyScoresList.classList.add("dailyScoreList");

	// Append the list to the body or a specific container
	const existingList = document.getElementById("dailyScoresList");
	if (existingList) {
		existingList.replaceWith(dailyScoresList);
	} else {
		document.body.appendChild(dailyScoresList);
	}
	dailyScoresList.id = "dailyScoresList";
}

// Call this function to update the display of the list when the page loads
updateDailyScoresList();
