document.addEventListener("DOMContentLoaded", () => {
	const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

	const sidebarName = document.getElementById("sidebarName");
	const accountName = document.getElementById("accountName");
	const logoutBtn = document.getElementById("logoutBtn");
	const profilePhotoInput = document.getElementById("profilePhotoInput");
	const themeBtn = document.getElementById("theme-btn");
	const themeIcon = document.getElementById("theme-icon");

	const monthLabel = document.getElementById("calendarMonthLabel");
	const calendarStatus = document.getElementById("calendarStatus");
	const calendarGrid = document.getElementById("calendarGrid");
	const prevMonthBtn = document.getElementById("prevMonthBtn");
	const nextMonthBtn = document.getElementById("nextMonthBtn");
	const todayMonthBtn = document.getElementById("todayMonthBtn");

	if (!currentUser) {
		window.location.replace("login.html");
		return;
	}

	function applyAvatar() {
		const images = document.querySelectorAll(
			".avatar-shell img, .account-image img, .profile-link img",
		);
		images.forEach((img) => {
			img.src = currentUser.avatar || "assets/ID-photo.png";
			img.onerror = () => {
				img.src = "assets/ID-photo.png";
			};
		});
	}

	function saveAvatar(avatarData) {
		const users = JSON.parse(localStorage.getItem("users")) || [];
		const updatedUser = { ...currentUser, avatar: avatarData };
		const updatedUsers = users.map((u) =>
			u.email === currentUser.email ? updatedUser : u,
		);
		localStorage.setItem("users", JSON.stringify(updatedUsers));
		localStorage.setItem("currentUser", JSON.stringify(updatedUser));
		return updatedUser;
	}

	function fileToDataUrl(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	if (sidebarName) sidebarName.textContent = currentUser.name || "User";
	if (accountName) accountName.textContent = currentUser.name || "User";

	const savedTheme = localStorage.getItem("theme") || "light";
	document.body.setAttribute("data-theme", savedTheme);
	if (themeIcon) {
		themeIcon.className =
			savedTheme === "dark" ? "fa-regular fa-moon" : "fa-regular fa-sun";
	}

	applyAvatar();

	profilePhotoInput?.addEventListener("change", async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const updatedUser = saveAvatar(await fileToDataUrl(file));
			currentUser.avatar = updatedUser.avatar;
			applyAvatar();
		} catch {
			alert("Could not upload the image.");
		}
	});

	themeBtn?.addEventListener("click", () => {
		const nextTheme =
			document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
		document.body.setAttribute("data-theme", nextTheme);
		localStorage.setItem("theme", nextTheme);
		if (themeIcon) {
			themeIcon.className =
				nextTheme === "dark" ? "fa-regular fa-moon" : "fa-regular fa-sun";
		}
	});

	logoutBtn?.addEventListener("click", (e) => {
		e.preventDefault();
		localStorage.removeItem("currentUser");
		window.location.replace("login.html");
	});

	let currentMonth = new Date();
	let selectedDate = new Date();

	function getRelativeLabel(date) {
		const today = new Date();
		const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		const diff = Math.round((a - b) / 86400000);

		if (diff === 0) return "Today";
		if (diff === -1) return "Yesterday";
		if (diff === 1) return "Tomorrow";
		return new Intl.DateTimeFormat("en", {
			day: "numeric",
			month: "short",
			year: "numeric",
		}).format(date);
	}

	function formatMonthLabel(date) {
		return new Intl.DateTimeFormat("en", {
			month: "long",
			year: "numeric",
		}).format(date);
	}

	function renderCalendar(date) {
		if (!calendarGrid || !monthLabel) return;

		const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		const daysInMonth = new Date(
			date.getFullYear(),
			date.getMonth() + 1,
			0,
		).getDate();
		const startDay = (firstDay.getDay() + 6) % 7;
		const previousMonthDays = new Date(
			date.getFullYear(),
			date.getMonth(),
			0,
		).getDate();

		const cells = [];

		for (let i = startDay - 1; i >= 0; i -= 1) {
			const day = previousMonthDays - i;
			cells.push(`
        <button class="calendar-cell muted" type="button" data-day="${day}" data-month="${date.getMonth() - 1}">
          ${day}
        </button>
      `);
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
			const isSelected =
				cellDate.toDateString() === selectedDate.toDateString();
			const isToday = cellDate.toDateString() === new Date().toDateString();

			cells.push(`
        <button
          class="calendar-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}"
          type="button"
          data-day="${day}"
          data-month="${date.getMonth()}"
        >
          ${day}
        </button>
      `);
		}

		const trailing = 42 - cells.length;
		for (let day = 1; day <= trailing; day += 1) {
			cells.push(`
        <button class="calendar-cell muted" type="button" data-day="${day}" data-month="${date.getMonth() + 1}">
          ${day}
        </button>
      `);
		}

		monthLabel.textContent = formatMonthLabel(date);
		if (calendarStatus) {
			calendarStatus.textContent = getRelativeLabel(selectedDate);
		}

		calendarGrid.innerHTML = [
			...weekdays.map((label) => `<span class="weekday">${label}</span>`),
			...cells,
		].join("");

		calendarGrid.querySelectorAll(".calendar-cell").forEach((btn) => {
			btn.addEventListener("click", () => {
				const day = Number(btn.dataset.day);
				const month = Number(btn.dataset.month);
				selectedDate = new Date(date.getFullYear(), month, day);
				currentMonth = new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth(),
					1,
				);
				renderCalendar(currentMonth);
			});
		});
	}

	prevMonthBtn?.addEventListener("click", () => {
		currentMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() - 1,
			1,
		);
		renderCalendar(currentMonth);
	});

	nextMonthBtn?.addEventListener("click", () => {
		currentMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
			1,
		);
		renderCalendar(currentMonth);
	});

	todayMonthBtn?.addEventListener("click", () => {
		selectedDate = new Date();
		currentMonth = new Date();
		renderCalendar(currentMonth);
	});

	renderCalendar(currentMonth);
});
