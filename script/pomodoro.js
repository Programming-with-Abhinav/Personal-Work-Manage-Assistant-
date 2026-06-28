/**
 * Pomodoro Timer Module
 * Implements Pomodoro Technique with focus, short break, and long break modes
 */

class PomodoroModule {
	constructor(app) {
		this.app = app;
		this.workDuration = 25 * 60; // 25 minutes
		this.breakDuration = 5 * 60; // 5 minutes
		this.longBreakDuration = 15 * 60; // 15 minutes
		this.timeLeft = this.workDuration;
		this.isRunning = false;
		this.currentMode = "focus"; // focus, break, longBreak
		this.sessionsCompleted = 0;
		this.intervalId = null;
		this.init();
	}

	init() {
		this.renderPomodoroUI();
		this.setupEventListeners();
	}

	setupEventListeners() {
		const startBtn = document.getElementById("startTimerBtn");
		const resetBtn = document.getElementById("resetTimerBtn");

		if (startBtn) startBtn.addEventListener("click", () => this.toggleTimer());
		if (resetBtn) resetBtn.addEventListener("click", () => this.resetTimer());
	}

	renderPomodoroUI() {
		this.updateDisplay();
	}

	updateDisplay() {
		const display = document.getElementById("timerDisplay");
		if (display) {
			const minutes = Math.floor(this.timeLeft / 60);
			const seconds = this.timeLeft % 60;
			display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		const startBtn = document.getElementById("startTimerBtn");
		if (startBtn) {
			startBtn.textContent = this.isRunning ? "Pause" : "Start";
		}
	}

	toggleTimer() {
		if (this.isRunning) {
			this.pauseTimer();
		} else {
			this.startTimer();
		}
	}

	startTimer() {
		this.isRunning = true;
		this.updateDisplay();

		this.intervalId = setInterval(() => {
			this.timeLeft--;

			if (this.timeLeft <= 0) {
				this.completePhase();
			}

			this.updateDisplay();
		}, 1000);
	}

	pauseTimer() {
		this.isRunning = false;
		clearInterval(this.intervalId);
		this.updateDisplay();
	}

	resetTimer() {
		clearInterval(this.intervalId);
		this.isRunning = false;
		this.timeLeft = this.workDuration;
		this.currentMode = "focus";
		this.updateDisplay();
	}

	completePhase() {
		clearInterval(this.intervalId);
		this.isRunning = false;

		if (this.currentMode === "focus") {
			this.sessionsCompleted++;

			// Determine next mode
			if (this.sessionsCompleted % 4 === 0) {
				this.currentMode = "longBreak";
				this.timeLeft = this.longBreakDuration;
			} else {
				this.currentMode = "break";
				this.timeLeft = this.breakDuration;
			}

			this.showNotification("Focus session complete! Time for a break.");
		} else {
			this.currentMode = "focus";
			this.timeLeft = this.workDuration;
			this.showNotification("Break complete! Ready for another focus session?");
		}

		this.updateDisplay();
	}

	showNotification(message) {
		if ("Notification" in window && Notification.permission === "granted") {
			new Notification("Pomodoro Timer", {
				body: message,
				icon: "⏱️",
			});
		}
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.pomodoro = new PomodoroModule(window.app);
	}
});
