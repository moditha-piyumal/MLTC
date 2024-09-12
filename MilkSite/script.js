// script.js
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
	navLinks.classList.toggle("show");
});

let slideIndex = 0;
showSlide(slideIndex);

function moveSlide(n) {
	showSlide((slideIndex += n));
}

function showSlide(n) {
	let slides = document.getElementsByClassName("testimonial-slide");

	// If n exceeds the number of slides, reset to the first slide
	if (n >= slides.length) {
		slideIndex = 0;
	}
	// If n is less than 0, go to the last slide
	if (n < 0) {
		slideIndex = slides.length - 1;
	}

	// Hide all slides
	for (let i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
	}

	// Show the current slide
	slides[slideIndex].style.display = "block";
}
