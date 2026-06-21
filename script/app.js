/**
 * Personal Work Assistant - Main App
 * Handles dashboard, navigation, authentication, and module management
 */

class DashboardApp {
  constructor() {
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      // Check authentication
      this.checkAuthentication();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load user data
      await this.loadUserData();
      
      // Render dashboard
      this.renderDashboard();
      
      this.isInitialized = true;
      console.log('✨ Dashboard initialized');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.logout();
    }
  }

  checkAuthentication() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      window.location.href = '/login.html';
      return;
    }
    this.currentUser = JSON.parse(userData);
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navigateTo(page);
      });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn) {
      userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
          userDropdown.classList.remove('show');
        }
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // Search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => this.handleSearch(e));
    }

    // Quick actions
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  navigateTo(page) {
    if (page === this.currentPage) return;

    // Update nav items
    document.querySelectorAll('[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });

    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
      pageElement.classList.add('active');
    }

    this.currentPage = page;

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
  }

  async loadUserData() {
    try {
      // Update user display
      this.updateUserDisplay();

      // Load tasks
      await this.loadTasks();

      // Load projects
      await this.loadProjects();

      // Load notes
      await this.loadNotes();

      // Load goals
      await this.loadGoals();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  updateUserDisplay() {
    const firstName = this.currentUser.username || 'User';
    const email = this.currentUser.email || 'user@example.com';
    
    document.getElementById('userName').textContent = firstName;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('welcomeName').textContent = firstName.split(' ')[0];
    
    // Generate initials
    const initials = firstName.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    document.getElementById('userInitials').textContent = initials || 'U';
  }

  async loadTasks() {
    try {
      const response = await fetch(`/api/tasks/${this.currentUser.id}`);
      const tasks = await response.json();
      this.renderTasksWidget(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async loadProjects() {
    try {
      const response = await fetch(`/api/projects/${this.currentUser.id}`);
      const projects = await response.json();
      this.renderProjectsWidget(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async loadNotes() {
    try {
      const response = await fetch(`/api/notes/${this.currentUser.id}`);
      const notes = await response.json();
      console.log('Notes loaded:', notes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }

  async loadGoals() {
    try {
      const response = await fetch(`/api/goals/${this.currentUser.id}`);
      const goals = await response.json();
      this.renderGoalsWidget(goals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }

  renderDashboard() {
    // Basic dashboard rendering (widgets will be populated by load methods)
    this.updateProductivityScore();
  }

  renderTasksWidget(tasks) {
    const widget = document.getElementById('todayTasksWidget');
    if (!widget) return;

    if (tasks.length === 0) {
      widget.innerHTML = '<p class="empty-state">No tasks for today</p>';
      return;
    }

    const todayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toDateString();
      const today = new Date().toDateString();
      return taskDate === today;
    });

    if (todayTasks.length === 0) {
      widget.innerHTML = '<p class="empty-state">No tasks for today</p>';
      return;
    }

    widget.innerHTML = todayTasks.map(task => `
      <div class="task-item" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} style="cursor: pointer;">
          <span>${task.title}</span>
        </div>
        <span style="font-size: 12px; color: #6b7280;">Priority: ${task.priority}</span>
      </div>
    `).join('');
  }

  renderProjectsWidget(projects) {
    const widget = document.getElementById('activeProjectsWidget');
    if (!widget) return;

    if (projects.length === 0) {
      widget.innerHTML = '<p class="empty-state">No active projects</p>';
      return;
    }

    widget.innerHTML = projects.slice(0, 3).map(project => `
      <div class="project-card" style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h4 style="margin-bottom: 8px; font-size: 14px; font-weight: 600;">${project.title}</h4>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${project.description || 'No description'}</p>
        <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 100%; width: ${project.progress}%;"></div>
        </div>
        <p style="font-size: 11px; color: #6b7280; margin-top: 6px;">Progress: ${project.progress}%</p>
      </div>
    `).join('');
  }

  renderGoalsWidget(goals) {
    const widget = document.getElementById('goalsWidget');
    if (!widget) return;

    if (goals.length === 0) {
      widget.innerHTML = '<p class="empty-state">No goals yet</p>';
      return;
    }

    widget.innerHTML = goals.slice(0, 3).map(goal => `
      <div class="goal-item" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 500; font-size: 13px;">${goal.title}</span>
          <span style="font-size: 12px; color: #6b7280;">${goal.progress}%</span>
        </div>
        <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
          <div style="background: #10b981; height: 100%; width: ${goal.progress}%;"></div>
        </div>
      </div>
    `).join('');
  }

  updateProductivityScore() {
    const score = Math.min(85, Math.random() * 100);
    document.getElementById('productivityScore').textContent = Math.round(score);
  }

  handleQuickAction(action) {
    switch (action) {
      case 'new-task':
        this.navigateTo('tasks');
        break;
      case 'new-note':
        this.navigateTo('notes');
        break;
      case 'new-project':
        this.navigateTo('projects');
        break;
      case 'start-pomodoro':
        this.navigateTo('pomodoro');
        break;
    }
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();
    console.log('Searching for:', query);
    // TODO: Implement global search across all modules
  }

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('dashboardPreferences');
    window.location.href = '/login.html';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DashboardApp();
});

// Handle responsive sidebar
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth > 768) {
    sidebar.classList.remove('open');
  }
});
