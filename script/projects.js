/**
 * Projects Module
 * Handles project management with Kanban-style columns
 */

class ProjectsModule {
	constructor(app) {
		this.app = app;
		this.projects = [];
		this.init();
	}

	async init() {
		this.setupEventListeners();
		await this.loadProjects();
		this.renderProjects();
	}

	setupEventListeners() {
		const newProjectBtn = document.getElementById("newProjectBtn");
		if (newProjectBtn) {
			newProjectBtn.addEventListener("click", () => this.openProjectModal());
		}
	}

	async loadProjects() {
		try {
			const response = await fetch(`/api/projects/${this.app.currentUser.id}`);
			this.projects = await response.json();
		} catch (error) {
			console.error("Error loading projects:", error);
		}
	}

	renderProjects() {
		const container = document.getElementById("projectsContainer");
		if (!container) return;

		if (this.projects.length === 0) {
			container.innerHTML =
				'<p class="empty-state">No projects yet. Create one to get started!</p>';
			return;
		}

		container.innerHTML = this.projects
			.map(
				(project) => `
      <div class="project-item card" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${project.title}</h3>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">${project.description || "No description"}</p>
            
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 12px; font-weight: 500;">Progress</span>
                <span style="font-size: 12px; color: #6b7280;">${project.progress}%</span>
              </div>
              <div style="background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 100%; width: ${project.progress}%;"></div>
              </div>
            </div>

            ${project.deadline ? `<p style="font-size: 12px; color: #6b7280;">Deadline: ${project.deadline}</p>` : ""}
            
            ${
							project.tags && project.tags.length > 0
								? `
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${project.tags
									.map(
										(tag) => `
                  <span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 11px;">${tag}</span>
                `,
									)
									.join("")}
              </div>
            `
								: ""
						}
          </div>
          <div style="display: flex; gap: 8px; margin-left: 12px;">
            <button class="btn btn-secondary">Edit</button>
            <button class="btn btn-secondary">Delete</button>
          </div>
        </div>
      </div>
    `,
			)
			.join("");
	}

	openProjectModal() {
		// TODO: Implement project creation modal
		console.log("Opening project modal");
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.projects = new ProjectsModule(window.app);
	}
});
