"use strict";

const gameConfig = {
	maxHeroHp: 100,
	maxHeroMp: 50,
	maxBossHp: 120,
	magicCost: 20,
	healCost: 15,
	blockMpRegen: 10,
	critChance: 0.2, // 20% Critical hit probability
	critMultiplier: 1.5,
};

let hero = {
	hp: gameConfig.maxHeroHp,
	mp: gameConfig.maxHeroMp,
	attack: 16,
	attackAccuracy: 0.9, // 90% accuracy
	magicDamage: 25, // 100% accuracy guaranteed
	healValue: 25,
	shieldActive: false,
};

let boss = {
	hp: gameConfig.maxBossHp,
	attack: 18,
	attackAccuracy: 0.85, // 85% accuracy
	action: "idle",
};

let turnCount = 1;

const DOM = {
	heroHpText: document.getElementById("hero-hp-text"),
	heroMeter: document.getElementById("hero-health"),
	heroMpText: document.getElementById("hero-mp-text"),
	heroMpMeter: document.getElementById("hero-mana"),
	heroShieldBadge: document.getElementById("hero-shield-badge"),
	bossHpText: document.getElementById("boss-hp-text"),
	bossMeter: document.getElementById("boss-health"),
	bossActionBadge: document.getElementById("boss-action-badge"),
	combatLog: document.getElementById("combat-log"),
	highScoreVal: document.getElementById("high-score-val"),
	btnAttack: document.getElementById("btn-attack"),
	btnMagic: document.getElementById("btn-magic"),
	btnHeal: document.getElementById("btn-heal"),
	btnBlock: document.getElementById("btn-block"),
	btnReset: document.getElementById("btn-reset"),
};

document.addEventListener("DOMContentLoaded", () => {
	DOM.btnAttack.addEventListener("click", () => handleTurn("attack"));
	DOM.btnMagic.addEventListener("click", () => handleTurn("magic"));
	DOM.btnHeal.addEventListener("click", () => handleTurn("heal"));
	DOM.btnBlock.addEventListener("click", () => handleTurn("block"));
	DOM.btnReset.addEventListener("click", resetGame);
	loadHighScore();
	updateUI();
});

function handleTurn(playerChoice) {
	if (hero.hp <= 0 || boss.hp <= 0) return;

	hero.shieldActive = false;
	DOM.heroShieldBadge.classList.add("hidden");

	determineBossAction();

	const actionSuccess = executePlayerAction(playerChoice);

	// Only allow boss to counter if player successfully made a valid move
	if (actionSuccess && boss.hp > 0) {
		executeBossAction();
	}

	updateUI();
	checkGameStatus();
	if (actionSuccess) turnCount++;
}

function determineBossAction() {
	const roll = Math.random();
	if (roll < 0.6) {
		boss.action = "attack";
		DOM.bossActionBadge.textContent = "⚔️ Attacking (85% Acc)";
	} else if (roll < 0.85) {
		boss.action = "heavy";
		DOM.bossActionBadge.textContent = "💥 Heavy Attack (60% Acc)";
	} else {
		boss.action = "rest";
		DOM.bossActionBadge.textContent = "💤 Resting";
	}
	DOM.bossActionBadge.classList.remove("hidden");
}

function executePlayerAction(choice) {
	appendLog(`--- Turn ${turnCount} ---`, "system-msg");

	if (choice === "magic" && hero.mp < gameConfig.magicCost) {
		appendLog("Not enough Mana to cast Magic!", "boss-msg");
		return false;
	}
	if (choice === "heal" && hero.mp < gameConfig.healCost) {
		appendLog("Not enough Mana to Heal!", "boss-msg");
		return false;
	}

	switch (choice) {
		case "attack":
			if (Math.random() <= hero.attackAccuracy) {
				let damage = hero.attack;
				const isCrit = Math.random() <= gameConfig.critChance;
				if (isCrit) {
					damage = Math.floor(damage * gameConfig.critMultiplier);
					appendLog(
						`✨ CRITICAL HIT! Hero slashes Boss for ${damage} DMG!`,
						"hero-msg",
					);
				} else {
					appendLog(`Hero strikes Boss for ${damage} DMG!`, "hero-msg");
				}
				boss.hp = Math.max(0, boss.hp - damage);
			} else {
				appendLog("Hero's physical attack MISSED!", "system-msg");
			}
			break;

		case "magic":
			hero.mp -= gameConfig.magicCost;
			boss.hp = Math.max(0, boss.hp - hero.magicDamage);
			appendLog(
				`Hero casts Arcane Fire! Spell hits instantly for ${hero.magicDamage} DMG!`,
				"hero-msg",
			);
			break;

		case "heal":
			hero.mp -= gameConfig.healCost;
			hero.hp = Math.min(gameConfig.maxHeroHp, hero.hp + hero.healValue);
			appendLog(
				`Hero uses restoration magic. Recovers ${hero.healValue} HP!`,
				"hero-msg",
			);
			break;

		case "block":
			hero.shieldActive = true;
			hero.mp = Math.min(
				gameConfig.maxHeroMp,
				hero.mp + gameConfig.blockMpRegen,
			);
			DOM.heroShieldBadge.classList.remove("hidden");
			appendLog(
				`Hero focuses stance! Restored +10 MP and raised shield.`,
				"hero-msg",
			);
			break;
	}
	return true;
}

function executeBossAction() {
	let incomingDmg = 0;
	let accuracy = boss.attackAccuracy;

	if (boss.action === "rest") {
		boss.hp = Math.min(gameConfig.maxBossHp, boss.hp + 15);
		appendLog(`Boss takes a breather and recovers 15 HP.`, "boss-msg");
		return;
	}

	if (boss.action === "heavy") {
		incomingDmg = Math.floor(boss.attack * 1.6);
		accuracy = 0.6; // Heavy attack is strong but misses more often (60%)
	} else {
		incomingDmg = boss.attack;
	}

	if (Math.random() <= accuracy) {
		if (hero.shieldActive) {
			incomingDmg = Math.floor(incomingDmg / 2);
			appendLog(`Hero's active guard absorbs 50% damage!`, "system-msg");
		}
		hero.hp = Math.max(0, hero.hp - incomingDmg);
		appendLog(`Boss lands a hit! Hero takes ${incomingDmg} DMG!`, "boss-msg");
	} else {
		appendLog(`Boss swings wildly and MISSES!`, "system-msg");
	}
}

function updateUI() {
	DOM.heroHpText.textContent = hero.hp;
	DOM.bossHpText.textContent = boss.hp;
	DOM.heroMpText.textContent = hero.mp;

	DOM.heroMeter.value = hero.hp;
	DOM.bossMeter.value = boss.hp;
	DOM.heroMpMeter.value = hero.mp;

	// Dynamically disable buttons if mana criteria isn't met
	DOM.btnMagic.disabled = hero.mp < gameConfig.magicCost;
	DOM.btnHeal.disabled = hero.mp < gameConfig.healCost;
}

function checkGameStatus() {
	if (boss.hp <= 0 && hero.hp <= 0) {
		appendLog("Double Knockout! The arena crumbles.", "system-msg");
		endGame(false);
	} else if (boss.hp <= 0) {
		appendLog(
			`Victory! The Boss has been defeated in ${turnCount} turns!`,
			"hero-msg",
		);
		endGame(true);
	} else if (hero.hp <= 0) {
		appendLog("Defeat! You succumbed to the Boss.", "boss-msg");
		endGame(false);
	}
}

function endGame(isVictory) {
	DOM.btnAttack.disabled = true;
	DOM.btnMagic.disabled = true;
	DOM.btnHeal.disabled = true;
	DOM.btnBlock.disabled = true;
	DOM.btnReset.classList.remove("hidden");
	DOM.bossActionBadge.classList.add("hidden");

	if (isVictory) {
		handleScoreSavings(turnCount);
	}
}

function handleScoreSavings(score) {
	const currentRecord = localStorage.getItem("rpg_high_score");
	// Fewer turns taken means a more efficient strategic win (better score)
	if (!currentRecord || score < parseInt(currentRecord)) {
		localStorage.setItem("rpg_high_score", score);
		DOM.highScoreVal.textContent = score;
		appendLog(
			"✨ NEW HIGH SCORE! Most efficient run recorded! ✨",
			"system-msg",
		);
	}
}

function loadHighScore() {
	const currentRecord = localStorage.getItem("rpg_high_score");
	DOM.highScoreVal.textContent = currentRecord ? currentRecord : "N/A";
}

function resetGame() {
	hero.hp = gameConfig.maxHeroHp;
	hero.mp = gameConfig.maxHeroMp;
	hero.shieldActive = false;
	boss.hp = gameConfig.maxBossHp;
	boss.action = "idle";
	turnCount = 1;

	DOM.btnAttack.disabled = false;
	DOM.btnReset.classList.add("hidden");
	DOM.heroShieldBadge.classList.add("hidden");
	DOM.bossActionBadge.classList.add("hidden");

	DOM.combatLog.innerHTML = `<p class="log-entry system-msg">Match reset. Turn 1 initialized.</p>`;
	loadHighScore();
	updateUI();
}

function appendLog(text, className) {
	const p = document.createElement("p");
	p.className = `log-entry ${className}`;
	p.textContent = text;
	DOM.combatLog.appendChild(p);
	DOM.combatLog.scrollTop = DOM.combatLog.scrollHeight;
}
