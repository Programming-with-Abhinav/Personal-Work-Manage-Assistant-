/**
 * Amica - Premium Personal Work Assistant Client Controller
 * Single Page Application Router, State Manager, and AI Command Processor
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. STATE & INITIALIZATION
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser) {
    window.location.replace("login.html");
    return;
  }

  // Application State
  window.app = {
    user: currentUser,
    activeTab: "dashboard",
    contextMode: "professional", // "professional" or "personal"
    tasks: [],
    meetings: [],
    payments: [],
    notes: [],
    bookmarks: [],
    map: null,
    mapMarker: null,
    weatherForecasts: {} // Cache
  };

  // DOM Elements
  const elements = {
    userName: document.getElementById("userName"),
    userEmail: document.getElementById("userEmail"),
    welcomeName: document.getElementById("welcomeName"),
    userAvatarImg: document.getElementById("userAvatarImg"),
    profilePhotoInput: document.getElementById("profilePhotoInput"),
    workspaceToggleBtn: document.getElementById("workspaceToggleBtn"),
    workspaceLabel: document.getElementById("workspaceLabel"),
    logoutBtn: document.getElementById("logoutBtn"),
    currentTabLabel: document.getElementById("currentTabLabel"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIcon: document.getElementById("themeIcon"),
    globalSearchInput: document.getElementById("globalSearchInput"),
    
    // AI Assistant Drawer
    aiDrawerToggleBtn: document.getElementById("aiDrawerToggleBtn"),
    aiAssistantDrawer: document.getElementById("aiAssistantDrawer"),
    aiDrawerCloseBtn: document.getElementById("aiDrawerCloseBtn"),
    aiMessagesLog: document.getElementById("aiMessagesLog"),
    aiCommandForm: document.getElementById("aiCommandForm"),
    aiCommandInput: document.getElementById("aiCommandInput"),

    // Dashboard page elements
    productivityRing: document.getElementById("productivityRing"),
    productivityScore: document.getElementById("productivityScore"),
    todayWeatherWidget: document.getElementById("todayWeatherWidget"),
    dashInflow: document.getElementById("dashInflow"),
    dashOutflow: document.getElementById("dashOutflow"),
    dashNetBalance: document.getElementById("dashNetBalance"),
    dashUpcomingMeetings: document.getElementById("dashUpcomingMeetings"),
    dashTodayTasks: document.getElementById("dashTodayTasks"),

    // Tasks Page elements
    openTaskModalBtn: document.getElementById("openTaskModalBtn"),
    taskModal: document.getElementById("taskModal"),
    closeTaskModalBtn: document.getElementById("closeTaskModalBtn"),
    cancelTaskBtn: document.getElementById("cancelTaskBtn"),
    taskForm: document.getElementById("taskForm"),
    tasksListContainer: document.getElementById("tasksListContainer"),
    taskCountLabel: document.getElementById("taskCountLabel"),

    // Meetings Page elements
    meetingForm: document.getElementById("meetingForm"),
    meetingDateTime: document.getElementById("meetingDateTime"),
    meetingWeatherAlert: document.getElementById("meetingWeatherAlert"),
    forecastDayLabel: document.getElementById("forecastDayLabel"),
    forecastCondLabel: document.getElementById("forecastCondLabel"),
    forecastTipLabel: document.getElementById("forecastTipLabel"),
    meetingLocation: document.getElementById("meetingLocation"),
    meetingMapContainer: document.getElementById("meetingMapContainer"),
    upcomingMeetingsList: document.getElementById("upcomingMeetingsList"),
    activityHistoryList: document.getElementById("activityHistoryList"),

    // Payments Page elements
    paymentForm: document.getElementById("paymentForm"),
    totalReceivable: document.getElementById("totalReceivable"),
    receivableCount: document.getElementById("receivableCount"),
    totalPayable: document.getElementById("totalPayable"),
    payableCount: document.getElementById("payableCount"),
    receivablesLedger: document.getElementById("receivablesLedger"),
    payablesLedger: document.getElementById("payablesLedger"),

    // Notes elements
    openNoteFormBtn: document.getElementById("openNoteFormBtn"),
    stickyNoteFormWrapper: document.getElementById("stickyNoteFormWrapper"),
    addNoteForm: document.getElementById("addNoteForm"),
    closeNoteFormBtn: document.getElementById("closeNoteFormBtn"),
    notesStack: document.getElementById("notesStack"),

    // Links elements
    openLinkModalBtn: document.getElementById("openLinkModalBtn"),
    linkFormWrapper: document.getElementById("linkFormWrapper"),
    addLinkForm: document.getElementById("addLinkForm"),
    closeLinkFormBtn: document.getElementById("closeLinkFormBtn"),
    quickGrid: document.getElementById("quickGrid"),

    // Sidebar elements
    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    sidebarCloseBtn: document.getElementById("sidebarCloseBtn")
  };

  // 2. INITIALIZE CLIENT VIEW
  function initApp() {
    // Populate user profile info
    const displayName = window.app.user.name || window.app.user.username || "User";
    elements.userName.textContent = displayName;
    elements.userEmail.textContent = window.app.user.email;
    elements.welcomeName.textContent = displayName.split(" ")[0];

    // Load avatar if present
    applyAvatar();

    // Load theme setting
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    // Initial Workspace Context Display
    updateWorkspaceUI();

    // Load Workspace Data
    refreshAllData();

    // Set up Event Handlers
    setupSidebarNavigation();
    setupCoreEventListeners();
    setupTasksFeature();
    setupMeetingsFeature();
    setupPaymentsFeature();
    setupNotesFeature();
    setupBookmarksFeature();
    setupAIProcessor();
  }

  // Sync profile avatar
  function applyAvatar() {
    const avatarSrc = window.app.user.avatar || "assets/ID-photo.png";
    if (elements.userAvatarImg) {
      elements.userAvatarImg.src = avatarSrc;
      elements.userAvatarImg.onerror = () => {
        elements.userAvatarImg.src = "assets/ID-photo.png";
      };
    }
  }

  // Fetch all resources from backend server API
  async function refreshAllData() {
    const userId = window.app.user.id;
    try {
      const [tasksRes, meetingsRes, paymentsRes, notesRes, bookmarksRes] = await Promise.all([
        fetch(`/api/tasks/${userId}`),
        fetch(`/api/meetings/${userId}`),
        fetch(`/api/payments/${userId}`),
        fetch(`/api/notes/${userId}`),
        fetch(`/api/bookmarks/${userId}`)
      ]);

      window.app.tasks = await tasksRes.json();
      window.app.meetings = await meetingsRes.json();
      window.app.payments = await paymentsRes.json();
      window.app.notes = await notesRes.json();
      window.app.bookmarks = await bookmarksRes.json();

      // Render Active Tab
      renderActiveTab();
      // Render Today's Weather Widget (Static/Dynamic Simulator)
      renderTodayWeather();
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    }
  }

  // 3. SPA ROUTING & SIDEBAR
  function setupSidebarNavigation() {
    // Nav Items Tab switches
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        
        // Update nav items styling
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        // Switch Tab views
        switchTab(tab);
      });
    });

    // Sidebar drawer toggles (Mobile responsiveness)
    elements.sidebarToggle?.addEventListener("click", () => {
      elements.sidebar.classList.add("open");
    });

    elements.sidebarCloseBtn?.addEventListener("click", () => {
      elements.sidebar.classList.remove("open");
    });
  }

  function switchTab(tab) {
    window.app.activeTab = tab;
    elements.currentTabLabel.textContent = tab.charAt(0).toUpperCase() + tab.slice(1) + " Workspace";

    // Switch Page elements visibility
    document.querySelectorAll(".app-page").forEach(page => {
      page.classList.remove("active");
    });

    const targetPage = document.getElementById(`${tab}Page`);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    // Special Tab hooks
    if (tab === "meetings") {
      // Lazy load map if needed
      setTimeout(initMeetingMap, 100);
    }

    renderActiveTab();
    
    // Close sidebar on mobile
    elements.sidebar.classList.remove("open");
  }

  function renderActiveTab() {
    const tab = window.app.activeTab;
    if (tab === "dashboard") renderDashboardView();
    else if (tab === "tasks") renderTasksView();
    else if (tab === "meetings") renderMeetingsView();
    else if (tab === "payments") renderPaymentsView();
    else if (tab === "notes") renderNotesView();
    else if (tab === "links") renderBookmarksView();
  }

  // 4. WORKSPACE CONTEXT SWITCHER (Professional vs Personal)
  function updateWorkspaceUI() {
    const isProf = window.app.contextMode === "professional";
    elements.workspaceToggleBtn.className = `workspace-toggle ${isProf ? "professional" : "personal"}`;
    elements.workspaceLabel.textContent = isProf ? "Professional Mode" : "Personal Mode";
  }

  elements.workspaceToggleBtn?.addEventListener("click", () => {
    window.app.contextMode = window.app.contextMode === "professional" ? "personal" : "professional";
    updateWorkspaceUI();
    
    // Trigger notification message in AI Chat to guide the user
    appendChatMessage("assistant", `Switched workspace context to **${window.app.contextMode}**. Tasks and meetings are now filtered for this workspace.`);
    
    // Refresh current tab display
    renderActiveTab();
  });

  // 5. CORE GLOBAL CONTROLS (Theme, Search, Profile Photo)
  function setupCoreEventListeners() {
    // Theme toggle
    elements.themeToggleBtn?.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      updateThemeIcon(nextTheme);
    });

    // Profile photo upload
    elements.profilePhotoInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const avatarData = reader.result;
        try {
          // Save avatar directly to server profile
          const userId = window.app.user.id;
          const res = await fetch(`/api/auth/profile/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar: avatarData })
          });
          const data = await res.json();
          if (res.ok) {
            window.app.user.avatar = data.user.profile.avatar;
            localStorage.setItem("currentUser", JSON.stringify(window.app.user));
            applyAvatar();
            appendChatMessage("assistant", "I've successfully updated your workspace profile picture!");
          }
        } catch (err) {
          alert("Error uploading avatar.");
        }
      };
      reader.readAsDataURL(file);
    });

    // Global Search filter
    elements.globalSearchInput?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query === "") {
        renderActiveTab();
        return;
      }
      
      // Filter dynamically based on search query
      const tab = window.app.activeTab;
      if (tab === "tasks") {
        const filtered = window.app.tasks.filter(t => t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query)));
        renderTasksList(filtered);
      } else if (tab === "meetings") {
        const filtered = window.app.meetings.filter(m => m.title.toLowerCase().includes(query) || (m.agenda && m.agenda.toLowerCase().includes(query)) || (m.location && m.location.toLowerCase().includes(query)));
        renderMeetingsList(filtered);
      } else if (tab === "payments") {
        const filtered = window.app.payments.filter(p => p.party.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)));
        renderPaymentsLedger(filtered);
      } else if (tab === "notes") {
        const filtered = window.app.notes.filter(n => n.title.toLowerCase().includes(query) || (n.content && n.content.toLowerCase().includes(query)));
        renderNotesGrid(filtered);
      }
    });

    // Logout
    elements.logoutBtn?.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.replace("login.html");
    });
  }

  function updateThemeIcon(theme) {
    if (elements.themeIcon) {
      elements.themeIcon.className = theme === "dark" ? "fa-regular fa-moon" : "fa-regular fa-sun";
    }
  }

  // 6. DASHBOARD TAB RENDERING
  function renderDashboardView() {
    const context = window.app.contextMode;
    
    // Filter tasks & meetings by professional/personal context
    const filteredTasks = window.app.tasks.filter(t => t.category === context);
    const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
    const totalTasks = filteredTasks.length;

    // Calculate Productivity Completion Score
    let score = 100;
    if (totalTasks > 0) {
      score = Math.round((completedTasks / totalTasks) * 100);
    }
    elements.productivityScore.textContent = score;
    
    // Update SVG Progress ring
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    elements.productivityRing.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (score / 100) * circumference;
    elements.productivityRing.style.strokeDashoffset = offset;

    // Cash flow tally calculations
    const pendingPayments = window.app.payments.filter(p => p.status === "pending");
    const inflow = pendingPayments.filter(p => p.type === "receivable").reduce((sum, p) => sum + p.amount, 0);
    const outflow = pendingPayments.filter(p => p.type === "payable").reduce((sum, p) => sum + p.amount, 0);
    const net = inflow - outflow;

    elements.dashInflow.textContent = `$${inflow.toFixed(2)}`;
    elements.dashOutflow.textContent = `$${outflow.toFixed(2)}`;
    elements.dashNetBalance.textContent = `${net < 0 ? '-' : ''}$${Math.abs(net).toFixed(2)}`;
    elements.dashNetBalance.className = `fin-value ${net >= 0 ? 'positive' : 'negative'}`;

    // Render Today's Tasks in Dashboard (Limit 4)
    const todayStr = new Date().toDateString();
    const todayTasks = filteredTasks.filter(t => t.status === "todo" && t.dueDate && new Date(t.dueDate).toDateString() === todayStr).slice(0, 4);
    
    if (todayTasks.length === 0) {
      elements.dashTodayTasks.innerHTML = '<p class="empty-state">No pending tasks for today</p>';
    } else {
      elements.dashTodayTasks.innerHTML = todayTasks.map(t => `
        <div class="widget-item-simple">
          <span>${escapeHTML(t.title)}</span>
          <small class="badge-priority ${t.priority}">${t.priority}</small>
        </div>
      `).join("");
    }

    // Render Upcoming Meetings in Dashboard (Limit 3)
    const nowTime = new Date();
    const upcomingMeetings = window.app.meetings
      .filter(m => m.category === context && new Date(m.dateTime) >= nowTime)
      .sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime))
      .slice(0, 3);

    if (upcomingMeetings.length === 0) {
      elements.dashUpcomingMeetings.innerHTML = '<p class="empty-state">No upcoming meetings scheduled</p>';
    } else {
      elements.dashUpcomingMeetings.innerHTML = upcomingMeetings.map(m => {
        const meetTime = new Date(m.dateTime);
        const formatTime = meetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + meetTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return `
          <div class="widget-item-simple">
            <span>${escapeHTML(m.title)}</span>
            <small>${formatTime}</small>
          </div>
        `;
      }).join("");
    }
  }

  // Simulated Weather Forecasts
  function renderTodayWeather() {
    const today = new Date();
    const forecast = getWeatherForDate(today);
    const weatherIcon = forecast.condition === "Rainy" ? "fa-cloud-showers-heavy" : forecast.condition === "Stormy" ? "fa-cloud-bolt" : forecast.condition === "Cloudy" ? "fa-cloud" : "fa-sun";
    
    elements.todayWeatherWidget.innerHTML = `
      <div class="weather-primary">
        <i class="fa-solid ${weatherIcon} weather-icon-lg"></i>
        <div class="weather-temp">
          <strong>${forecast.temp}°C</strong>
          <span>${forecast.condition}</span>
        </div>
      </div>
      <div class="weather-meta">
        <span>Humidity: 65%</span>
        <span>Wind: 14 km/h</span>
      </div>
    `;
  }

  function getWeatherForDate(date) {
    const day = date.getDay(); // 0-6
    // Generate deterministic forecast based on day of week
    if (day === 1 || day === 3 || day === 5) {
      return { temp: 26, condition: "Sunny", tip: "Beautiful clear skies forecast. Perfect day for outdoor plans!" };
    } else if (day === 2 || day === 4) {
      return { temp: 17, condition: "Rainy", tip: "☔ Rain showers expected. Rescheduling outdoor meetings recommended." };
    } else if (day === 0) {
      return { temp: 15, condition: "Stormy", tip: "⚡ Severe thunderstorm warning! Outdoor meetings not advised; use Zoom." };
    } else {
      return { temp: 21, condition: "Cloudy", tip: "Overcast clouds. Milder temperatures, suitable for short meetings." };
    }
  }

  // 7. TASK MANAGER FEATURE
  function setupTasksFeature() {
    // Open create task modal
    elements.openTaskModalBtn?.addEventListener("click", () => {
      elements.taskForm.reset();
      // Auto fill category with current workspace context
      document.getElementById("taskCategory").value = window.app.contextMode;
      elements.taskModal.classList.remove("hidden");
    });

    // Close modals
    elements.closeTaskModalBtn?.addEventListener("click", () => elements.taskModal.classList.add("hidden"));
    elements.cancelTaskBtn?.addEventListener("click", () => elements.taskModal.classList.add("hidden"));

    // Add Task submit
    elements.taskForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("taskTitle").value.trim();
      const description = document.getElementById("taskDescription").value.trim();
      const dueDate = document.getElementById("taskDueDate").value;
      const priority = document.getElementById("taskPriority").value;
      const category = document.getElementById("taskCategory").value;

      try {
        const res = await fetch(`/api/tasks/${window.app.user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, dueDate, priority, category })
        });
        if (res.ok) {
          const newTask = await res.json();
          window.app.tasks.push(newTask);
          elements.taskModal.classList.add("hidden");
          renderTasksView();
          appendChatMessage("assistant", `I've successfully created the task: "**${title}**"!`);
        }
      } catch (err) {
        alert("Error adding task.");
      }
    });

    // Filter Buttons
    document.querySelectorAll("[data-task-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-task-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTasksView();
      });
    });
  }

  function renderTasksView() {
    const context = window.app.contextMode;
    const filter = document.querySelector("[data-task-filter].active")?.dataset.taskFilter || "all";
    
    let filtered = window.app.tasks.filter(t => t.category === context);

    if (filter === "pending") {
      filtered = filtered.filter(t => t.status === "todo");
    } else if (filter === "completed") {
      filtered = filtered.filter(t => t.status === "completed");
    }

    elements.taskCountLabel.textContent = filtered.length;
    renderTasksList(filtered);
  }

  function renderTasksList(taskList) {
    if (taskList.length === 0) {
      elements.tasksListContainer.innerHTML = '<p class="empty-state">No tasks to display in this list.</p>';
      return;
    }

    elements.tasksListContainer.innerHTML = taskList.map(task => {
      const isCompleted = task.status === "completed";
      const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "No due date";
      
      return `
        <div class="custom-card bookmark-card task-card ${isCompleted ? 'completed' : ''}">
          <div class="task-header">
            <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''} />
            <div class="task-details">
              <h4>${escapeHTML(task.title)}</h4>
              ${task.description ? `<p>${escapeHTML(task.description)}</p>` : ''}
              <div class="task-meta-row">
                <span class="badge-priority ${task.priority}">${task.priority}</span>
                <span class="task-due-date"><i class="fa-regular fa-clock"></i> Due: ${dueStr}</span>
                <span class="task-context-badge">${task.category}</span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-icon delete-btn" data-delete-task-id="${task.id}" title="Delete Task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind checkboxes and delete buttons
    elements.tasksListContainer.querySelectorAll(".task-checkbox").forEach(box => {
      box.addEventListener("change", async (e) => {
        const taskId = e.target.dataset.taskId;
        const checked = e.target.checked;
        const newStatus = checked ? "completed" : "todo";

        try {
          const res = await fetch(`/api/tasks/${window.app.user.id}/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            const index = window.app.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
              window.app.tasks[index].status = newStatus;
            }
            renderTasksView();
            appendChatMessage("assistant", `Marked task **${window.app.tasks[index].title}** as **${newStatus}**.`);
          }
        } catch (err) {
          alert("Error updating task status.");
        }
      });
    });

    elements.tasksListContainer.querySelectorAll("[data-delete-task-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const taskId = btn.dataset.deleteTaskId;
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
          const res = await fetch(`/api/tasks/${window.app.user.id}/${taskId}`, { method: "DELETE" });
          if (res.ok) {
            window.app.tasks = window.app.tasks.filter(t => t.id !== taskId);
            renderTasksView();
            appendChatMessage("assistant", "Task deleted successfully.");
          }
        } catch (err) {
          alert("Error deleting task.");
        }
      });
    });
  }

  // 8. MEETINGS PLANNER (WEATHER GUIDED + MAP PREVIEW)
  function setupMeetingsFeature() {
    // Show Weather forecast alert when date is selected
    elements.meetingDateTime?.addEventListener("change", (e) => {
      const selectedVal = e.target.value;
      if (!selectedVal) {
        elements.meetingWeatherAlert.classList.add("hidden");
        return;
      }

      const dateObj = new Date(selectedVal);
      const forecast = getWeatherForDate(dateObj);

      // Render weather warning alert
      elements.forecastDayLabel.textContent = dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      elements.forecastCondLabel.textContent = `${forecast.condition} (${forecast.temp}°C)`;
      elements.forecastTipLabel.textContent = forecast.tip;

      elements.meetingWeatherAlert.className = `weather-forecast-alert ${forecast.condition === "Rainy" || forecast.condition === "Stormy" ? "rainy-warning" : ""}`;
      elements.meetingWeatherAlert.classList.remove("hidden");
    });

    // Map trigger when typing location
    let mapTimeout = null;
    elements.meetingLocation?.addEventListener("input", (e) => {
      const locQuery = e.target.value.trim();
      clearTimeout(mapTimeout);
      
      if (locQuery.length < 3) {
        elements.meetingMapContainer.classList.add("hidden");
        return;
      }

      // Debounce geocode calls
      mapTimeout = setTimeout(() => {
        geocodeLocationAndCenterMap(locQuery);
      }, 1000);
    });

    // Schedule meeting Form submit
    elements.meetingForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("meetingTitle").value.trim();
      const dateTime = document.getElementById("meetingDateTime").value;
      const location = document.getElementById("meetingLocation").value.trim();
      const attendees = document.getElementById("meetingAttendees").value.trim();
      const category = document.getElementById("meetingCategory").value;
      const agenda = document.getElementById("meetingAgenda").value.trim();

      try {
        const res = await fetch(`/api/meetings/${window.app.user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, dateTime, location, attendees, category, agenda })
        });
        if (res.ok) {
          const newMeet = await res.json();
          window.app.meetings.push(newMeet);
          elements.meetingForm.reset();
          elements.meetingMapContainer.classList.add("hidden");
          elements.meetingWeatherAlert.classList.add("hidden");
          renderMeetingsView();
          appendChatMessage("assistant", `Meeting scheduled: "**${title}**" on ${new Date(dateTime).toLocaleString()}.`);
        }
      } catch (err) {
        alert("Error scheduling meeting.");
      }
    });
  }

  // Leaflet Map Initializer
  function initMeetingMap() {
    if (window.app.map) return; // Already loaded

    // Default center (New York)
    const lat = 40.7128;
    const lng = -74.0060;

    window.app.map = L.map('leafletMap').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.app.map);

    window.app.mapMarker = L.marker([lat, lng]).addTo(window.app.map);
  }

  // Nominatim OpenStreetMap Geocoding
  async function geocodeLocationAndCenterMap(query) {
    try {
      elements.meetingMapContainer.classList.remove("hidden");
      initMeetingMap(); // Force layout check

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        window.app.map.setView([lat, lon], 14);
        window.app.mapMarker.setLatLng([lat, lon]);
        
        // Leaflet resize trigger
        setTimeout(() => { window.app.map.invalidateSize(); }, 200);
      }
    } catch (err) {
      console.log("Geocoding failed/offline, displaying map.", err);
    }
  }

  function renderMeetingsView() {
    const context = window.app.contextMode;
    const now = new Date();

    // 1. Upcoming Meetings
    const upcoming = window.app.meetings
      .filter(m => m.category === context && new Date(m.dateTime) >= now)
      .sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime));

    renderUpcomingMeetingsList(upcoming);

    // 2. Activity History Log (Past Tasks & Past Meetings)
    const pastMeetings = window.app.meetings.filter(m => m.category === context && new Date(m.dateTime) < now);
    const completedTasks = window.app.tasks.filter(t => t.category === context && t.status === "completed");

    renderHistoryLogList(pastMeetings, completedTasks);
  }

  function renderUpcomingMeetingsList(meets) {
    if (meets.length === 0) {
      elements.upcomingMeetingsList.innerHTML = '<p class="empty-state">No upcoming meetings scheduled.</p>';
      return;
    }

    elements.upcomingMeetingsList.innerHTML = meets.map(m => {
      const d = new Date(m.dateTime);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      const weather = getWeatherForDate(d);
      const weatherIconClass = weather.condition === "Rainy" ? "fa-cloud-showers-heavy" : weather.condition === "Stormy" ? "fa-cloud-bolt" : "fa-cloud";

      return `
        <div class="custom-card meeting-card">
          <div class="meeting-card-title">${escapeHTML(m.title)}</div>
          <div class="meeting-time-row">
            <span><i class="fa-regular fa-calendar"></i> ${dateStr} at ${timeStr}</span>
            <span><i class="fa-solid ${weatherIconClass}"></i> Forecast: ${weather.condition} (${weather.temp}°C)</span>
          </div>
          ${m.location ? `
            <div class="meeting-time-row">
              <span><i class="fa-solid fa-location-dot"></i> Location: 
                <a class="meeting-map-link" onclick="window.app.showLocationOnMap('${escapeJS(m.location)}')">${escapeHTML(m.location)}</a>
              </span>
            </div>
          ` : ''}
          ${m.attendees ? `<div class="meeting-details-row"><strong>Attendees:</strong> ${escapeHTML(m.attendees)}</div>` : ''}
          ${m.agenda ? `<div class="meeting-details-row" style="margin-top:4px;"><strong>Agenda:</strong> ${escapeHTML(m.agenda)}</div>` : ''}
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
            <button class="btn-icon delete-btn" data-delete-meet-id="${m.id}" title="Cancel Meeting">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind delete buttons
    elements.upcomingMeetingsList.querySelectorAll("[data-delete-meet-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.deleteMeetId;
        if (!confirm("Are you sure you want to cancel this meeting?")) return;

        try {
          const res = await fetch(`/api/meetings/${window.app.user.id}/${id}`, { method: "DELETE" });
          if (res.ok) {
            window.app.meetings = window.app.meetings.filter(m => m.id !== id);
            renderMeetingsView();
            appendChatMessage("assistant", "Meeting cancelled successfully.");
          }
        } catch (err) {
          alert("Error cancelling meeting.");
        }
      });
    });
  }

  // Interactive show location map helper
  window.app.showLocationOnMap = (loc) => {
    document.getElementById("meetingLocation").value = loc;
    geocodeLocationAndCenterMap(loc);
  };

  function renderHistoryLogList(pastMeets, doneTasks) {
    // Combine logs into a unified timeline sorted by date
    const historyList = [];

    pastMeets.forEach(m => {
      historyList.push({
        type: "meeting",
        title: `Meeting: ${m.title}`,
        time: new Date(m.dateTime),
        badgeText: "Concluded",
        badgeClass: "done"
      });
    });

    doneTasks.forEach(t => {
      historyList.push({
        type: "task",
        title: `Task Completed: ${t.title}`,
        time: t.updatedAt ? new Date(t.updatedAt) : new Date(),
        badgeText: "Done",
        badgeClass: "done"
      });
    });

    // Sort descending
    historyList.sort((a,b) => b.time - a.time);

    if (historyList.length === 0) {
      elements.activityHistoryList.innerHTML = '<p class="empty-state">No past history recorded.</p>';
      return;
    }

    elements.activityHistoryList.innerHTML = historyList.slice(0, 10).map(item => {
      const formatTime = item.time.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-text">
            <strong>${escapeHTML(item.title)}</strong>
            <small>${formatTime}</small>
          </div>
          <span class="history-status ${item.badgeClass}">${item.badgeText}</span>
        </div>
      `;
    }).join("");
  }

  // 9. PAYMENT MANAGER FEATURE
  function setupPaymentsFeature() {
    elements.paymentForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = document.getElementById("paymentType").value;
      const party = document.getElementById("paymentParty").value.trim();
      const amount = parseFloat(document.getElementById("paymentAmount").value);
      const dueDate = document.getElementById("paymentDueDate").value;
      const description = document.getElementById("paymentDescription").value.trim();

      try {
        const res = await fetch(`/api/payments/${window.app.user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, party, amount, dueDate, description })
        });
        if (res.ok) {
          const newPay = await res.json();
          window.app.payments.push(newPay);
          elements.paymentForm.reset();
          renderPaymentsView();
          appendChatMessage("assistant", `Invoice recorded: **${type === 'receivable' ? 'Receiving' : 'Paying'} $${amount.toFixed(2)}** ${type === 'receivable' ? 'from' : 'to'} **${party}** due by ${dueDate}.`);
        }
      } catch (err) {
        alert("Error saving transaction.");
      }
    });
  }

  function renderPaymentsView() {
    renderPaymentsLedger(window.app.payments);
  }

  function renderPaymentsLedger(paymentsList) {
    const pending = paymentsList.filter(p => p.status === "pending");
    
    // Totals calculations
    const receivables = pending.filter(p => p.type === "receivable");
    const payables = pending.filter(p => p.type === "payable");

    const totalRecVal = receivables.reduce((sum, p) => sum + p.amount, 0);
    const totalPayVal = payables.reduce((sum, p) => sum + p.amount, 0);

    elements.totalReceivable.textContent = `$${totalRecVal.toFixed(2)}`;
    elements.receivableCount.textContent = `${receivables.length} accounts pending`;

    elements.totalPayable.textContent = `$${totalPayVal.toFixed(2)}`;
    elements.payableCount.textContent = `${payables.length} bills pending`;

    // Render Lists
    if (receivables.length === 0) {
      elements.receivablesLedger.innerHTML = '<p class="empty-state">No pending receivables</p>';
    } else {
      elements.receivablesLedger.innerHTML = receivables.map(p => renderPaymentItemHtml(p)).join("");
    }

    if (payables.length === 0) {
      elements.payablesLedger.innerHTML = '<p class="empty-state">No pending payables</p>';
    } else {
      elements.payablesLedger.innerHTML = payables.map(p => renderPaymentItemHtml(p)).join("");
    }

    // Bind item triggers
    bindPaymentActionListeners();
  }

  function renderPaymentItemHtml(p) {
    const dateStr = new Date(p.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const isPayable = p.type === "payable";

    return `
      <div class="payment-item">
        <div class="payment-left">
          <i class="fa-regular fa-circle-check payment-status-check" data-pay-complete-id="${p.id}" title="Mark as Completed"></i>
          <div class="payment-text">
            <strong>${escapeHTML(p.party)}</strong>
            <span>Due: ${dateStr} ${p.description ? `• ${escapeHTML(p.description)}` : ''}</span>
          </div>
        </div>
        <div class="payment-right">
          <span class="payment-amount ${p.type}">$${p.amount.toFixed(2)}</span>
          <button class="btn-icon delete-btn" data-pay-delete-id="${p.id}" title="Delete Record">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }

  function bindPaymentActionListeners() {
    // Status Completed Toggles
    document.querySelectorAll("[data-pay-complete-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.payCompleteId;
        try {
          const res = await fetch(`/api/payments/${window.app.user.id}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" })
          });
          if (res.ok) {
            const index = window.app.payments.findIndex(p => p.id === id);
            if (index !== -1) {
              window.app.payments[index].status = "completed";
            }
            renderPaymentsView();
            appendChatMessage("assistant", `Marked invoice for **$${window.app.payments[index].amount.toFixed(2)}** as paid/settled.`);
          }
        } catch (err) {
          alert("Error updating transaction status.");
        }
      });
    });

    // Delete Buttons
    document.querySelectorAll("[data-pay-delete-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.payDeleteId;
        if (!confirm("Are you sure you want to delete this payment record?")) return;

        try {
          const res = await fetch(`/api/payments/${window.app.user.id}/${id}`, { method: "DELETE" });
          if (res.ok) {
            window.app.payments = window.app.payments.filter(p => p.id !== id);
            renderPaymentsView();
            appendChatMessage("assistant", "Payment record removed.");
          }
        } catch (err) {
          alert("Error deleting record.");
        }
      });
    });
  }

  // 10. STICKY NOTES FEATURE
  function setupNotesFeature() {
    elements.openNoteFormBtn?.addEventListener("click", () => {
      elements.stickyNoteFormWrapper.classList.toggle("hidden");
    });

    elements.closeNoteFormBtn?.addEventListener("click", () => {
      elements.stickyNoteFormWrapper.classList.add("hidden");
    });

    elements.addNoteForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("noteTitleInput").value.trim();
      const content = document.getElementById("noteTextInput").value.trim();
      const color = document.getElementById("noteColorInput").value;
      const pinned = document.getElementById("notePinnedInput").checked;

      try {
        const res = await fetch(`/api/notes/${window.app.user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, color, pinned })
        });
        if (res.ok) {
          const newNote = await res.json();
          window.app.notes.push(newNote);
          elements.addNoteForm.reset();
          elements.stickyNoteFormWrapper.classList.add("hidden");
          renderNotesView();
          appendChatMessage("assistant", `Saved sticky note: "**${title}**".`);
        }
      } catch (err) {
        alert("Error saving note.");
      }
    });
  }

  function renderNotesView() {
    renderNotesGrid(window.app.notes);
  }

  function renderNotesGrid(notesList) {
    if (notesList.length === 0) {
      elements.notesStack.innerHTML = '<p class="empty-state">No sticky notes created yet.</p>';
      return;
    }

    // Sort notes: pinned first, then newest
    const sorted = [...notesList].sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    elements.notesStack.innerHTML = sorted.map(note => {
      return `
        <div class="note-card card" style="background:${note.color}; color:#111; border-color: rgba(0,0,0,0.1); border-radius: 12px; padding: 18px; position:relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          ${note.pinned ? `<span style="position:absolute; top:12px; left:12px; font-size:11px; color:#555;"><i class="fa-solid fa-thumbtack"></i> Pinned</span>` : ''}
          <button class="remove-note-btn" data-delete-note-id="${note.id}" style="color:#222; border-color:rgba(0,0,0,0.1); background:rgba(255,255,255,0.3); font-size:12px;" title="Delete Note">&times;</button>
          <div style="margin-top:${note.pinned ? '15px' : '0'};">
            <strong style="font-size:15px; font-weight:700; display:block; margin-bottom:8px;">${escapeHTML(note.title)}</strong>
            <p style="font-size:13px; margin-bottom:10px; white-space:pre-wrap; color:#333;">${escapeHTML(note.content)}</p>
            <small style="font-size:10px; color:#666; display:block;">${new Date(note.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      `;
    }).join("");

    // Bind delete notes
    elements.notesStack.querySelectorAll("[data-delete-note-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.deleteNoteId;
        try {
          const res = await fetch(`/api/notes/${window.app.user.id}/${id}`, { method: "DELETE" });
          if (res.ok) {
            window.app.notes = window.app.notes.filter(n => n.id !== id);
            renderNotesView();
          }
        } catch (err) {
          alert("Error deleting note.");
        }
      });
    });
  }

  // 11. QUICK LINKS FEATURE
  function setupBookmarksFeature() {
    elements.openLinkModalBtn?.addEventListener("click", () => {
      elements.linkFormWrapper.classList.toggle("hidden");
    });

    elements.closeLinkFormBtn?.addEventListener("click", () => {
      elements.linkFormWrapper.classList.add("hidden");
    });

    elements.addLinkForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("linkTitleInput").value.trim();
      const url = document.getElementById("linkUrlInput").value.trim();
      const category = document.getElementById("linkCategoryInput").value.trim() || "general";

      try {
        const res = await fetch(`/api/bookmarks/${window.app.user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url, category })
        });
        if (res.ok) {
          const newLink = await res.json();
          window.app.bookmarks.push(newLink);
          elements.addLinkForm.reset();
          elements.linkFormWrapper.classList.add("hidden");
          renderBookmarksView();
        }
      } catch (err) {
        alert("Error adding bookmark.");
      }
    });
  }

  function renderBookmarksView() {
    renderBookmarksGrid(window.app.bookmarks);
  }

  function renderBookmarksGrid(linksList) {
    if (linksList.length === 0) {
      elements.quickGrid.innerHTML = '<p class="empty-state">No bookmarks saved yet.</p>';
      return;
    }

    elements.quickGrid.innerHTML = linksList.map(b => {
      return `
        <div class="custom-card bookmark-card">
          <div class="bookmark-info">
            <div class="bookmark-icon">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
            <div class="bookmark-text">
              <strong>${escapeHTML(b.title)}</strong>
              <a href="${escapeHTML(b.url)}" target="_blank" rel="noreferrer">${escapeHTML(b.url)}</a>
            </div>
          </div>
          <button class="btn-icon delete-btn" data-delete-link-id="${b.id}" title="Remove Bookmark">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join("");

    // Bind delete links
    elements.quickGrid.querySelectorAll("[data-delete-link-id]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.deleteLinkId;
        try {
          const res = await fetch(`/api/bookmarks/${window.app.user.id}/${id}`, { method: "DELETE" });
          if (res.ok) {
            window.app.bookmarks = window.app.bookmarks.filter(b => b.id !== id);
            renderBookmarksView();
          }
        } catch (err) {
          alert("Error deleting bookmark.");
        }
      });
    });
  }

  // 12. AI PERSONAL ASSISTANT DRAWER & COMMAND PROCESSOR
  function setupAIProcessor() {
    // Drawer open/close toggles
    elements.aiDrawerToggleBtn?.addEventListener("click", () => {
      elements.aiAssistantDrawer.classList.add("open");
    });

    elements.aiDrawerCloseBtn?.addEventListener("click", () => {
      elements.aiAssistantDrawer.classList.remove("open");
    });

    // Command submission
    elements.aiCommandForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const command = elements.aiCommandInput.value.trim();
      if (!command) return;

      // Echo User message
      appendChatMessage("user", command);
      elements.aiCommandInput.value = "";

      // Process command
      processAICommand(command);
    });
  }

  // NLP Command Parser Engine
  async function processAICommand(rawCommand) {
    const cmd = rawCommand.toLowerCase();
    const userId = window.app.user.id;

    // SCENARIO 1: TASK CREATION
    // e.g. "add task buy groceries tomorrow priority high"
    // e.g. "task write report by Friday"
    if (cmd.startsWith("add task ") || cmd.startsWith("task ")) {
      const cleaned = rawCommand.replace(/^(add task |task )/i, "");
      
      // Extract priority
      let priority = "medium";
      let textWithoutPriority = cleaned;
      if (cmd.includes("priority low")) {
        priority = "low";
        textWithoutPriority = cleaned.replace(/priority low/i, "");
      } else if (cmd.includes("priority high")) {
        priority = "high";
        textWithoutPriority = cleaned.replace(/priority high/i, "");
      } else if (cmd.includes("priority medium")) {
        priority = "medium";
        textWithoutPriority = cleaned.replace(/priority medium/i, "");
      }

      // Extract due date keywords
      let dueDate = new Date();
      let title = textWithoutPriority.trim();

      if (cmd.includes("tomorrow")) {
        dueDate.setDate(dueDate.getDate() + 1);
        title = title.replace(/tomorrow/i, "").trim();
      } else if (cmd.includes("today")) {
        title = title.replace(/today/i, "").trim();
      } else if (cmd.includes("by monday")) {
        dueDate = getNextDayOfWeek(1);
        title = title.replace(/by monday/i, "").trim();
      } else if (cmd.includes("by friday")) {
        dueDate = getNextDayOfWeek(5);
        title = title.replace(/by friday/i, "").trim();
      }

      const formattedDate = dueDate.toISOString().split("T")[0];

      try {
        const res = await fetch(`/api/tasks/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: "Added automatically by Amica AI Assistant",
            dueDate: formattedDate,
            priority,
            category: window.app.contextMode
          })
        });
        if (res.ok) {
          const newTask = await res.json();
          window.app.tasks.push(newTask);
          if (window.app.activeTab === "tasks" || window.app.activeTab === "dashboard") {
            renderActiveTab();
          }
          appendChatMessage("assistant", `Sure! I have added the task "**${title}**" due by **${formattedDate}** with **${priority}** priority.`);
        }
      } catch (err) {
        appendChatMessage("assistant", "Sorry, I had trouble creating that task.");
      }
      return;
    }

    // SCENARIO 2: SCHEDULE MEETING
    // e.g. "schedule meeting with John on Monday at 3pm"
    // e.g. "meeting review project tomorrow at 2pm"
    if (cmd.startsWith("schedule meeting ") || cmd.startsWith("meeting ")) {
      const cleaned = rawCommand.replace(/^(schedule meeting |meeting )/i, "");
      
      // Parse Date/Time keyword
      let meetDate = new Date();
      let title = cleaned;
      let timeStr = "12:00";

      if (cmd.includes("tomorrow")) {
        meetDate.setDate(meetDate.getDate() + 1);
        title = title.replace(/tomorrow/i, "");
      } else if (cmd.includes("monday")) {
        meetDate = getNextDayOfWeek(1);
        title = title.replace(/monday/i, "");
      } else if (cmd.includes("friday")) {
        meetDate = getNextDayOfWeek(5);
        title = title.replace(/friday/i, "");
      }

      // Extract time e.g., "at 3pm", "at 14:00"
      const timeMatch = cmd.match(/at\s+(\d+)(?::(\d+))?\s*(am|pm)?/i);
      if (timeMatch) {
        let hr = parseInt(timeMatch[1]);
        const min = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const ampm = timeMatch[3];

        if (ampm && ampm.toLowerCase() === "pm" && hr < 12) hr += 12;
        if (ampm && ampm.toLowerCase() === "am" && hr === 12) hr = 0;

        timeStr = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        // Remove parsed time from title
        title = title.replace(/at\s+\d+(?::\d+)?\s*(am|pm)?/i, "");
      }

      title = title.replace(/\bon\b/g, "").replace(/\bat\b/g, "").trim();
      const dateString = `${meetDate.toISOString().split("T")[0]}T${timeStr}`;

      try {
        const res = await fetch(`/api/meetings/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            dateTime: dateString,
            location: "Virtual Room",
            attendees: "Team",
            category: window.app.contextMode,
            agenda: "Scheduled by Amica AI Assistant"
          })
        });
        if (res.ok) {
          const newMeet = await res.json();
          window.app.meetings.push(newMeet);
          if (window.app.activeTab === "meetings" || window.app.activeTab === "dashboard") {
            renderActiveTab();
          }
          appendChatMessage("assistant", `I've scheduled the meeting "**${title}**" for **${new Date(dateString).toLocaleString()}**.`);
        }
      } catch (err) {
        appendChatMessage("assistant", "I could not schedule the meeting.");
      }
      return;
    }

    // SCENARIO 3: ACCOUNT RECEIVABLES
    // e.g. "John owes us $250 by Friday"
    // e.g. "Bob owes us $100 by 2026-07-20"
    if (cmd.includes("owes us $")) {
      const match = rawCommand.match(/(.+) owes us \$([0-9.]+)(?:\s+by\s+(.+))?/i);
      if (match) {
        const party = match[1].trim();
        const amount = parseFloat(match[2]);
        const deadlineKeyword = match[3] ? match[3].toLowerCase() : "tomorrow";

        let dueDate = new Date();
        if (deadlineKeyword.includes("tomorrow")) dueDate.setDate(dueDate.getDate() + 1);
        else if (deadlineKeyword.includes("monday")) dueDate = getNextDayOfWeek(1);
        else if (deadlineKeyword.includes("friday")) dueDate = getNextDayOfWeek(5);
        else {
          // Attempt parsing date directly
          const tryDate = new Date(deadlineKeyword);
          if (!isNaN(tryDate.getTime())) dueDate = tryDate;
        }

        const formattedDate = dueDate.toISOString().split("T")[0];

        try {
          const res = await fetch(`/api/payments/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "receivable",
              party,
              amount,
              dueDate: formattedDate,
              description: "Logged by Amica AI Assistant"
            })
          });
          if (res.ok) {
            const newPay = await res.json();
            window.app.payments.push(newPay);
            if (window.app.activeTab === "payments" || window.app.activeTab === "dashboard") {
              renderActiveTab();
            }
            appendChatMessage("assistant", `Logged receivable: **$${amount.toFixed(2)}** pending from **${party}** due by ${formattedDate}.`);
          }
        } catch (err) {
          appendChatMessage("assistant", "I couldn't log the payment.");
        }
        return;
      }
    }

    // SCENARIO 4: ACCOUNT PAYABLES
    // e.g. "I need to pay electric bill $150 by monday"
    // e.g. "pay rent $1200 by tomorrow"
    if (cmd.includes("pay ") && cmd.includes("$")) {
      const match = rawCommand.match(/(?:pay|need to pay)\s+(.+)\s+\$([0-9.]+)(?:\s+by\s+(.+))?/i);
      if (match) {
        const party = match[1].trim();
        const amount = parseFloat(match[2]);
        const deadlineKeyword = match[3] ? match[3].toLowerCase() : "tomorrow";

        let dueDate = new Date();
        if (deadlineKeyword.includes("tomorrow")) dueDate.setDate(dueDate.getDate() + 1);
        else if (deadlineKeyword.includes("monday")) dueDate = getNextDayOfWeek(1);
        else if (deadlineKeyword.includes("friday")) dueDate = getNextDayOfWeek(5);

        const formattedDate = dueDate.toISOString().split("T")[0];

        try {
          const res = await fetch(`/api/payments/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "payable",
              party,
              amount,
              dueDate: formattedDate,
              description: "Logged by Amica AI Assistant"
            })
          });
          if (res.ok) {
            const newPay = await res.json();
            window.app.payments.push(newPay);
            if (window.app.activeTab === "payments" || window.app.activeTab === "dashboard") {
              renderActiveTab();
            }
            appendChatMessage("assistant", `Logged payable: **$${amount.toFixed(2)}** due to **${party}** by ${formattedDate}.`);
          }
        } catch (err) {
          appendChatMessage("assistant", "I couldn't log the payment.");
        }
        return;
      }
    }

    // SCENARIO 5: CONTEXTUAL QUERIES
    if (cmd.includes("show agenda") || cmd.includes("list tasks") || cmd.includes("agenda")) {
      const pendingTasks = window.app.tasks.filter(t => t.status === "todo" && t.category === window.app.contextMode);
      if (pendingTasks.length === 0) {
        appendChatMessage("assistant", `You have no pending tasks in your **${window.app.contextMode}** workspace.`);
      } else {
        const listStr = pendingTasks.map(t => `• **${t.title}** (${t.priority} priority)`).join("<br>");
        appendChatMessage("assistant", `Here are your pending tasks:<br>${listStr}`);
      }
      return;
    }

    if (cmd.includes("show payments") || cmd.includes("list payments") || cmd.includes("who do we owe") || cmd.includes("who owes us")) {
      const pending = window.app.payments.filter(p => p.status === "pending");
      const rec = pending.filter(p => p.type === "receivable");
      const pay = pending.filter(p => p.type === "payable");

      let responseText = "Here is your financials summary:<br><br>";
      
      if (rec.length > 0) {
        responseText += "**Who needs to pay us (Receivables):**<br>";
        responseText += rec.map(p => `• **${p.party}**: $${p.amount.toFixed(2)} (due ${p.dueDate})`).join("<br>") + "<br><br>";
      } else {
        responseText += "No pending receivables.<br><br>";
      }

      if (pay.length > 0) {
        responseText += "**Who we need to pay (Payables):**<br>";
        responseText += pay.map(p => `• **${p.party}**: $${p.amount.toFixed(2)} (due ${p.dueDate})`).join("<br>");
      } else {
        responseText += "No pending payables.";
      }

      appendChatMessage("assistant", responseText);
      return;
    }

    // Conversational Fallback
    appendChatMessage("assistant", "I'm not sure how to parse that command. You can add tasks, schedule meetings, or log payment receivables/payables. For example, try typing:<br>_\"add task Buy groceries tomorrow priority high\"_ or _\"John owes us $150 by Monday\"_.");
  }

  // Trigger command via UI chips
  window.app.triggerAISuggestion = (suggestionText) => {
    appendChatMessage("user", suggestionText);
    processAICommand(suggestionText);
  };

  // Helper: Append msg bubbles to chat log
  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${sender}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    elements.aiMessagesLog.appendChild(msgDiv);
    elements.aiMessagesLog.scrollTop = elements.aiMessagesLog.scrollHeight;
  }

  // Helper Date function
  function getNextDayOfWeek(dayOfWeek) {
    const today = new Date();
    const resultDate = new Date(today.getTime());
    resultDate.setDate(today.getDate() + (7 + dayOfWeek - today.getDay()) % 7);
    return resultDate;
  }

  // 13. DATA SAFETY / UTILITIES
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function escapeJS(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'");
  }

  // Bootstrap Application
  initApp();
});
