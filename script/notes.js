/**
 * Notes Module
 * Handles sticky notes creation and management
 */

class NotesModule {
	constructor(app) {
		this.app = app;
		this.notes = [];
		this.init();
	}

	async init() {
		this.setupEventListeners();
		await this.loadNotes();
		this.renderNotes();
	}

	setupEventListeners() {
		const newNoteBtn = document.getElementById("newNoteBtn");
		if (newNoteBtn) {
			newNoteBtn.addEventListener("click", () => this.openNoteModal());
		}
	}

	async loadNotes() {
		try {
			const response = await fetch(`/api/notes/${this.app.currentUser.id}`);
			this.notes = await response.json();
		} catch (error) {
			console.error("Error loading notes:", error);
		}
	}

	renderNotes() {
		const board = document.getElementById("notesBoard");
		if (!board) return;

		if (this.notes.length === 0) {
			board.innerHTML =
				'<p class="empty-state">No notes yet. Create one to get started!</p>';
			return;
		}

		board.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
        ${this.notes
					.map(
						(note) => `
          <div class="note-card" style="
            background: ${note.color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
          " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; word-wrap: break-word;">${note.title}</h4>
            <p style="margin: 0; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; max-height: 150px; overflow: hidden;">${note.content}</p>
            <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
              <button class="btn btn-secondary" data-note-id="${note.id}" style="padding: 4px 8px; font-size: 11px;">Edit</button>
              <button class="btn btn-secondary" data-note-id="${note.id}" style="padding: 4px 8px; font-size: 11px;">Delete</button>
            </div>
          </div>
        `,
					)
					.join("")}
      </div>
    `;
	}

	openNoteModal() {
		const title = prompt("Note title:");
		if (!title) return;

		const content = prompt("Note content:");
		if (content === null) return;

		this.createNote(title, content);
	}

	async createNote(title, content) {
		try {
			const response = await fetch(`/api/notes/${this.app.currentUser.id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					content,
					color: this.getRandomColor(),
				}),
			});

			if (response.ok) {
				await this.loadNotes();
				this.renderNotes();
			}
		} catch (error) {
			console.error("Error creating note:", error);
		}
	}

	getRandomColor() {
		const colors = [
			"#FFD93D",
			"#FF6B6B",
			"#4ECDC4",
			"#95E1D3",
			"#F38181",
			"#EAFFD0",
			"#FCE77D",
			"#F8B500",
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}
}

// Initialize when app is ready
document.addEventListener("DOMContentLoaded", () => {
	if (window.app) {
		window.notes = new NotesModule(window.app);
	}
});
