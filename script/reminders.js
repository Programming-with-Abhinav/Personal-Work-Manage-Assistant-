/**
 * Reminders Module
 * Handles reminder management with time-based notifications
 */

class RemindersModule {
	constructor(app) {
		this.app = app;
		this.reminders = [];
		this.init();
	}

	async init() {
		this.setupEventListeners();
		await this.loadReminders();
		this.renderReminders();
		// Check for due reminders every minute
		setInterval(() => this.checkReminders(), 60000);
	}

	setupEventListeners() {
		const newReminderBtn = document.getElementById("newReminderBtn");
		if (newReminderBtn) {
			newReminderBtn.addEventListener("click", () => this.openReminderModal());
		}
	}

	async loadReminders() {
		try {
			const response = await fetch(`/api/reminders/${this.app.currentUser.id}`);
			this.reminders = await response.json();
		} catch (error) {
			console.error("Error loading reminders:", error);
		}
	}

	renderReminders() {
		const list = document.getElementById("remindersList");
		if (!list) return;

		if (this.reminders.length === 0) {
			list.innerHTML =
				'<p class="empty-state">No reminders yet. Create one to get started!</p>';
			return;
		}

		// Sort by reminder time
		const sorted = [...this.reminders].sort((a, b) => {
			return new Date(a.reminderTime) - new Date(b.reminderTime);
		});

		list.innerHTML = sorted
			.map(
				(reminder) => `
      <div class="card" style="padding: 16px; margin-bottom: 12px; ${reminder.completed ? "opacity: 0.6;" : ""}">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <input type="checkbox" ${reminder.completed ? "checked" : ""} style="cursor: pointer;">
              <h4 style="margin: 0; font-size: 15px; font-weight: 600; ${reminder.completed ? "text-decoration: line-through;" : ""}">${reminder.title}</h4>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">${reminder.description || "No description"}</p>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <i class="fas fa-clock"></i> ${new Date(reminder.reminderTime).toLocaleString()}
            </p>
          </div>
          <div style="display: flex; gap: 8px; margin-left: 12px;">
            <button class="btn btn-secondary" data-reminder-id="${reminder.id}" style="padding: 6px 12px; font-size: 12px;">Edit</button>
            <button class="btn btn-secondary" data-reminder-id="${reminder.id}" style="padding: 6px 12px; font-size: 12px;">Delete</button>
          </div>
        </div>
      </div>
    `,
			)
			.join("");
	}

	openReminderModal() {
		const title = prompt("Reminder title:");
		if (!title) return;

		const description = prompt("Description:");
		const reminderTime = prompt("Time (YYYY-MM-DD HH:MM):");

		if (reminderTime) {
			this.createReminder(title, description, reminderTime);
		}
	}

	async createReminder(title, description, reminderTime) {
		try {
			const response = await fetch(
				`/api/reminders/${this.app.currentUser.id}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title,
						description,
						reminderTime,
					}),
				},
			);

			if (response.ok) {
				await this.loadReminders();
				this.renderReminders();
			}
		} catch (error) {
			console.error("Error creating reminder:", error);
		}
	}

	checkReminders() {
		const now = new Date();
		this.reminders.forEach((reminder) => {
			if (!reminder.completed) {
				const reminderTime = new Date(reminder.reminderTime);
				if (reminderTime <= now) {
					this.showNotification(reminder);
				}
			}
		});
	}

	showNotification(reminder) {
		if ("Notification" in window && Notification.permission === "granted") {
			new Notification("Reminder", {
				body: reminder.title,
				icon: "✨",
			});
		}
	}
}

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
	Notification.requestPermission();
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.reminders = new RemindersModule(window.app);
	}
});
