document.addEventListener("DOMContentLoaded", () => {
	const projectToggle = document.getElementById("projectsToggle");
	const projectsList = document.getElementById("projectsList");

	if (projectToggle && projectsList) {
		projectToggle.addEventListener("click", () => {
			const expanded = projectToggle.getAttribute("aria-expanded") === "true";
			projectToggle.setAttribute("aria-expanded", String(!expanded));
			projectsList.classList.toggle("open", !expanded);
			projectToggle.textContent = !expanded
				? "Hide Projects ▲"
				: "Show All Projects ▼";
		});
	}

	const counters = document.querySelectorAll(".count");
	const countObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				const el = entry.target;
				const target = Number(el.dataset.target || 0);
				const duration = 1000;
				const startTime = performance.now();

				const step = (time) => {
					const progress = Math.min((time - startTime) / duration, 1);
					const current = Math.floor(progress * target);
					el.textContent = current.toString();
					if (progress < 1) requestAnimationFrame(step);
					else el.textContent = target.toString();
				};

				requestAnimationFrame(step);
				observer.unobserve(el);
			});
		},
		{ threshold: 0.6 },
	);

	counters.forEach((counter) => countObserver.observe(counter));

	const revealEls = document.querySelectorAll(
		".about-card, .service-card, .intro-card, .project-card, .glass-panel",
	);

	const revealObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.style.opacity = "1";
					entry.target.style.transform = "translateY(0)";
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.12 },
	);

	revealEls.forEach((el) => {
		el.style.opacity = "0";
		el.style.transform = "translateY(18px)";
		el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
		revealObserver.observe(el);
	});

	const form = document.querySelector(".contact-form");
	if (form) {
		const status = document.createElement("p");
		status.className = "status";
		form.appendChild(status);

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const name = form.querySelector('input[name="name"]')?.value.trim();
			const email = form.querySelector('input[name="email"]')?.value.trim();
			const message = form
				.querySelector('textarea[name="message"]')
				?.value.trim();

			if (!name || !email || !message) {
				status.textContent = "Please fill in all fields before sending.";
				status.style.color = "#fecaca";
				return;
			}

			status.textContent = `Thanks ${name}! Your message is ready to be sent.`;
			status.style.color = "#b4ffd8";
			form.reset();
		});
	}
});
