function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateStackUI() {
    document.getElementById('stack-dmg').innerText = player.stackDmg;
    document.getElementById('stack-hp').innerText = player.stackHp;
    document.getElementById('stack-spd').innerText = player.stackSpd;
}

function updateHUD() {
    // Fix for HP Bar Overflow
    let hpPct = (player.hp / player.maxHp) * 100;
    if (hpPct > 100) hpPct = 100;
    if (hpPct < 0) hpPct = 0;

    document.getElementById('hp-fill').style.width = hpPct + "%";
    document.getElementById('hp-text').innerText = `${Math.floor(player.hp)}/${player.maxHp}`;

    const xpPct = (player.xp / player.nextLevelXp) * 100;
    document.getElementById('xp-fill').style.width = xpPct + "%";
    document.getElementById('lvl-text').innerText = player.level;
    document.getElementById('cash-text').innerText = Math.floor(player.cash);

    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;

    document.getElementById('cash-rate').innerText = difficultyMultiplier;

    updateStatsPanel();
}

function updateStatsPanel() {
    const panel = document.getElementById('stats-panel');
    if (gameState !== "PLAYING") {
        panel.classList.add('hidden');
        return;
    }
    panel.classList.remove('hidden');

    document.getElementById('stat-weapon').innerText = `WEAPON: ${player.weapon}`;
    document.getElementById('stat-dmg').innerText = Math.floor(player.damage);
    document.getElementById('stat-fr').innerText = Math.floor(player.fireRate);
    document.getElementById('stat-spd').innerText = player.speed.toFixed(1);
    document.getElementById('stat-proj').innerText = player.projectileCount;

    const list = document.getElementById('ability-list');
    list.innerHTML = "";

    if (player.hasGrenade) list.innerHTML += `<div class="ability-item">GRENADE LVL ${player.grenadeLevel}</div>`;
    if (player.hasMolotov) list.innerHTML += `<div class="ability-item">MOLOTOV LVL ${player.molotovLevel}</div>`;
    if (player.hasLandmine) list.innerHTML += `<div class="ability-item">LANDMINE LVL ${player.landmineLevel}</div>`;
    if (player.knifeCount > 0) list.innerHTML += `<div class="ability-item">KNIVES: ${player.knifeCount}</div>`;
    if (player.axeLevel > 0) list.innerHTML += `<div class="ability-item">AXE LVL ${player.axeLevel}</div>`;
    if (player.associateCount > 0) list.innerHTML += `<div class="ability-item">ASSOCIATES: ${player.associateCount}</div>`;
}

// --- NON-BLOCKING SAFETY BOX LOGIC ---

function addSafetyBoxToQueue() {
    boxQueue++;
    const ui = document.getElementById('safety-box-ui');
    ui.classList.remove('hidden');
    document.getElementById('box-pending').innerText = `PENDING: ${boxQueue}`;
}

function processSafetyBox() {
    boxIsSpinning = true;
    boxQueue--; // Decrement one from queue
    document.getElementById('box-pending').innerText = `PENDING: ${boxQueue}`;

    const text = document.getElementById('spinner-text');

    // Prizes (Nuke Removed, Cash Reduced)
    const prizes = [
        { txt: "FULL HEAL", c: "#0f0", fn: () => { player.hp = player.maxHp; createFloatingText(player.x, player.y - 30, "FULL HEAL!", "#0f0"); } },
        { txt: "+5 DAMAGE", c: "#f00", fn: () => { player.damage += 5; createFloatingText(player.x, player.y - 30, "DMG UP!", "#f00"); } },
        { txt: "ATTACK SPEED UP", c: "#ff0", fn: () => { player.fireRate *= 0.8; createFloatingText(player.x, player.y - 30, "ATK SPD UP!", "#ff0"); } },
        { txt: "+100 CASH", c: "#88ff88", fn: () => { player.gainXp(100); createFloatingText(player.x, player.y - 30, "+100 CASH!", "#8f8"); } }
    ];

    let spins = 0;
    const maxSpins = 20;

    const spinInterval = setInterval(() => {
        const rand = prizes[Math.floor(Math.random() * prizes.length)];
        text.innerText = rand.txt;
        text.style.color = rand.c;
        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            // Select final prize
            const finalPrize = prizes[Math.floor(Math.random() * prizes.length)];
            text.innerText = finalPrize.txt;
            text.style.color = finalPrize.c;
            text.style.transform = "scale(1.2)";

            // Award Prize
            finalPrize.fn();

            // Delay before next box or closing
            setTimeout(() => {
                text.style.transform = "scale(1)";
                boxIsSpinning = false;

                if (boxQueue === 0) {
                    document.getElementById('safety-box-ui').classList.add('hidden');
                }
            }, 1000);
        }
    }, 100);
}

function connectWallet() {
    const status = document.getElementById('wallet-status');
    status.innerText = "INITIALIZING...";
    setTimeout(() => {
        if (window.ethereum) { status.innerText = "METAMASK DETECTED"; status.style.color = "#88ff88"; }
        else { status.innerText = "NO WALLET DETECTED."; status.style.color = "#ff5555"; }
    }, 1000);
}

function startGame() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.querySelector('.hud-top').classList.remove('hidden');
    document.querySelector('.hud-bottom').classList.remove('hidden');
    document.getElementById('buff-tracker').classList.remove('hidden');
    gameState = "PLAYING";
    player = new Player();
    enemies = []; bullets = []; pickups = []; projectiles = [];
    outposts = []; // Reset outposts
    outposts.push(new Outpost(player.x, player.y)); // Spawn initial base
    boxQueue = 0;
    updateStackUI();
    loop();
}

function triggerLevelUp() {
    gameState = "LEVEL_UP";
    const screen = document.getElementById('levelup-screen');
    const container = document.getElementById('upgrade-cards');
    container.innerHTML = "";

    const upgradePool = [
        { type: "WEAPON", name: "Tommy Drum", desc: "Attack Speed +15%", effect: () => player.fireRate = Math.max(5, player.fireRate * 0.85) },
        { type: "AMMO", name: "Hollow Points", desc: "Damage +5", effect: () => player.damage += 5 },
        { type: "GEAR", name: "Running Shoes", desc: "Speed +10%", effect: () => player.speed *= 1.1 },
        { type: "GEAR", name: "Magnet", desc: "Pickup Range +20%", effect: () => player.pickupRange *= 1.2 },
        { type: "AMMO", name: "High Velocity", desc: "Bullet Speed +", effect: () => player.bulletSpeed += 2 },
        { type: "WEAPON", name: "Dual Wield", desc: "Projectiles +1", effect: () => player.projectileCount += 1 },
        { type: "NEW", name: "The Pineapple", desc: "Throws Grenades", effect: () => { player.hasGrenade = true; player.grenadeLevel++; } },
        { type: "NEW", name: "Spicy Cocktail", desc: "Throws Molotovs", effect: () => { player.hasMolotov = true; player.molotovLevel++; } },
        { type: "NEW", name: "Associates", desc: "Call the Boys", effect: () => { player.addAssociate(); } },
        { type: "NEW", name: "Proximity Mine", desc: "Drop Landmines", effect: () => { player.hasLandmine = true; player.landmineLevel++; } },
        { type: "WEAPON", name: "Bazooka", desc: "Explosive Rounds", effect: () => player.weapon = 'BAZOOKA' },
        { type: "WEAPON", name: "Lazer Beam", desc: "High Tech Piercing", effect: () => player.weapon = 'LAZER' },
        { type: "WEAPON", name: "Submachine Gun", desc: "High Fire Rate, Low Dmg", effect: () => player.weapon = 'SUBMACHINE_GUN' },
        { type: "NEW", name: "Spinning Knife", desc: "Orbital Protection", effect: () => player.knifeCount++ },
        { type: "NEW", name: "Throwing Axe", desc: "High Dmg Arcs", effect: () => player.axeLevel++ },
        { type: "STATS", name: "Bodyguard", desc: "Max HP +20 & Heal", effect: () => { player.maxHp += 20; player.hp += 20; } },
        { type: "AMMO", name: "Heavy Rounds", desc: "Knockback +50%", effect: () => player.knockback += 0.5 },
        { type: "STATS", name: "Adrenaline", desc: "Attack Speed +5%", effect: () => player.fireRate *= 0.95 },
        { type: "GEAR", name: "Kevlar Vest", desc: "Heal 20 HP", effect: () => player.hp = Math.min(player.maxHp, player.hp + 20) }
    ];

    const choices = upgradePool.sort(() => 0.5 - Math.random()).slice(0, 6);

    choices.forEach(opt => {
        const card = document.createElement('div');
        card.className = "card";
        card.innerHTML = `<span class="type">${opt.type}</span><h3>${opt.name}</h3><p>${opt.desc}</p>`;
        card.onclick = () => {
            opt.effect();
            screen.classList.add('hidden');
            gameState = "PLAYING";
        };
        container.appendChild(card);
    });
    screen.classList.remove('hidden');
}

function endGame() {
    gameState = "GAME_OVER";
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    document.getElementById('final-stats').innerText = `You Survived ${m}:${s} and reached Level ${player.level}`;
    document.getElementById('gameover-screen').classList.remove('hidden');
    document.getElementById('gameover-screen').classList.remove('hidden');
    document.querySelector('.hud-top').classList.add('hidden');
    document.querySelector('.hud-bottom').classList.add('hidden');
    document.getElementById('buff-tracker').classList.add('hidden');
    document.getElementById('safety-box-ui').classList.add('hidden');
}
