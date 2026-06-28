# Personal Work Assistant (PWA)

## Premium Productivity Operating System

A complete, production-quality personal productivity platform built with vanilla JavaScript, Node.js/Express, and JSON database. Inspired by Notion, Linear, ClickUp, Trello, and Arc Browser.

---

## 🚀 Features

### ✨ Core Modules

1. **Dashboard** - Beautiful widget-based overview
2. **Task Manager** - Create, edit, delete tasks with priorities
3. **Project Management** - Kanban-style project organization
4. **Calendar** - Interactive calendar with events
5. **Goals Tracker** - Track daily, weekly, and long-term goals
6. **Notes System** - Sticky notes with colors and search
7. **Bookmarks** - Save and organize important links
8. **Pomodoro Timer** - Focus sessions with break management
9. **Reminders** - Time-based notifications
10. **Analytics** - Productivity metrics and statistics
11. **Settings** - Profile and theme management
12. **Theme System** - Light, Dark, and Purple Galaxy themes

---

## 🛠️ Tech Stack

**Frontend**: HTML5, CSS3, Vanilla JavaScript  
**Backend**: Node.js, Express.js  
**Database**: JSON Files  
**Authentication**: bcrypt password hashing  
**Storage**: LocalStorage + JSON files

---

## 📁 Project Structure

```
script/          - JavaScript modules
style/           - CSS stylesheets
data/            - JSON database files
home.html        - Dashboard
login.html       - Login page
register.html    - Registration page
server.js        - Express backend
package.json     - Dependencies
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Server

```bash
npm start
```

### 3. Open Browser

Navigate to `http://localhost:3000`

### 4. Register/Login

Create account or use existing credentials

---

## 📚 API Endpoints

### Auth

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile/:userId` - Get profile
- `PUT /api/auth/profile/:userId` - Update profile

### CRUD Operations

- `/api/tasks/:userId` - Tasks management
- `/api/projects/:userId` - Projects management
- `/api/notes/:userId` - Notes management
- `/api/goals/:userId` - Goals tracking
- `/api/reminders/:userId` - Reminders
- `/api/bookmarks/:userId` - Bookmarks

---

## 🔐 Security

✅ bcrypt password hashing  
✅ Unique user validation  
✅ Session persistence  
✅ User data isolation

---

## 🎨 Features

- Responsive design (Desktop, Tablet, Mobile)
- Semantic HTML & ARIA labels
- Smooth animations
- Multiple themes
- Data export/import
- Browser notifications
- Offline-friendly caching

---

## 📱 Browser Support

Chrome, Firefox, Safari, Edge (Latest)

---

## 🚀 Quick Start

```bash
npm install && npm start
# Open http://localhost:3000
# Register and start organizing!
```

---

**Happy Organizing! 🚀✨**
