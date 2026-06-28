/**
 * Registration Script
 * Handles user registration with password strength validation
 */

const form = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const loading = document.getElementById("loading");
const submitBtn = document.getElementById("submitBtn");
const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strengthBar");

// Password strength calculator
function calculatePasswordStrength(password) {
	let strength = 0;

	if (password.length >= 8) strength++;
	if (password.length >= 12) strength++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
	if (/[0-9]/.test(password)) strength++;
	if (/[^a-zA-Z0-9]/.test(password)) strength++;

	return Math.min(strength, 3);
}

// Update password strength indicator
passwordInput.addEventListener("input", () => {
	const strength = calculatePasswordStrength(passwordInput.value);
	strengthBar.className = "strength-bar";

	if (strength === 0) {
		strengthBar.className = "strength-bar";
	} else if (strength === 1) {
		strengthBar.className = "strength-bar weak";
	} else if (strength === 2) {
		strengthBar.className = "strength-bar medium";
	} else {
		strengthBar.className = "strength-bar strong";
	}
});

// Show error message
function showError(message) {
	errorMessage.textContent = message;
	errorMessage.classList.add("show");
	successMessage.classList.remove("show");
	setTimeout(() => {
		errorMessage.classList.remove("show");
	}, 5000);
}

// Show success message
function showSuccess(message) {
	successMessage.textContent = message;
	successMessage.classList.add("show");
	errorMessage.classList.remove("show");
	setTimeout(() => {
		successMessage.classList.remove("show");
	}, 3000);
}

// Show loading state
function setLoading(isLoading) {
	loading.classList.toggle("show", isLoading);
	submitBtn.disabled = isLoading;
}

// Handle form submission
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const firstName = document.getElementById("firstName").value.trim();
	const lastName = document.getElementById("lastName").value.trim();
	const username = document.getElementById("username").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value;
	const confirmPassword = document.getElementById("confirmPassword").value;
	const agreeTerms = document.getElementById("agreeTerms").checked;

	// Validation
	if (!firstName || !lastName || !username || !email || !password) {
		showError("Please fill in all fields");
		return;
	}

	if (password.length < 8) {
		showError("Password must be at least 8 characters long");
		return;
	}

	if (password !== confirmPassword) {
		showError("Passwords do not match");
		return;
	}

	if (!agreeTerms) {
		showError("Please agree to the Terms of Service");
		return;
	}

	// Make API call
	setLoading(true);

	try {
		const response = await fetch("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				email,
				password,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Registration failed");
		}

		// Store user info in localStorage
		const userData = {
			id: data.user.id,
			username: data.user.username,
			email: data.user.email,
			firstName,
			lastName,
		};

		localStorage.setItem("currentUser", JSON.stringify(userData));
		showSuccess("Registration successful! Redirecting...");

		setTimeout(() => {
			window.location.href = "/home.html";
		}, 1500);
	} catch (error) {
		showError(error.message);
	} finally {
		setLoading(false);
	}
});
