/**
 * Goals Module
 * Handles goal tracking with progress management
 */

class GoalsModule {
  constructor(app) {
    this.app = app;
    this.goals = [];
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadGoals();
    this.renderGoals();
  }

  setupEventListeners() {
    const newGoalBtn = document.getElementById('newGoalBtn');
    if (newGoalBtn) {
      newGoalBtn.addEventListener('click', () => this.openGoalModal());
    }
  }

  async loadGoals() {
    try {
      const response = await fetch(`/api/goals/${this.app.currentUser.id}`);
      this.goals = await response.json();
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }

  renderGoals() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;

    if (this.goals.length === 0) {
      container.innerHTML = '<p class="empty-state">No goals yet. Create one to get started!</p>';
      return;
    }

    // Group goals by category
    const groupedGoals = {};
    this.goals.forEach(goal => {
      const category = goal.category || 'daily';
      if (!groupedGoals[category]) groupedGoals[category] = [];
      groupedGoals[category].push(goal);
    });

    container.innerHTML = Object.entries(groupedGoals).map(([category, goals]) => `
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; text-transform: capitalize;">${category} Goals</h3>
        <div style="display: grid; gap: 12px;">
          ${goals.map(goal => `
            <div class="card" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                  <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">${goal.title}</h4>
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">${goal.description || 'No description'}</p>
                </div>
                <span style="font-size: 12px; font-weight: 600; color: #6366f1;">${goal.progress}%</span>
              </div>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
                <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${goal.progress}%;"></div>
              </div>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn btn-secondary" data-goal-id="${goal.id}">Edit</button>
                <button class="btn btn-secondary" data-goal-id="${goal.id}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  openGoalModal() {
    const title = prompt('Goal title:');
    if (!title) return;

    const description = prompt('Goal description:');
    const category = prompt('Category (daily/weekly/long-term):', 'daily');

    this.createGoal(title, description, category);
  }

  async createGoal(title, description, category) {
    try {
      const response = await fetch(`/api/goals/${this.app.currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          progress: 0
        })
      });

      if (response.ok) {
        await this.loadGoals();
        this.renderGoals();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  }
}

// Initialize when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.goals = new GoalsModule(window.app);
  }
});
