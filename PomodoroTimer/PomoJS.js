let studyTime,
	restTime,
	cycleCount,
	currentCycle = 1;
let intervalID;
let isStudyPhase = true;

// Update the display for the range sliders
var studyInput = document.querySelector("#studyRange");
var studyValueDisplay = document.querySelector("#studyValue");
studyInput.addEventListener("input", function () {
	studyValueDisplay.textContent = studyInput.value;
});

var restInput = document.querySelector("#restRange");
var restValueDisplay = document.querySelector("#restValue");
restInput.addEventListener("input", function () {
	restValueDisplay.textContent = restInput.value;
});

var cycleInput = document.querySelector("#cycleRange");
var cycleValueDisplay = document.querySelector("#cycleValue");
cycleInput.addEventListener("input", function () {
	cycleValueDisplay.textContent = cycleInput.value;
});

// Progress bars
var studyProgressBar = document.querySelector("#studyProgress");
var restProgressBar = document.querySelector("#restProgress");

// Function to update the progress bar
function updateProgressBar(progressBar, timeLeft, totalTime) {
	progressBar.max = totalTime; // Set the max value of the progress bar
	progressBar.value = totalTime - timeLeft; // Update progress based on time left
}

let studyEndSound = new Audio("path_to_study_end.wav"); // WAV or MP3
let restEndSound = new Audio("path_to_rest_end.wav"); // WAV or MP3

// Function to start the study timer
function startStudyTimer() {
	studyTime = parseInt(studyInput.value) * 60;
	studyProgressBar.max = studyTime; // Set the max value of the study progress bar
	studyProgressBar.value = 0; // Reset the progress bar to 0 at the start
	restProgressBar.value = 0; // Reset rest progress bar
	document.querySelector("#timerTitle").innerHTML =
		"Study Time! (Turn " + currentCycle + " of " + cycleCount + ")";
	document.querySelector("#timeDisplay").innerHTML = studyTime;

	intervalID = setInterval(function () {
		document.querySelector("#timeDisplay").innerHTML = studyTime;
		updateProgressBar(
			studyProgressBar,
			studyTime,
			parseInt(studyInput.value) * 60
		); // Update the study progress bar
		studyTime--;

		if (studyTime <= 0) {
			clearInterval(intervalID);
			studyEndSound.play(); // Play the sound when study time ends
			startRestTimer(); // Start the rest timer after the study time ends
		}
	}, 1000); // 1 second interval
}

// Function to start the rest timer
function startRestTimer() {
	restTime = parseInt(restInput.value) * 60;
	restProgressBar.max = restTime; // Set the max value of the rest progress bar
	restProgressBar.value = 0; // Reset the rest progress bar
	document.querySelector("#timerTitle").innerHTML =
		"Rest Time! (Turn " + currentCycle + " of " + cycleCount + ")";
	document.querySelector("#timeDisplay").innerHTML = restTime;

	intervalID = setInterval(function () {
		document.querySelector("#timeDisplay").innerHTML = restTime;
		updateProgressBar(
			restProgressBar,
			restTime,
			parseInt(restInput.value) * 60
		); // Update the rest progress bar
		restTime--;

		if (restTime <= 0) {
			clearInterval(intervalID);
			restEndSound.play(); // Play the sound when rest time ends
			currentCycle++;

			if (currentCycle <= cycleCount) {
				startStudyTimer(); // Start the next cycle
			} else {
				document.querySelector("#timeDisplay").innerHTML =
					"All Turns are Completed!";
				document.querySelector("#timerTitle").innerHTML = "Well Done!";
				studyProgressBar.value = studyProgressBar.max; // Set study progress bar to max
				restProgressBar.value = restProgressBar.max; // Set rest progress bar to max
				startButton.disabled = false;
				studyInput.disabled = false;
				restInput.disabled = false;
				cycleInput.disabled = false;
				studyProgressBar.value = 0; // Set study progress bar to min
				restProgressBar.value = 0; // Set rest progress bar to min
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
	document.querySelector("#timeDisplay").innerHTML = "Timer stopped!";
	document.querySelector("#timerTitle").innerHTML = "Pomodoro Stopped";
	studyProgressBar.value = 0; // Reset study progress bar
	restProgressBar.value = 0; // Reset rest progress bar

	// Enable sliders and start button again
	startButton.disabled = false;
	studyInput.disabled = false;
	restInput.disabled = false;
	cycleInput.disabled = false;
});
