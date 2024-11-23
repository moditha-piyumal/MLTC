const fileInput = document.getElementById("file-input");
const videoPlayer = document.getElementById("video-player");
const playPauseButton = document.getElementById("play-pause");
const progressBar = document.getElementById("progress-bar");
const volumeControl = document.getElementById("volume-control");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");
const timestampsDiv = document.getElementById("timestamps"); // Existing timestamps div
const savebutton = document.getElementById("save-progress-btn");
const loadButton = document.getElementById("load-progress-btn");
const newTimestampsDiv = document.getElementById("newtimestamps");
let countdownTimer; // Stores the countdown timer reference
let countdownActive = false; // Ensures the countdown runs only once

let chunkIntervals = []; // Array to hold chunk endpoints
let globalRewindTimestamp = null; // Global variable to store the rewind timestamp

// File selection and video loading
fileInput.addEventListener("change", () => {
	const file = fileInput.files[0];
	if (file) {
		const videoURL = URL.createObjectURL(file);
		videoPlayer.src = videoURL;
		videoPlayer.classList.remove("hidden");
		videoPlayer.load();
		timestampsDiv.innerHTML = ""; // Clear previous timestamps
		videoPlayer.addEventListener("loadedmetadata", generateTimestamps); // Generate timestamps after loading video
		playPauseButton.textContent = "Play";
	}
});

// Play/Pause functionality
playPauseButton.addEventListener("click", () => {
	if (videoPlayer.paused) {
		videoPlayer.play();
		playPauseButton.textContent = "Pause";
	} else {
		videoPlayer.pause();
		playPauseButton.textContent = "Play";
	}
});

// Update timestamps and progress bar
videoPlayer.addEventListener("timeupdate", () => {
	const progressPercent =
		(videoPlayer.currentTime / videoPlayer.duration) * 100;
	progressBar.value = progressPercent;
	currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
	totalTimeDisplay.textContent = formatTime(videoPlayer.duration);

	checkChunkEnd(); // Check if current time has reached a chunk end
});

// Seek functionality
progressBar.addEventListener("input", () => {
	const newTime = (progressBar.value / 100) * videoPlayer.duration;
	videoPlayer.currentTime = newTime;
});

// Volume control
volumeControl.addEventListener("input", () => {
	videoPlayer.volume = volumeControl.value;
});

// Generate timestamps for the video
function generateTimestamps() {
	const duration = videoPlayer.duration;
	const interval = 20 * 60; // 20 minutes in seconds
	let currentTime = interval;

	chunkIntervals = []; // Reset chunk intervals
	while (currentTime < duration) {
		chunkIntervals.push(currentTime); // Store chunk endpoints
		createTimestampButton(currentTime); // Create a button for each timestamp
		currentTime += interval;
	}
}

// Create a clickable timestamp button
function createTimestampButton(time) {
	const button = document.createElement("button");
	button.textContent = formatTime(time); // Display time in hh:mm format
	button.addEventListener("click", () => {
		videoPlayer.currentTime = time; // Jump to the specific time
		videoPlayer.play();
	});
	timestampsDiv.appendChild(button); // Add the button to the timestamps section
}

let currentChunkIndex = 0; // New: Tracks the active chunk

// Check if current time has reached a chunk end
function checkChunkEnd() {
	if (currentChunkIndex < chunkIntervals.length) {
		const chunkEnd = chunkIntervals[currentChunkIndex]; // Get the current chunk's endpoint
		const currentTime = Math.floor(videoPlayer.currentTime);

		if (currentTime >= chunkEnd && currentTime <= chunkEnd + 10) {
			videoPlayer.pause(); // Pause at the chunk end
			playPauseButton.textContent = "Continue"; // Change button text to "Continue"

			startCountdown(); // NEW: Start the countdown if button text is "Continue"
		}
		// Only pause and trigger countdown for chunk intervals
		// if (currentTime >= chunkEnd && chunkIntervals.includes(chunkEnd)) {
		// 	videoPlayer.pause(); // Pause at the chunk end
		// 	playPauseButton.textContent = "Continue"; // Change button text to "Continue"

		// 	startCountdown(); // Start the countdown if button text is "Continue"

		// 	currentChunkIndex++; // Move to the next chunk
		// }
	}
}

// NEW: Start a countdown timer
function startCountdown() {
	if (!countdownActive) {
		// Ensure the countdown runs only once
		countdownActive = true;
		let countdown = 60; // Start at 60 seconds

		// Update Play button text with countdown
		playPauseButton.textContent = `Continue (${countdown}s)`;

		countdownTimer = setInterval(() => {
			countdown--;
			playPauseButton.textContent = `Continue (${countdown}s)`;

			if (countdown <= 0) {
				clearInterval(countdownTimer); // Stop the timer
				countdownActive = false; // Reset countdown state
				onCountdownEnd(); // Call the function when countdown ends
			}
		}, 1000);

		// NEW: Add an event listener to stop the countdown if Play button is clicked
		playPauseButton.addEventListener(
			"click",
			() => {
				if (countdownActive) {
					clearInterval(countdownTimer); // Stop the timer
					countdownActive = false; // Reset countdown state
					playPauseButton.textContent = "Pause"; // Reset button text
					currentChunkIndex++; // Move to the next chunk
				}
			},
			{ once: true }
		); // Ensure this event listener is removed after one execution
	}
}

let latestRewindTimestamp = 0; // Global variable to store the rewind timestamp

// console.log(videoDuration);

// NEW: Function to handle countdown end
function onCountdownEnd() {
	console.log("Countdown Ended"); // Log to console when countdown ends

	// Calculate the timestamp 18 minutes (1080 seconds) before the current time
	const rewindTime = videoPlayer.currentTime - 1080; // 18 minutes = 1080 seconds

	// Ensure the timestamp is not negative
	const timestampTime = rewindTime > 0 ? rewindTime : 0;

	// Update the global variable
	latestRewindTimestamp = timestampTime;

	// Create a new timestamp button for this time
	const button = document.createElement("button");
	button.classList.add("rewind-button"); // Adds a class named "rewind-button"

	button.textContent = formatTime(timestampTime); // Format the time as mm:ss
	//zzzzzzzzzzzzzzzz
	button.addEventListener("click", () => {
		videoPlayer.currentTime = timestampTime; // Seek to the timestamp
		videoPlayer.play(); // Resume playback
		// xxx
		clearInterval(countdownTimer); // Stop the timer
		countdownActive = false; // Reset countdown state
		playPauseButton.textContent = "Pause"; // Reset button text
	});

	// Add the button to the timestampsDiv
	newTimestampsDiv.appendChild(button);
}

//xxxxxxxxxxxxxxxxxxxxxxxxxxxx

// Add a click event listener to the save button
savebutton.addEventListener("click", (event) => {
	console.log("Save Button Clicked");
	event.preventDefault();
	event.stopPropagation();
	saveProgress();
});

// window.addEventListener("beforeunload", (event) => {
// 	event.preventDefault();
// 	console.log("Reload prevented");
// });
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Function to save progress as a JSON file
function saveProgress() {
	// Dummy data for testing (replace with actual logic later if needed)
	// const data = {
	// 	rewindTimestamp: 9000000000006, // Example rewind timestamp
	// 	videoDuration: 111111111111111116, // Example video duration
	// };

	console.log("Opening file save dialog..."); // Debug log

	// Start the save file picker process
	window
		.showSaveFilePicker({
			suggestedName: "video-progress.json",
			types: [
				{
					description: "JSON Files",
					accept: { "application/json": [".json"] },
				},
			],
		})
		.then((fileHandle) => {
			console.log("File handle obtained:", fileHandle);
			return fileHandle.createWritable();
		})
		.then((writableStream) => {
			console.log("Writable stream created:", writableStream);

			const jsonData = JSON.stringify(
				{
					rewindTimestamp: latestRewindTimestamp || 0, // Use global variable or fallback to 0
					videoDuration: Math.floor(videoPlayer.duration) || 0, // Get video duration or default to 0
				},
				null,
				2
			);
			return writableStream.write(jsonData).then(() => {
				console.log("Data written to file.");
				return writableStream.close();
			});
		})
		.then(() => {
			console.log("File successfully saved!");
		})
		.catch((error) => {
			console.error("Error during save:", error);
		});
}

//lllllllllllllllllll
// Add a click event listener to the Load Progress button
// loadButton.addEventListener("click", () => {
// 	console.log("Load Progress button clicked!");
// });
// Add a click event listener to the Load Progress button
// Define whatWeDoWhenDurationsMatch function

// Update the Load Progress button click event listener
loadButton.addEventListener("click", async () => {
	try {
		console.log("Load Progress button clicked!"); // Debug log

		// Open the file picker to select a JSON file
		const [fileHandle] = await window.showOpenFilePicker({
			types: [
				{
					description: "JSON Files",
					accept: { "application/json": [".json"] },
				},
			],
		});

		console.log("File selected:", fileHandle.name); // Log selected file name

		// Get a readable stream for the selected file
		const file = await fileHandle.getFile();
		const fileContent = await file.text(); // Read the file content as text

		// Parse the JSON content
		const jsonData = JSON.parse(fileContent);

		console.log("Loaded JSON data:", jsonData);

		// Check if the JSON file has the expected structure
		if (
			jsonData.rewindTimestamp !== undefined &&
			jsonData.videoDuration !== undefined
		) {
			console.log("Valid video-progress.json file loaded.");

			// Compare video durations
			const videoPlayerDuration = Math.floor(videoPlayer.duration || 0);
			if (jsonData.videoDuration === videoPlayerDuration) {
				// Call the function if durations match
				globalRewindTimestamp = jsonData.rewindTimestamp; // Assign to global variable
				console.log("Global Rewind Timestamp:", globalRewindTimestamp); // Debug log
				whatWeDoWhenDurationsMatch();
			} else {
				console.warn("Video duration does not match.");
			}
		} else {
			console.warn("The loaded file does not have the expected structure.");
		}
	} catch (error) {
		console.error("Error loading progress:", error);
	}
});

//llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll
function whatWeDoWhenDurationsMatch() {
	console.log("Durations match! Proceeding with further logic...");
	console.log("Accessing Global Rewind Timestamp:", globalRewindTimestamp);
	const button = document.createElement("button");
	button.classList.add("rewind-button"); // Adds a class named "rewind-button"

	button.textContent = formatTime(globalRewindTimestamp); // Format the time as mm:ss

	// const newRewindTimestamp = jsonData.rewindTimestamp;
	// Add an event listener to the button to play from the rewind timestamp
	button.addEventListener("click", () => {
		videoPlayer.currentTime = globalRewindTimestamp; // Seek to the rewind timestamp
		videoPlayer.play(); // Start playback
		console.log(`Playing video from: ${formatTime(globalRewindTimestamp)}`);
		playPauseButton.textContent = "Pause";
	});
	// console.log("Rewind timestamp grabbed:", newRewindTimestamp);
	// Append the button to the timestamps section
	const newTimestampsDiv = document.getElementById("newtimestamps"); // Replace with your actual container ID
	if (newTimestampsDiv) {
		newTimestampsDiv.appendChild(button); // Add the button to the DOM
		console.log("Rewind timestamp button created and added to the DOM.");
	} else {
		console.error("Container for new timestamps not found!");
	}
}

// Helper function to format time
function formatTime(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
