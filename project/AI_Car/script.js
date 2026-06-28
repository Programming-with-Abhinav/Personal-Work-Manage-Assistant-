// Global Configuration
const CONFIG = {
	gameWidth: 400,
	gameHeight: 600,
	carWidth: 40,
	carHeight: 70,
	baseRoadSpeed: 5, // Starting game speed
	maxRoadSpeed: 14, // Speed limit cap
	baseSpawnInterval: 1300, // Starting traffic spawn delay (ms)
	minSpawnInterval: 600, // Max speed spawn traffic interval cap (ms)
};

// Application State Parameters
let state = {
	gameActive: false,
	score: 0,
	highScore: 0,
	currentSpeedModifier: 0, // Increments gradually as you survive
	playerX: 180,
	keys: { ArrowLeft: false, ArrowRight: false, a: false, d: false },
	lines: [],
	enemies: [],
	lastSpawnTime: 0,
	animationFrameId: null,
};

// Target DOM Mappings
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("scoreDisplay");
const speedDisplay = document.getElementById("speedDisplay");
const highDisplay = document.getElementById("highDisplay");
const finalScore = document.getElementById("finalScore");
const finalHighScore = document.getElementById("finalHighScore");
const newHighScoreBadge = document.getElementById("newHighScoreBadge");
const menuOverlay = document.getElementById("menuOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const roadLinesContainer = document.getElementById("roadLinesContainer");
const enemiesContainer = document.getElementById("enemiesContainer");

// Listeners Configuration
window.addEventListener("keydown", (e) => {
	if (e.key in state.keys) state.keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
	if (e.key in state.keys) state.keys[e.key] = false;
});
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

// Pull high score from browser LocalStorage
function loadHighScore() {
	const savedScore = localStorage.getItem("retro_speedster_hi");
	state.highScore = savedScore ? parseInt(savedScore, 10) : 0;
	highDisplay.textContent = state.highScore;
}

// Generate the initial array of moving road divider lines
function initRoadLines() {
	roadLinesContainer.innerHTML = "";
	state.lines = [];
	for (let i = -80; i < CONFIG.gameHeight; i += 140) {
		const line = document.createElement("div");
		line.className = "road-line";
		line.style.top = `${i}px`;
		roadLinesContainer.appendChild(line);
		state.lines.push({ element: line, y: i });
	}
}

// Reset data layers and activate animation loop steps
function startGame() {
	state.gameActive = true;
	state.score = 0;
	state.currentSpeedModifier = 0;
	state.playerX = 180;
	state.enemies = [];
	state.lastSpawnTime = Date.now();
	enemiesContainer.innerHTML = "";

	scoreDisplay.textContent = "0";
	speedDisplay.textContent = "100";
	loadHighScore();

	menuOverlay.classList.add("hidden");
	gameOverOverlay.classList.add("hidden");
	newHighScoreBadge.classList.add("hidden");
	player.style.left = `${state.playerX}px`;

	initRoadLines();

	if (state.animationFrameId) cancelAnimationFrame(state.animationFrameId);
	state.animationFrameId = requestAnimationFrame(gameLoop);
}

// Spawns oncoming traffic obstables randomly across different paths
function spawnEnemy() {
	const enemy = document.createElement("div");
	enemy.className = "enemy-car";

	const minX = 10;
	const maxX = CONFIG.gameWidth - CONFIG.carWidth - 10;
	const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

	// Scale enemy speeds relative to current speed modifier values
	const enemyMin = 3 + state.currentSpeedModifier * 0.4;
	const enemyMax = 6 + state.currentSpeedModifier * 0.5;
	const randomSpeed = Math.random() * (enemyMax - enemyMin) + enemyMin;

	enemy.style.left = `${randomX}px`;
	enemy.style.top = `-${CONFIG.carHeight}px`;

	enemiesContainer.appendChild(enemy);
	state.enemies.push({
		element: enemy,
		x: randomX,
		y: -CONFIG.carHeight,
		speed: randomSpeed,
	});
}

// Axis-Aligned Bounding Box (AABB) math calculations for hitbox overlap tracking
function checkCollision(rect1, rect2) {
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	);
}

// Stops game loops and updates dashboards
function endGame() {
	state.gameActive = false;
	cancelAnimationFrame(state.animationFrameId);

	const totalScore = Math.floor(state.score);
	finalScore.textContent = totalScore;

	// Commit new score data blocks to persistent storage if higher
	if (totalScore > state.highScore) {
		state.highScore = totalScore;
		localStorage.setItem("retro_speedster_hi", totalScore);
		newHighScoreBadge.classList.remove("hidden");
	}

	finalHighScore.textContent = state.highScore;
	highDisplay.textContent = state.highScore;
	gameOverOverlay.classList.remove("hidden");
}

// Primary execution rendering pipeline loop
function gameLoop() {
	if (!state.gameActive) return;

	// Linearly increase speed over time up to the configured speed limit
	if (state.currentSpeedModifier < CONFIG.maxRoadSpeed - CONFIG.baseRoadSpeed) {
		state.currentSpeedModifier += 0.0015;
	}

	const currentRoadSpeed = CONFIG.baseRoadSpeed + state.currentSpeedModifier;

	// Convert current speed metrics to km/h values (100km/h up to 250km/h)
	const kmhDisplayValue = Math.floor(100 + state.currentSpeedModifier * 16.6);
	speedDisplay.textContent = kmhDisplayValue;

	// 1. Process steering mechanics (Steering scales sharply as velocity builds up)
	const playerSpeed = 5 + state.currentSpeedModifier * 0.2;
	if (state.keys.ArrowLeft || state.keys.a) state.playerX -= playerSpeed;
	if (state.keys.ArrowRight || state.keys.d) state.playerX += playerSpeed;

	if (state.playerX < 10) state.playerX = 10;
	if (state.playerX > CONFIG.gameWidth - CONFIG.carWidth - 10) {
		state.playerX = CONFIG.gameWidth - CONFIG.carWidth - 10;
	}
	player.style.left = `${state.playerX}px`;

	// 2. Animate vertical scroll position of road dividers
	state.lines.forEach((line) => {
		line.y += currentRoadSpeed;
		if (line.y >= CONFIG.gameHeight) line.y = -80;
		line.element.style.top = `${line.y}px`;
	});

	// 3. Scale traffic spawn frequency to match current speeds
	const adaptiveSpawnInterval = Math.max(
		CONFIG.minSpawnInterval,
		CONFIG.baseSpawnInterval - state.currentSpeedModifier * 80,
	);

	const currentTime = Date.now();
	if (currentTime - state.lastSpawnTime > adaptiveSpawnInterval) {
		spawnEnemy();
		state.lastSpawnTime = currentTime;
	}

	// 4. Track layout placement positions and detect target impacts
	const playerBoundingBox = {
		x: state.playerX,
		y: CONFIG.gameHeight - CONFIG.carHeight - 20,
		width: CONFIG.carWidth,
		height: CONFIG.carHeight,
	};

	for (let i = state.enemies.length - 1; i >= 0; i--) {
		const enemy = state.enemies[i];
		enemy.y += enemy.speed + state.currentSpeedModifier * 0.5;
		enemy.element.style.top = `${enemy.y}px`;

		const enemyBoundingBox = {
			x: enemy.x,
			y: enemy.y,
			width: CONFIG.carWidth,
			height: CONFIG.carHeight,
		};

		if (checkCollision(playerBoundingBox, enemyBoundingBox)) {
			endGame();
			return;
		}

		// Clean out-of-frame DOM nodes to prevent performance degradation
		if (enemy.y > CONFIG.gameHeight) {
			enemy.element.remove();
			state.enemies.splice(i, 1);
			// Boost reward points when dodging at higher speeds
			state.score += 10 + Math.floor(state.currentSpeedModifier);
		}
	}

	// Constant passive score rewards based on runtime survival duration
	state.score += 0.05 + state.currentSpeedModifier * 0.01;
	scoreDisplay.textContent = Math.floor(state.score);

	state.animationFrameId = requestAnimationFrame(gameLoop);
}

// Initial score check on boot setup loop definitions
loadHighScore();
