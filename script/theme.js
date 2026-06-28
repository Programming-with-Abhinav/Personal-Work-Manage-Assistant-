/**
 * Theme Management Module
 * Handles light/dark mode and theme persistence
 */

class ThemeManager {
	constructor() {
		this.init();
	}

	init() {
		const savedTheme = localStorage.getItem("theme") || "light";
		this.setTheme(savedTheme);

		const themeToggle = document.getElementById("themeToggle");
		if (themeToggle) {
			themeToggle.addEventListener("click", () => this.toggleTheme());
		}
	}

	setTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);

		const themeToggle = document.getElementById("themeToggle");
		if (themeToggle) {
			const icon = themeToggle.querySelector("i");
			if (icon) {
				icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
			}
		}
	}

	toggleTheme() {
		const currentTheme =
			document.documentElement.getAttribute("data-theme") || "light";
		const newTheme = currentTheme === "dark" ? "light" : "dark";
		this.setTheme(newTheme);
	}
}

// Initialize theme manager
document.addEventListener("DOMContentLoaded", () => {
	if (!window.themeManager) {
		window.themeManager = new ThemeManager();
	}
});
