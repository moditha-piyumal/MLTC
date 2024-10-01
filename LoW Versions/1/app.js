let studyTime,
	restTime,
	cycleCount,
	currentCycle = 1;
let intervalID;
let isStudyPhase = true;

// Select DOM elements
var studyInput = document.querySelector("#studyRange");
var studyValueDisplay = document.querySelector("#studyValue");
var restInput = document.querySelector("#restRange");
var restValueDisplay = document.querySelector("#restValue");
var cycleInput = document.querySelector("#cycleRange");
var cycleValueDisplay = document.querySelector("#cycleValue");
var alertMessage = document.getElementById("alertMessage");

// Select time display elements
var studyTimeDisplay = document.querySelector("#studyTimeDisplay");
var restTimeDisplay = document.querySelector("#restTimeDisplay");

// Select circular progress elements
var studyProgressCircle = document.querySelector(
	".circle-container.study-time"
);
var restProgressCircle = document.querySelector(".circle-container.rest-time");

// Update the display for the range sliders
studyInput.addEventListener("input", function () {
	studyValueDisplay.textContent = studyInput.value;

	// Check if rest time is greater than or equal to study time
	if (parseInt(restInput.value) >= parseInt(studyInput.value)) {
		alertMessage.style.display = "block";
		alertMessage.textContent =
			"Rest Time must be less than Study Time. Please select a lower value.";
		startButton.disabled = true; // Disable the Start button
	} else {
		alertMessage.style.display = "none";
		startButton.disabled = false; // Enable the Start button
	}
});

restInput.addEventListener("input", function () {
	restTime = parseInt(this.value);

	// Check if rest time is greater than or equal to study time
	if (restTime >= parseInt(studyInput.value)) {
		alertMessage.style.display = "block";
		alertMessage.textContent =
			"Rest Time must be less than Study Time. Please select a lower value.";
		startButton.disabled = true; // Disable the Start button
	} else {
		alertMessage.style.display = "none";
		startButton.disabled = false; // Enable the Start button
	}
	restValueDisplay.textContent = restInput.value;
});

cycleInput.addEventListener("input", function () {
	cycleValueDisplay.textContent = cycleInput.value;
});

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

let studyEndSound = new Audio("path_to_study_end.wav"); // WAV or MP3
let restEndSound = new Audio("path_to_rest_end.wav"); // WAV or MP3

// Function to start the study timer
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
		); // Update circular progress
		studyTime--;

		if (studyTime < 0) {
			clearInterval(intervalID);
			studyEndSound.play(); // Play the sound when study time ends

			// Add a small delay before starting the rest timer to render 100% progress
			setTimeout(startRestTimer, 100);
		}
	}, 1000); // 1 second interval
}

// Function to start the rest timer
function startRestTimer() {
	restTime = parseInt(restInput.value) * 60;
	document.querySelector(
		"#timerTitle"
	).innerHTML = `Rest Time! (Turn ${currentCycle} of ${cycleCount})`;

	// Show rest time
	restTimeDisplay.innerHTML = `Rest Time: ${restTime}`;

	intervalID = setInterval(function () {
		restTimeDisplay.innerHTML = `Rest Time: ${restTime}`;
		updateCircleProgress(restTime, parseInt(restInput.value) * 60, "rest-time"); // Update circular progress
		restTime--;

		if (restTime < 0) {
			clearInterval(intervalID);
			restEndSound.play(); // Play the sound when rest time ends
			currentCycle++;

			console.log("Current cycle:", currentCycle, "Cycle count:", cycleCount); // Debugging line

			if (currentCycle > cycleCount) {
				// All turns are completed
				console.log("All cycles completed"); // Debugging line
				studyTimeDisplay.innerHTML = "All Turns are Completed!";
				document.querySelector("#timerTitle").innerHTML = "Well Done!";

				// Reset the displays
				restTimeDisplay.innerHTML = "We are so Proud of You!";

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
	}, 1000); // 1 second interval
}

// Start button event listener
var startButton = document.querySelector("#startButton");
startButton.addEventListener("click", function () {
	cycleCount = parseInt(cycleInput.value); // Set the number of cycles
	currentCycle = 1; // Reset the cycle counter
	startStudyTimer(); // Start the first cycle

	// Disable the sliders and button once the timer starts
	startButton.disabled = true;
	studyInput.disabled = true;
	restInput.disabled = true;
	cycleInput.disabled = true;
});

// Stop button event listener to clear interval and reset the timer
var stopButton = document.querySelector("#stopButton");
stopButton.addEventListener("click", function () {
	clearInterval(intervalID);
	document.querySelector("#timerTitle").innerHTML = "Pomodoro Stopped";

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
