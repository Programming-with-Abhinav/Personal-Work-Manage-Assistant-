/**
 * Analytics Module
 * Displays productivity metrics and statistics
 */

class AnalyticsModule {
	constructor(app) {
		this.app = app;
		this.init();
	}

	async init() {
		this.renderAnalytics();
	}

	async renderAnalytics() {
		const container = document.getElementById("analyticsContainer");
		if (!container) return;

		try {
			const tasksResponse = await fetch(
				`/api/tasks/${this.app.currentUser.id}`,
			);
			const tasks = await tasksResponse.json();

			const goalsResponse = await fetch(
				`/api/goals/${this.app.currentUser.id}`,
			);
			const goals = await goalsResponse.json();

			const completedTasks = tasks.filter(
				(t) => t.status === "completed",
			).length;
			const completedGoals = goals.filter((g) => g.completed).length;

			container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          <div class="card">
            <div style="text-align: center;">
              <p style="color: #6b7280; margin: 0 0 8px 0;">Tasks Completed</p>
              <h2 style="font-size: 36px; font-weight: 700; color: #6366f1; margin: 0;">${completedTasks}</h2>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">of ${tasks.length} total tasks</p>
            </div>
          </div>

          <div class="card">
            <div style="text-align: center;">
              <p style="color: #6b7280; margin: 0 0 8px 0;">Goals Completed</p>
              <h2 style="font-size: 36px; font-weight: 700; color: #10b981; margin: 0;">${completedGoals}</h2>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">of ${goals.length} total goals</p>
            </div>
          </div>

          <div class="card">
            <div style="text-align: center;">
              <p style="color: #6b7280; margin: 0 0 8px 0;">Productivity Rate</p>
              <h2 style="font-size: 36px; font-weight: 700; color: #f59e0b; margin: 0;">
                ${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </h2>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">Task completion rate</p>
            </div>
          </div>

          <div class="card">
            <div style="text-align: center;">
              <p style="color: #6b7280; margin: 0 0 8px 0;">Active Tasks</p>
              <h2 style="font-size: 36px; font-weight: 700; color: #8b5cf6; margin: 0;">
                ${tasks.filter((t) => t.status === "in-progress").length}
              </h2>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 12px;">Currently in progress</p>
            </div>
          </div>
        </div>
      `;
		} catch (error) {
			console.error("Error loading analytics:", error);
			container.innerHTML =
				'<p class="empty-state">Failed to load analytics</p>';
		}
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.analytics = new AnalyticsModule(window.app);
	}
});
