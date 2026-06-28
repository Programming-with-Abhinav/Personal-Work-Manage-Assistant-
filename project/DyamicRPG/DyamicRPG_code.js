const hero = {
	hp: 100,
	attack: 16,
	shieldactive: true,
};

const boss = {
	hp: 120,
	attack: 18,
	action: "unblock",
};

if (hero.shieldactive) {
	hero.hp -= boss.attack / 2;
	console.log(`Hero blocked! Hero HP is now ${hero.hp}`);
} else {
	hero.hp -= boss.attack;
	console.log(`Hero hit! Hero HP is now${hero.hp}`);
}

if (boss.action === "block") {
	boss.hp -= hero.attack / 2;
	console.log(`Boss Blocked! Boss HP is now: ${boss.hp}`);
} else {
	boss.hp -= hero.attack;
	console.log(`Boss hit! Boss HP is now: ${boss.hp}`);
}
