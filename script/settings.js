/**
 * Settings Module
 * Handles user preferences and account settings
 */

class SettingsModule {
	constructor(app) {
		this.app = app;
		this.init();
	}

	init() {
		this.renderSettings();
		this.setupEventListeners();
	}

	renderSettings() {
		const container = document.getElementById("settingsContainer");
		if (!container) return;

		const user = this.app.currentUser;

		container.innerHTML = `
      <div style="max-width: 600px;">
        <!-- Profile Settings -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Profile Settings</h3>
          
          <div style="display: grid; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">Username</label>
              <input type="text" id="usernameInput" value="${user.username}" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            </div>

            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">Email</label>
              <input type="email" id="emailInput" value="${user.email}" disabled style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: #f9fafb; color: #6b7280;">
            </div>

            <div>
              <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px;">Bio</label>
              <textarea id="bioInput" placeholder="Tell us about yourself" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical;" rows="3"></textarea>
            </div>

            <button class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Theme Settings</h3>
          
          <div style="display: grid; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="radio" name="theme" value="light" checked>
              <span>Light Mode</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="radio" name="theme" value="dark">
              <span>Dark Mode</span>
            </label>
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="radio" name="theme" value="purple-galaxy">
              <span>Purple Galaxy</span>
            </label>
          </div>
        </div>

        <!-- Data Settings -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Data Management</h3>
          
          <div style="display: grid; gap: 12px;">
            <button class="btn btn-secondary" id="exportDataBtn">
              <i class="fas fa-download"></i> Export Data as JSON
            </button>
            <button class="btn btn-secondary" id="importDataBtn">
              <i class="fas fa-upload"></i> Import Data from JSON
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card" style="border-color: #fee2e2; background: #fef2f2;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #991b1b;">Danger Zone</h3>
          
          <button class="btn" style="background: #ef4444; color: white;" id="logoutAllBtn">
            <i class="fas fa-sign-out-alt"></i> Logout from All Devices
          </button>
        </div>
      </div>
    `;
	}

	setupEventListeners() {
		const saveProfileBtn = document.getElementById("saveProfileBtn");
		if (saveProfileBtn) {
			saveProfileBtn.addEventListener("click", () => this.saveProfile());
		}

		const themeRadios = document.querySelectorAll('input[name="theme"]');
		themeRadios.forEach((radio) => {
			radio.addEventListener("change", (e) => this.changeTheme(e.target.value));
		});

		const exportBtn = document.getElementById("exportDataBtn");
		if (exportBtn) {
			exportBtn.addEventListener("click", () => this.exportData());
		}

		const logoutAllBtn = document.getElementById("logoutAllBtn");
		if (logoutAllBtn) {
			logoutAllBtn.addEventListener("click", () => this.app.logout());
		}
	}

	async saveProfile() {
		const username = document.getElementById("usernameInput").value;
		const bio = document.getElementById("bioInput").value;

		try {
			const response = await fetch(
				`/api/auth/profile/${this.app.currentUser.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username, bio }),
				},
			);

			if (response.ok) {
				alert("Profile updated successfully!");
				location.reload();
			}
		} catch (error) {
			console.error("Error saving profile:", error);
			alert("Failed to save profile");
		}
	}

	changeTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}

	async exportData() {
		try {
			const userId = this.app.currentUser.id;

			const tasks = await fetch(`/api/tasks/${userId}`).then((r) => r.json());
			const projects = await fetch(`/api/projects/${userId}`).then((r) =>
				r.json(),
			);
			const notes = await fetch(`/api/notes/${userId}`).then((r) => r.json());
			const goals = await fetch(`/api/goals/${userId}`).then((r) => r.json());
			const reminders = await fetch(`/api/reminders/${userId}`).then((r) =>
				r.json(),
			);
			const bookmarks = await fetch(`/api/bookmarks/${userId}`).then((r) =>
				r.json(),
			);

			const data = {
				user: this.app.currentUser,
				exportDate: new Date().toISOString(),
				tasks,
				projects,
				notes,
				goals,
				reminders,
				bookmarks,
			};

			const json = JSON.stringify(data, null, 2);
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `pwa-backup-${new Date().getTime()}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting data:", error);
			alert("Failed to export data");
		}
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.settings = new SettingsModule(window.app);
	}
});
