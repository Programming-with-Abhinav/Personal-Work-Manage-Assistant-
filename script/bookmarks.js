/**
 * Bookmarks Module
 * Handles bookmark management with categories
 */

class BookmarksModule {
	constructor(app) {
		this.app = app;
		this.bookmarks = [];
		this.init();
	}

	async init() {
		this.setupEventListeners();
		await this.loadBookmarks();
		this.renderBookmarks();
	}

	setupEventListeners() {
		const newBookmarkBtn = document.getElementById("newBookmarkBtn");
		if (newBookmarkBtn) {
			newBookmarkBtn.addEventListener("click", () => this.openBookmarkModal());
		}
	}

	async loadBookmarks() {
		try {
			const response = await fetch(`/api/bookmarks/${this.app.currentUser.id}`);
			this.bookmarks = await response.json();
		} catch (error) {
			console.error("Error loading bookmarks:", error);
		}
	}

	renderBookmarks() {
		const grid = document.getElementById("bookmarksGrid");
		if (!grid) return;

		if (this.bookmarks.length === 0) {
			grid.innerHTML =
				'<p class="empty-state">No bookmarks yet. Create one to get started!</p>';
			return;
		}

		grid.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
        ${this.bookmarks
					.map(
						(bookmark) => `
          <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer" class="card" style="
            padding: 16px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
          " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.05)'">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 6px; margin-bottom: 12px;"></div>
            <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600;">${bookmark.title}</h4>
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${bookmark.url}</p>
            <span style="font-size: 11px; color: #6366f1; font-weight: 500;">${bookmark.category}</span>
          </a>
        `,
					)
					.join("")}
      </div>
    `;
	}

	openBookmarkModal() {
		const title = prompt("Bookmark title:");
		if (!title) return;

		const url = prompt("URL:");
		if (!url) return;

		const category = prompt("Category:", "general");
		this.createBookmark(title, url, category);
	}

	async createBookmark(title, url, category) {
		try {
			const response = await fetch(
				`/api/bookmarks/${this.app.currentUser.id}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title, url, category }),
				},
			);

			if (response.ok) {
				await this.loadBookmarks();
				this.renderBookmarks();
			}
		} catch (error) {
			console.error("Error creating bookmark:", error);
		}
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.bookmarks = new BookmarksModule(window.app);
	}
});
