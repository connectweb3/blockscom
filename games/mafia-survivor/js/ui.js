function resize() {
    // Small delay to allow browser layout to stabilize on mobile
    setTimeout(() => {
        window.scrollTo(0, 0); // Try to hide address bar
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, 100);
}

window.addEventListener('orientationchange', resize);
window.addEventListener('resize', resize);

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

    // Armor Bar Update
    // Always show armor bar
    // document.getElementById('armor-bar-container').classList.remove('hidden'); // Already visible in HTML

    let armorPct = 0;
    if (player.maxArmor > 0) {
        armorPct = (player.armor / player.maxArmor) * 100;
    }

    document.getElementById('armor-fill').style.width = armorPct + "%";
    document.getElementById('armor-text').innerText = `${Math.floor(player.armor)}/${player.maxArmor}`;

    const xpPct = (player.xp / player.nextLevelXp) * 100;
    document.getElementById('xp-fill').style.width = xpPct + "%";
    document.getElementById('lvl-text').innerText = player.level;
    document.getElementById('cash-text').innerText = Math.floor(player.cash);

    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;

    document.getElementById('cash-rate').innerText = difficultyMultiplier;
    document.getElementById('kill-count').innerText = score;

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
    document.querySelector('.hud-top').classList.remove('hidden');
    document.querySelector('.hud-bottom').classList.remove('hidden');
    document.getElementById('buff-tracker').classList.remove('hidden');

    // Reset Game Globals
    gameState = "PLAYING";
    time = 0;
    frame = 0;
    score = 0;
    difficultyMultiplier = 1;

    player = new Player();
    enemies = []; bullets = []; pickups = []; projectiles = [];
    outposts = []; // Reset outposts
    const initialOutpost = new Outpost(0, 0);
    outposts.push(initialOutpost); // Spawn initial base at 0,0

    // Spawn Player outside Outpost collision
    // Outpost size 100 (radius 50), Player size 24 (radius 12). Collision < 62.
    // Spawn at 80 to be safe.
    player.x = initialOutpost.x;
    player.y = initialOutpost.y + (initialOutpost.size / 2) + 40;
    boxQueue = 0;
    updateStackUI();

    // Do not call loop() here, as it is already running from game.js
    // If loop stopped due to errors, reload is required anyway.
}

function triggerLevelUp() {
    gameState = "LEVEL_UP";
    const screen = document.getElementById('levelup-screen');
    const container = document.getElementById('upgrade-cards');
    container.innerHTML = "";

    const upgradePool = [];

    // 1. Weapon Upgrades (Dynamic)
    const weapons = [
        { id: 'PISTOL', name: 'Pistol', desc: 'Standard Issue' },
        { id: 'GRENADE_LAUNCHER', name: 'Grenade Launcher', desc: 'Explosive Rounds' },
        { id: 'LAZER', name: 'Lazer', desc: 'Piercing Beam' },
        { id: 'FLAMETHROWER', name: 'Flamethrower', desc: 'Burn them all' },
        { id: 'THROWING_KNIFE', name: 'Assassin Knife', desc: 'Silent Killer' },
        { id: 'PSYCHIC_POWER', name: 'Psychic Power', desc: 'Mind Blast' }
    ];

    weapons.forEach(w => {
        const currentLvl = player.weaponLevels[w.id] || 0;
        if (currentLvl < 5) {
            let title, desc, type;

            if (currentLvl === 0) {
                type = "NEW WEAPON";
                title = `NEW ${w.name}`;
                desc = w.desc;
            } else {
                type = "UPGRADE";
                title = `UPGRADE ${w.name} (LVL ${currentLvl + 1})`;
                desc = "Damage +50%, Proj +1";
                if (w.id === 'FLAMETHROWER') desc = "Damage +20%, Thicker Stream";
                if (w.id === 'PSYCHIC_POWER') desc = "Targets +1, Attack Speed Up";
            }

            upgradePool.push({
                type: type,
                name: title,
                desc: desc,
                effect: () => {
                    player.weapon = w.id;
                    player.weaponLevels[w.id] = currentLvl + 1;
                    createFloatingText(player.x, player.y - 50, `${w.name} LVL ${player.weaponLevels[w.id]}`, "#fff");
                }
            });
        }
    });

    // 2. Stat Upgrades
    const stats = [
        { type: "AMMO", name: "Hollow Points", desc: "Damage +5", effect: () => player.damage += 5 },
        { type: "GEAR", name: "Running Shoes", desc: "Speed +10%", effect: () => player.speed *= 1.1 },
        { type: "GEAR", name: "Magnet", desc: "Pickup Range +1 Tile", effect: () => player.pickupRange += 60 },
        { type: "AMMO", name: "High Velocity", desc: "Bullet Speed +2", effect: () => player.bulletSpeed += 2 },
        { type: "WEAPON", name: "Dual Wield", desc: "Projectiles +1 (Global)", effect: () => player.projectileCount += 1 },
        { type: "NEW", name: "The Pineapple", desc: "Throws Grenades", effect: () => { player.hasGrenade = true; player.grenadeLevel++; } },
        { type: "NEW", name: "Spicy Cocktail", desc: "Throws Molotovs", effect: () => { player.hasMolotov = true; player.molotovLevel++; } },
        { type: "NEW", name: "Associates", desc: "Call the Boys", effect: () => { player.addAssociate(); } },
        { type: "NEW", name: "Proximity Mine", desc: "Drop Landmines", effect: () => { player.hasLandmine = true; player.landmineLevel++; } },
        { type: "NEW", name: "Spinning Knife", desc: "Orbital Protection", effect: () => player.knifeCount++ },
        { type: "NEW", name: "Throwing Axe", desc: "High Dmg Arcs", effect: () => player.axeLevel++ },
        { type: "STATS", name: "Bodyguard", desc: "Max HP +20 & Heal", effect: () => { player.maxHp += 20; player.hp += 20; } },
        { type: "AMMO", name: "Heavy Rounds", desc: "Knockback +50%", effect: () => player.knockback += 0.5 },
        { type: "STATS", name: "Adrenaline", desc: "Attack Speed +5%", effect: () => player.fireRate *= 0.95 },
        { type: "STATS", name: "Awakening", desc: "Attack Speed +15%", effect: () => player.fireRate *= 0.85 },
        { type: "GEAR", name: "Kevlar Vest", desc: "Armor +50", effect: () => { player.maxArmor += 50; player.armor += 50; } },
        { type: "STATS", name: "FULL HEAL", desc: "Full Heal HP & Armor", effect: () => { player.hp = player.maxHp; player.armor = player.maxArmor; } },

        // New Gears
        { type: "NEW", name: "Killer Instinct", desc: "AOE Damage Aura", effect: () => { player.hasKillerInstinct = true; player.killerInstinctLevel++; } },
        { type: "NEW", name: "Lightning Chain", desc: "Chain Lightning Attack", effect: () => { player.hasLightningChain = true; player.lightningChainLevel++; } },
        { type: "NEW", name: "Time Freeze", desc: "Freeze Enemies every 15s", effect: () => { player.hasTimeFreeze = true; } }
    ];

    // Merge pools
    // const fullPool = [...upgradePool, ...stats];

    // Pick 3-4 random choices (or 6 as before)
    // const choices = fullPool.sort(() => 0.5 - Math.random()).slice(0, 6);

    let choices = [];

    if (upgradePool.length > 0) {
        // 1. Pick one guaranteed weapon upgrade
        const guaranteedWeaponIndex = Math.floor(Math.random() * upgradePool.length);
        const guaranteedWeapon = upgradePool[guaranteedWeaponIndex];
        choices.push(guaranteedWeapon);

        // 2. Create a pool of the rest (remaining weapons + stats)
        const remainingWeapons = upgradePool.filter((_, index) => index !== guaranteedWeaponIndex);
        const remainingPool = [...remainingWeapons, ...stats];

        // 3. Pick 5 more random choices
        const randomExtras = remainingPool.sort(() => 0.5 - Math.random()).slice(0, 5);
        choices = [...choices, ...randomExtras];

        // 4. Shuffle the final result so the weapon isn't always first
        choices.sort(() => 0.5 - Math.random());
    } else {
        // No weapons available, just pick from stats
        choices = stats.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    choices.forEach(opt => {
        const card = document.createElement('div');
        card.className = "card";
        // Add special class for new weapons to style them if needed
        if (opt.type === "NEW WEAPON") card.style.borderColor = "#ffaa00";

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
    // Show Game Over Screen
    document.getElementById('gameover-screen').classList.remove('hidden');

    // Update Final Stats
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    document.getElementById('final-stats').innerText = `Survived: ${m}:${s}`;

    // Hide HUD
    document.querySelector('.hud-top').classList.add('hidden');
    document.querySelector('.hud-bottom').classList.add('hidden');
    document.getElementById('buff-tracker').classList.add('hidden');
    document.getElementById('safety-box-ui').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(err => {
                    console.log("Orientation lock failed: ", err);
                });
            }
        }).catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
