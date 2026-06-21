/**
 * Calendar Module
 * Handles calendar view and event management
 */

class CalendarModule {
  constructor(app) {
    this.app = app;
    this.currentDate = new Date();
    this.init();
  }

  init() {
    this.renderCalendar();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listeners for calendar navigation if needed
  }

  renderCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px 0;">${monthName}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 20px;">
    `;

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      html += `<div style="text-align: center; font-weight: 600; padding: 8px; color: #6b7280; font-size: 12px;">${day}</div>`;
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                      month === new Date().getMonth() && 
                      year === new Date().getFullYear();
      
      html += `
        <div style="
          padding: 12px;
          background: ${isToday ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f9fafb'};
          color: ${isToday ? 'white' : '#111827'};
          border-radius: 6px;
          text-align: center;
          font-weight: ${isToday ? '600' : '500'};
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ${day}
        </div>
      `;
    }

    html += `
        </div>
        
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <button class="btn btn-secondary">← Previous</button>
          <button class="btn btn-secondary">Today</button>
          <button class="btn btn-secondary">Next →</button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

// Initialize when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    window.calendar = new CalendarModule(window.app);
  }
});
