/**
 * Dashboard Module
 * Handles dashboard-specific functionality and widgets
 */

class DashboardModule {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle quick actions
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch (action) {
      case 'new-task':
        this.app.navigateTo('tasks');
        break;
      case 'new-note':
        this.app.navigateTo('notes');
        break;
      case 'new-project':
        this.app.navigateTo('projects');
        break;
      case 'start-pomodoro':
        this.app.navigateTo('pomodoro');
        break;
    }
  }

  updateWidgets() {
    // Update all dashboard widgets
    this.app.loadUserData();
  }
}

// Initialize when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.dashboard = new DashboardModule(window.app);
  }
});
