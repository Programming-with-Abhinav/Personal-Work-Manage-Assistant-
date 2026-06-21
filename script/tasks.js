/**
 * Tasks Module
 * Handles task creation, editing, deletion, and management
 */

class TasksModule {
  constructor(app) {
    this.app = app;
    this.tasks = [];
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadTasks();
    this.renderTasks();
  }

  setupEventListeners() {
    const newTaskBtn = document.getElementById('newTaskBtn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => this.openTaskModal());
    }

    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async loadTasks() {
    try {
      const response = await fetch(`/api/tasks/${this.app.currentUser.id}`);
      this.tasks = await response.json();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  renderTasks() {
    const listView = document.getElementById('tasksList');
    if (!listView) return;

    if (this.tasks.length === 0) {
      listView.innerHTML = '<p class="empty-state">No tasks yet. Create one to get started!</p>';
      return;
    }

    listView.innerHTML = this.tasks.map(task => `
      <div class="task-card card" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">${task.title}</h4>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">${task.description || 'No description'}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="badge" style="background: ${this.getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                ${task.priority}
              </span>
              <span style="font-size: 12px; color: #6b7280;">Due: ${task.dueDate || 'No date'}</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-left: 12px;">
            <button class="btn btn-secondary" data-task-id="${task.id}" onclick="event.preventDefault(); event.stopPropagation();">Edit</button>
            <button class="btn btn-secondary" data-task-id="${task.id}" onclick="event.preventDefault(); event.stopPropagation();">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  getPriorityColor(priority) {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || '#6b7280';
  }

  openTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;

    try {
      const response = await fetch(`/api/tasks/${this.app.currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority
        })
      });

      if (response.ok) {
        await this.loadTasks();
        this.renderTasks();
        e.target.reset();

        const modal = document.getElementById('taskModal');
        if (modal) {
          modal.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }
}

// Initialize when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.tasks = new TasksModule(window.app);
  }
});
