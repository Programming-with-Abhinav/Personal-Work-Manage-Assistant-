const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data paths
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const tasksFile = path.join(dataDir, "tasks.json");
const projectsFile = path.join(dataDir, "projects.json");
const notesFile = path.join(dataDir, "notes.json");
const goalsFile = path.join(dataDir, "goals.json");
const remindersFile = path.join(dataDir, "reminders.json");
const bookmarksFile = path.join(dataDir, "bookmarks.json");

// Utility functions
const readJSON = (filePath) => {
	try {
		const data = fs.readFileSync(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		return Array.isArray([]) ? [] : {};
	}
};

const writeJSON = (filePath, data) => {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const generateId = () => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==================== AUTH ROUTES ====================

// Register
app.post("/api/auth/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Validation
		if (!username || !email || !password) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		let users = readJSON(usersFile);

		// Check if user exists
		if (users.some((u) => u.email === email || u.username === username)) {
			return res.status(409).json({ error: "User already exists" });
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = {
			id: generateId(),
			username,
			email,
			passwordHash,
			createdAt: new Date().toISOString(),
			role: "user",
			theme: "light",
			profile: {
				avatar: null,
				bio: "",
				location: "",
			},
		};

		users.push(newUser);
		writeJSON(usersFile, users);

		res.status(201).json({
			message: "User registered successfully",
			user: {
				id: newUser.id,
				username: newUser.username,
				email: newUser.email,
			},
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Login
app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Missing email or password" });
		}

		let users = readJSON(usersFile);
		const user = users.find((u) => u.email === email);

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const passwordMatch = await bcrypt.compare(password, user.passwordHash);

		if (!passwordMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Return user data (without password)
		res.json({
			message: "Login successful",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				theme: user.theme,
				profile: user.profile,
			},
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Get user profile
app.get("/api/auth/profile/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let users = readJSON(usersFile);
		const user = users.find((u) => u.id === userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({
			id: user.id,
			username: user.username,
			email: user.email,
			theme: user.theme,
			profile: user.profile,
			createdAt: user.createdAt,
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update user profile
app.put("/api/auth/profile/:userId", async (req, res) => {
	try {
		const { userId } = req.params;
		const { username, bio, location, avatar, theme } = req.body;
		let users = readJSON(usersFile);

		const userIndex = users.findIndex((u) => u.id === userId);
		if (userIndex === -1) {
			return res.status(404).json({ error: "User not found" });
		}

		if (username && username !== users[userIndex].username) {
			if (users.some((u) => u.username === username)) {
				return res.status(409).json({ error: "Username already taken" });
			}
			users[userIndex].username = username;
		}

		if (bio !== undefined) users[userIndex].profile.bio = bio;
		if (location !== undefined) users[userIndex].profile.location = location;
		if (avatar !== undefined) users[userIndex].profile.avatar = avatar;
		if (theme) users[userIndex].theme = theme;

		writeJSON(usersFile, users);

		res.json({
			message: "Profile updated successfully",
			user: users[userIndex],
		});
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== TASK ROUTES ====================

// Get all tasks for user
app.get("/api/tasks/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let tasks = readJSON(tasksFile);
		const userTasks = tasks[userId] || [];
		res.json(userTasks);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create task
app.post("/api/tasks/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, description, dueDate, priority, category, status } =
			req.body;

		let tasks = readJSON(tasksFile);
		if (!tasks[userId]) tasks[userId] = [];

		const newTask = {
			id: generateId(),
			title,
			description,
			dueDate,
			priority: priority || "medium",
			category: category || "general",
			status: status || "todo",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		tasks[userId].push(newTask);
		writeJSON(tasksFile, tasks);

		res.status(201).json(newTask);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update task
app.put("/api/tasks/:userId/:taskId", (req, res) => {
	try {
		const { userId, taskId } = req.params;
		let tasks = readJSON(tasksFile);

		if (!tasks[userId]) {
			return res.status(404).json({ error: "No tasks found" });
		}

		const taskIndex = tasks[userId].findIndex((t) => t.id === taskId);
		if (taskIndex === -1) {
			return res.status(404).json({ error: "Task not found" });
		}

		tasks[userId][taskIndex] = {
			...tasks[userId][taskIndex],
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		writeJSON(tasksFile, tasks);
		res.json(tasks[userId][taskIndex]);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete task
app.delete("/api/tasks/:userId/:taskId", (req, res) => {
	try {
		const { userId, taskId } = req.params;
		let tasks = readJSON(tasksFile);

		if (!tasks[userId]) {
			return res.status(404).json({ error: "No tasks found" });
		}

		tasks[userId] = tasks[userId].filter((t) => t.id !== taskId);
		writeJSON(tasksFile, tasks);

		res.json({ message: "Task deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== PROJECT ROUTES ====================

// Get all projects for user
app.get("/api/projects/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let projects = readJSON(projectsFile);
		const userProjects = projects[userId] || [];
		res.json(userProjects);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create project
app.post("/api/projects/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, description, deadline, tags } = req.body;

		let projects = readJSON(projectsFile);
		if (!projects[userId]) projects[userId] = [];

		const newProject = {
			id: generateId(),
			title,
			description,
			deadline,
			tags: tags || [],
			progress: 0,
			columns: [
				{ id: "backlog", title: "Backlog", tasks: [] },
				{ id: "todo", title: "Todo", tasks: [] },
				{ id: "in-progress", title: "In Progress", tasks: [] },
				{ id: "review", title: "Review", tasks: [] },
				{ id: "completed", title: "Completed", tasks: [] },
			],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		projects[userId].push(newProject);
		writeJSON(projectsFile, projects);

		res.status(201).json(newProject);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update project
app.put("/api/projects/:userId/:projectId", (req, res) => {
	try {
		const { userId, projectId } = req.params;
		let projects = readJSON(projectsFile);

		if (!projects[userId]) {
			return res.status(404).json({ error: "No projects found" });
		}

		const projectIndex = projects[userId].findIndex((p) => p.id === projectId);
		if (projectIndex === -1) {
			return res.status(404).json({ error: "Project not found" });
		}

		projects[userId][projectIndex] = {
			...projects[userId][projectIndex],
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		writeJSON(projectsFile, projects);
		res.json(projects[userId][projectIndex]);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete project
app.delete("/api/projects/:userId/:projectId", (req, res) => {
	try {
		const { userId, projectId } = req.params;
		let projects = readJSON(projectsFile);

		if (!projects[userId]) {
			return res.status(404).json({ error: "No projects found" });
		}

		projects[userId] = projects[userId].filter((p) => p.id !== projectId);
		writeJSON(projectsFile, projects);

		res.json({ message: "Project deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== NOTES ROUTES ====================

// Get all notes for user
app.get("/api/notes/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let notes = readJSON(notesFile);
		const userNotes = notes[userId] || [];
		res.json(userNotes);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create note
app.post("/api/notes/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, content, color, pinned } = req.body;

		let notes = readJSON(notesFile);
		if (!notes[userId]) notes[userId] = [];

		const newNote = {
			id: generateId(),
			title,
			content,
			color: color || "#FFD93D",
			pinned: pinned || false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		notes[userId].push(newNote);
		writeJSON(notesFile, notes);

		res.status(201).json(newNote);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update note
app.put("/api/notes/:userId/:noteId", (req, res) => {
	try {
		const { userId, noteId } = req.params;
		let notes = readJSON(notesFile);

		if (!notes[userId]) {
			return res.status(404).json({ error: "No notes found" });
		}

		const noteIndex = notes[userId].findIndex((n) => n.id === noteId);
		if (noteIndex === -1) {
			return res.status(404).json({ error: "Note not found" });
		}

		notes[userId][noteIndex] = {
			...notes[userId][noteIndex],
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		writeJSON(notesFile, notes);
		res.json(notes[userId][noteIndex]);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete note
app.delete("/api/notes/:userId/:noteId", (req, res) => {
	try {
		const { userId, noteId } = req.params;
		let notes = readJSON(notesFile);

		if (!notes[userId]) {
			return res.status(404).json({ error: "No notes found" });
		}

		notes[userId] = notes[userId].filter((n) => n.id !== noteId);
		writeJSON(notesFile, notes);

		res.json({ message: "Note deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== GOALS ROUTES ====================

// Get all goals for user
app.get("/api/goals/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let goals = readJSON(goalsFile);
		const userGoals = goals[userId] || [];
		res.json(userGoals);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create goal
app.post("/api/goals/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, description, category, targetDate, progress } = req.body;

		let goals = readJSON(goalsFile);
		if (!goals[userId]) goals[userId] = [];

		const newGoal = {
			id: generateId(),
			title,
			description,
			category: category || "daily",
			targetDate,
			progress: progress || 0,
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		goals[userId].push(newGoal);
		writeJSON(goalsFile, goals);

		res.status(201).json(newGoal);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update goal
app.put("/api/goals/:userId/:goalId", (req, res) => {
	try {
		const { userId, goalId } = req.params;
		let goals = readJSON(goalsFile);

		if (!goals[userId]) {
			return res.status(404).json({ error: "No goals found" });
		}

		const goalIndex = goals[userId].findIndex((g) => g.id === goalId);
		if (goalIndex === -1) {
			return res.status(404).json({ error: "Goal not found" });
		}

		goals[userId][goalIndex] = {
			...goals[userId][goalIndex],
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		writeJSON(goalsFile, goals);
		res.json(goals[userId][goalIndex]);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete goal
app.delete("/api/goals/:userId/:goalId", (req, res) => {
	try {
		const { userId, goalId } = req.params;
		let goals = readJSON(goalsFile);

		if (!goals[userId]) {
			return res.status(404).json({ error: "No goals found" });
		}

		goals[userId] = goals[userId].filter((g) => g.id !== goalId);
		writeJSON(goalsFile, goals);

		res.json({ message: "Goal deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== REMINDERS ROUTES ====================

// Get all reminders for user
app.get("/api/reminders/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let reminders = readJSON(remindersFile);
		const userReminders = reminders[userId] || [];
		res.json(userReminders);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create reminder
app.post("/api/reminders/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, description, reminderTime, completed } = req.body;

		let reminders = readJSON(remindersFile);
		if (!reminders[userId]) reminders[userId] = [];

		const newReminder = {
			id: generateId(),
			title,
			description,
			reminderTime,
			completed: completed || false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		reminders[userId].push(newReminder);
		writeJSON(remindersFile, reminders);

		res.status(201).json(newReminder);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Update reminder
app.put("/api/reminders/:userId/:reminderId", (req, res) => {
	try {
		const { userId, reminderId } = req.params;
		let reminders = readJSON(remindersFile);

		if (!reminders[userId]) {
			return res.status(404).json({ error: "No reminders found" });
		}

		const reminderIndex = reminders[userId].findIndex(
			(r) => r.id === reminderId,
		);
		if (reminderIndex === -1) {
			return res.status(404).json({ error: "Reminder not found" });
		}

		reminders[userId][reminderIndex] = {
			...reminders[userId][reminderIndex],
			...req.body,
			updatedAt: new Date().toISOString(),
		};

		writeJSON(remindersFile, reminders);
		res.json(reminders[userId][reminderIndex]);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete reminder
app.delete("/api/reminders/:userId/:reminderId", (req, res) => {
	try {
		const { userId, reminderId } = req.params;
		let reminders = readJSON(remindersFile);

		if (!reminders[userId]) {
			return res.status(404).json({ error: "No reminders found" });
		}

		reminders[userId] = reminders[userId].filter((r) => r.id !== reminderId);
		writeJSON(remindersFile, reminders);

		res.json({ message: "Reminder deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== BOOKMARKS ROUTES ====================

// Get all bookmarks for user
app.get("/api/bookmarks/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		let bookmarks = readJSON(bookmarksFile);
		const userBookmarks = bookmarks[userId] || [];
		res.json(userBookmarks);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Create bookmark
app.post("/api/bookmarks/:userId", (req, res) => {
	try {
		const { userId } = req.params;
		const { title, url, category } = req.body;

		let bookmarks = readJSON(bookmarksFile);
		if (!bookmarks[userId]) bookmarks[userId] = [];

		const newBookmark = {
			id: generateId(),
			title,
			url,
			category: category || "general",
			createdAt: new Date().toISOString(),
		};

		bookmarks[userId].push(newBookmark);
		writeJSON(bookmarksFile, bookmarks);

		res.status(201).json(newBookmark);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// Delete bookmark
app.delete("/api/bookmarks/:userId/:bookmarkId", (req, res) => {
	try {
		const { userId, bookmarkId } = req.params;
		let bookmarks = readJSON(bookmarksFile);

		if (!bookmarks[userId]) {
			return res.status(404).json({ error: "No bookmarks found" });
		}

		bookmarks[userId] = bookmarks[userId].filter((b) => b.id !== bookmarkId);
		writeJSON(bookmarksFile, bookmarks);

		res.json({ message: "Bookmark deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

// ==================== ROOT ROUTE ====================

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "home.html"));
});

// Start server
app.listen(PORT, () => {
	console.log(`✨ Personal Work Assistant running on http://localhost:${PORT}`);
});
