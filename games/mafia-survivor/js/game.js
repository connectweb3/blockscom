/**
 * GAME CONFIG & ENGINE
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load Assets
// characterSprite moved to Visuals


window.addEventListener('resize', resize);
resize();
Visuals.init();

// Game States: LOGIN, PLAYING, LEVEL_UP, GAME_OVER
let gameState = "LOGIN";
let frame = 0;
let score = 0;
let time = 0;

// Safety Box Logic
let boxQueue = 0;
let boxIsSpinning = false;

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Weapon Switching Keys
window.addEventListener('keydown', e => {
    if (e.key === '1') player.switchWeapon(0);
    if (e.key === '2') player.switchWeapon(1);
    if (e.key === '3') player.switchWeapon(2);
});

// UI Event Listeners
const buildTowerBtn = document.getElementById('build-tower-btn');
if (buildTowerBtn) {
    buildTowerBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent focus/default issues
        e.stopPropagation();
        console.log("Build Tower Button Clicked (Listener)");
        buildTower();
    });
    // Add touch support just in case
    buildTowerBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent ghost clicks
        e.stopPropagation();
        console.log("Build Tower Button Touched");
        buildTower();
    });
}

// --- CLASSES ---

let difficultyMultiplier = 1;
let dropMultiplier = 1;
let lastDifficultyIncrease = 0;
let lastBossSpawn = 0;
let lastBomberSpawn = 0;

// --- OPTIMIZATION UTILS ---

class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    getKey(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        // Pack coordinates into a single integer (assuming world isn't massive)
        // Supports -32768 to 32767 for both x and y grid coordinates
        return (cx & 0xFFFF) << 16 | (cy & 0xFFFF);
    }

    add(entity) {
        const key = this.getKey(entity.x, entity.y);
        let cell = this.grid.get(key);
        if (!cell) {
            cell = [];
            this.grid.set(key, cell);
        }
        cell.push(entity);
    }

    // Get entities in the same cell and adjacent cells (3x3 area)
    query(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        let results = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // Manually calculate key to avoid function call overhead if needed, 
                // but getKey is fast enough.
                const key = ((cx + i) & 0xFFFF) << 16 | ((cy + j) & 0xFFFF);
                const cell = this.grid.get(key);
                if (cell) {
                    // Use a loop to push to avoid concat creation if possible, 
                    // but concat is okay. For max perf, push individually.
                    for (let k = 0; k < cell.length; k++) {
                        results.push(cell[k]);
                    }
                }
            }
        }
        return results;
    }
}

const enemyGrid = new SpatialGrid(150);

function isOnScreen(e, buffer = 100) {
    const size = e.size || 0;
    return e.x + size + buffer > camera.x &&
        e.x - size - buffer < camera.x + canvas.width &&
        e.y + size + buffer > camera.y &&
        e.y - size - buffer < camera.y + canvas.height;
}

class Enemy {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.size = 20;
        this.type = type; // 0: Thug, 1: Brute, 2: Boss, 3: Bomber
        this.speed = (1.5 - (type * 0.2)) * 0.5;
        this.hp = (15 + (player.level * 2) + (type * 25)) * difficultyMultiplier;
        this.damage = (5 + (type * 5)) * difficultyMultiplier;
        this.flash = 0;

        // Boss Specifics
        if (this.type === 2) {
            this.hp = (300 + (player.level * 50)) * difficultyMultiplier; // 20x HP roughly
            this.size = 40;
            this.speed = 0.4;
            this.shootTimer = 0;
        }

        // Bomber Specifics
        if (this.type === 3) {
            this.hp = (10 + (player.level * 2)) * difficultyMultiplier; // Low HP
            this.speed = 1.75; // Fast
            this.size = 18;
            this.color = "#ff0000";
        }

        // Status Effects
        this.isBurning = false;
        this.burnDamage = 0;
        this.burnTick = 0;
        this.dead = false;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        // Bomber Logic
        if (this.type === 3) {
            if (dist < 40) { // Explode range
                this.hp = 0;
                explosions.push(new Explosion(this.x, this.y, 80, 50 * difficultyMultiplier));
                return;
            }
        }

        // Boss Logic
        if (this.type === 2) {
            this.shootTimer++;
            if (this.shootTimer > 120) { // Fire every 2 seconds
                this.shootTimer = 0;
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                // Enemy Bullet
                bullets.push(new Bullet(this.x, this.y, angle, 10 * difficultyMultiplier, 2, 0, 6, "#ff0000"));
                // Note: We need to make sure bullets don't hurt other enemies or distinguish them.
                // Currently Bullet class hurts enemies. We might need an 'owner' or 'target' tag.
                // For simplicity, let's assume these bullets hurt player.
                // WAIT: The current Bullet class ONLY checks collision with enemies in checkCollisions().
                // We need to update Bullet or checkCollisions to handle enemy bullets hitting player.
                // Let's add an 'isEnemy' flag to Bullet.
                bullets[bullets.length - 1].isEnemy = true;
            }
        }

        // Check collision with Outposts (Base)
        for (let o of outposts) {
            if (Math.hypot(this.x - o.x, this.y - o.y) < (this.size + o.size) / 2) {
                o.takeDamage(this.damage * 0.1); // Reduced damage to base so it lasts a bit
                this.x -= Math.cos(angle) * 10; // Bounce back slightly
                this.y -= Math.sin(angle) * 10;

                // Visual feedback
                createFloatingText(o.x, o.y - 50, "BASE UNDER ATTACK!", "#ff0000");
            }
        }

        if (dist < (this.size + player.size) / 2) {
            player.takeDamage(this.damage);
            this.x -= Math.cos(angle) * 30;
            this.y -= Math.sin(angle) * 30;
        }
        if (this.flash > 0) this.flash--;

        // Burn Logic
        if (this.isBurning) {
            this.burnTick++;
            if (this.burnTick % 30 === 0) { // Tick every 0.5 seconds
                this.hp -= this.burnDamage;
                // Visual Burn Tick
                createFloatingText(this.x, this.y - 20, Math.floor(this.burnDamage), "#ff5500");
                if (this.hp <= 0) {
                    this.takeHit(0, 0, this.x, this.y); // Trigger death logic
                }
            }
            // Burn Particles
            if (Math.random() < 0.1) {
                particles.push(new Particle(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, "#ff5500", 1, 20, 3));
            }
        }
    }

    takeHit(dmg, knockback, sx, sy) {
        this.hp -= dmg;
        this.flash = 3;
        const angle = Math.atan2(this.y - sy, this.x - sx);
        this.x += Math.cos(angle) * (knockback * 10);
        this.y += Math.sin(angle) * (knockback * 10);

        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            score++;
            // DROP LOGIC
            // Safety Box: Only high level enemies, 0.5% chance
            if (this.type >= 1 && Math.random() < 0.005) {
                pickups.push(new Pickup(this.x, this.y, 'BOX'));
            }
            // Stat Drops (8% chance each)
            else if (Math.random() < 0.08) { pickups.push(new Pickup(this.x, this.y, 'DMG')); }
            else if (Math.random() < 0.08) { pickups.push(new Pickup(this.x, this.y, 'HP')); }
            else if (Math.random() < 0.08) { pickups.push(new Pickup(this.x, this.y, 'SPD')); }
            // Cash (Standard)
            else {
                // Drop Cash (Green Bills)
                spawnPickup(this.x, this.y, 'CASH', (10 + this.type * 10) * difficultyMultiplier * dropMultiplier);
                // Small chance for XP as well or just give XP on kill automatically?
                // Let's drop XP orbs separately or just give XP on kill.
                // For now, let's drop XP orbs too but less frequently or as a separate drop.
                spawnPickup(this.x + 5, this.y, 'XP', (5 + this.type * 5) * difficultyMultiplier * dropMultiplier);
            }
        }
    }

    draw() {
        Visuals.drawEnemy(ctx, this, frame);
    }
}

class Pickup {
    constructor(x, y, type, value = 0) {
        this.x = x; this.y = y;
        this.type = type; // XP, CASH, DMG, HP, SPD, BOX
        this.value = value;
        this.magnetized = false;
        this.size = 10;
        // Expiration for CASH and XP (2 minutes @ 60fps)
        this.life = (type === 'CASH' || type === 'XP') ? 7200 : Infinity;
    }

    update() {
        // Expiration Logic
        if (this.life !== Infinity) {
            this.life--;
            if (this.life <= 0) return true; // Remove if expired
        }

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        // Magnetize only works on XP, Buffs sit still
        // Magnetize all drops if within range
        if (dist < player.pickupRange) this.magnetized = true;

        if (this.magnetized) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const speed = (this.type === 'XP' || this.type === 'CASH') ? 5 : 2;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;

            if (dist < 10) {
                if (this.type === 'XP') player.gainXp(this.value);
                else if (this.type === 'CASH') player.gainCash(this.value);
                else if (this.type === 'DMG') player.applyStack('dmg');
                else if (this.type === 'HP') player.applyStack('hp');
                else if (this.type === 'SPD') player.applyStack('spd');
                else if (this.type === 'BOX') addSafetyBoxToQueue();
                return true;
            }
        }
        return false;
    }

    draw() {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        if (this.type === 'XP') {
            const size = 3 + Math.min(this.value / 10, 5);
            ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI * 2); ctx.fill(); // Neon Pink
            ctx.strokeStyle = "#fff"; ctx.stroke();
        }
        else if (this.type === 'CASH') {
            const w = 12 + Math.min(this.value / 10, 8);
            const h = 6 + Math.min(this.value / 20, 4);
            ctx.fillStyle = "#85bb65"; ctx.fillRect(this.x - w / 2, this.y - h / 2, w, h);
            ctx.strokeRect(this.x - w / 2, this.y - h / 2, w, h);
            ctx.fillStyle = "#004400"; ctx.font = "8px sans-serif"; ctx.fillText("$", this.x - 2, this.y + 2.5);
        }
        else if (this.type === 'BOX') {
            ctx.fillStyle = "#ffd700"; ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
            ctx.strokeRect(this.x - 8, this.y - 8, 16, 16);
            ctx.fillStyle = "#000"; ctx.font = "10px sans-serif"; ctx.fillText("?", this.x - 3, this.y + 4);
        }
        else {
            if (this.type === 'DMG') ctx.fillStyle = "#ff5555";
            if (this.type === 'HP') ctx.fillStyle = "#ff88ff";
            if (this.type === 'SPD') ctx.fillStyle = "#55ffff";

            // Glow Effect
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;

            ctx.beginPath(); ctx.rect(this.x - 6, this.y - 6, 12, 12);
            ctx.fill(); ctx.stroke();

            ctx.restore(); // Reset shadow

            ctx.fillStyle = "#000"; ctx.font = "8px sans-serif";
            let txt = this.type === 'DMG' ? 'D' : (this.type === 'HP' ? 'H' : 'S');
            ctx.fillText(txt, this.x - 3, this.y + 3);
        }
    }
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y; this.text = text; this.color = color;
        this.life = 40;
        this.size = 20;
    }
    update() { this.y -= 1; this.life--; }
    draw() {
        ctx.fillStyle = this.color;
        ctx.font = "10px 'Press Start 2P'";
        ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
    }
}

class Particle {
    constructor(x, y, color, speed, life, size) {
        this.x = x; this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * speed;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.life = life;
        this.maxLife = life;
        this.size = size;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.95; // Shrink
    }
    draw() {
        Visuals.drawParticle(ctx, this);
    }
}

class Bullet {
    constructor(x, y, angle, damage, speed, knockback, size = 4, color = "#ffff00", isEnemy = false, type = 'normal') {
        this.x = x; this.y = y; this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.damage = damage; this.knockback = knockback; this.size = size; this.color = color; this.life = 60; this.dead = false;
        this.trail = [];
        this.isEnemy = isEnemy;
        this.type = type;
    }
    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 5) this.trail.shift(); // Shorter, tighter trail
        this.x += this.vx; this.y += this.vy;
        this.life--; if (this.life <= 0) this.dead = true;
    }

    draw() {
        Visuals.drawBullet(ctx, this);
    }
}

class Explosion {
    constructor(x, y, r, d) {
        this.x = x; this.y = y; this.r = r; this.d = d;
        this.l = 30; // Longer life for animation
        this.maxLife = 30;

        // Damage Enemies
        const nearby = enemyGrid.query(x, y);
        nearby.forEach(e => {
            if (e.hp > 0 && Math.hypot(e.x - x, e.y - y) < r) e.takeHit(d, 4, x, y);
        });

        // Spawn Debris/Particles
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const pSize = Math.random() * 6 + 2;
            const pColor = Math.random() < 0.5 ? "#ffaa00" : (Math.random() < 0.5 ? "#ff5500" : "#888888");

            // Create particle manually since Particle constructor might be simple
            // Assuming Particle(x, y, color, speed, life, size)
            // We need to calculate vx/vy here if Particle constructor does it, or just pass speed.
            // Particle constructor: constructor(x, y, color, speed, life, size)
            particles.push(new Particle(x, y, pColor, speed, 40, pSize));
        }
    }
    update() { this.l--; }
    draw() { Visuals.drawExplosion(ctx, this); }
}

class Grenade {
    constructor(x, y, tx, ty, damage) {
        this.x = x; this.y = y;
        this.tx = tx; this.ty = ty;
        this.damage = damage;
        this.p = 0; // Progress
        this.dead = false;
    }
    update() {
        this.p += 0.02;
        this.x += (this.tx - this.x) * 0.02;
        this.y += (this.ty - this.y) * 0.02;

        // Arc height
        const height = 20 * Math.sin(this.p * Math.PI);

        if (this.p >= 1) {
            this.dead = true;
            explosions.push(new Explosion(this.x, this.y, 80, this.damage));
        }
    }
    draw() {
        const height = 20 * Math.sin(this.p * Math.PI);
        ctx.fillStyle = "#225522";
        ctx.beginPath();
        ctx.arc(this.x, this.y - height, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class MolotovBottle {
    constructor(x, y, tx, ty, d) { this.x = x; this.y = y; this.tx = tx; this.ty = ty; this.d = d; this.p = 0; this.dead = false; }
    update() { this.p += 0.02; this.x += (this.tx - this.x) * 0.02; this.y += (this.ty - this.y) * 0.02; if (this.p >= 1) { this.dead = true; aoeEffects.push(new FirePool(this.x, this.y, this.d)); } }
    draw() { ctx.fillStyle = "#a40"; ctx.fillRect(this.x - 3, this.y - 15 * Math.sin(this.p * Math.PI), 6, 10); }
}

class FirePool {
    constructor(x, y, d) { this.x = x; this.y = y; this.d = d; this.l = 300; this.r = 40; }
    update() {
        this.l--;

        // Damage Logic
        if (this.l % 30 === 0) {
            const nearby = enemyGrid.query(this.x, this.y);
            nearby.forEach(e => {
                if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) < this.r) e.takeHit(this.d, 0, this.x, this.y);
            });
        }

        // Particle Spawning
        if (frame % 5 === 0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.r;
            const px = this.x + Math.cos(angle) * dist;
            const py = this.y + Math.sin(angle) * (dist / 2); // Flattened for perspective

            // Fire colors: Yellow -> Orange -> Red
            const colors = ["#ffff00", "#ffaa00", "#ff5500"];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Upward drift
            const p = new Particle(px, py, color, 1, 40, Math.random() * 4 + 2);
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = -Math.random() * 1.5 - 0.5; // Move up
            particles.push(p);
        }
    }
    draw() { Visuals.drawFirePool(ctx, this); }
}

class Landmine {
    constructor(x, y, damage) {
        this.x = x; this.y = y; this.damage = damage; this.dead = false; this.r = 15;
        this.blinkTimer = 0;
    }
    update() {
        this.blinkTimer++;
        // Check collision with enemies
        const nearby = enemyGrid.query(this.x, this.y);
        for (let e of nearby) {
            if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) < this.r + e.size) {
                this.dead = true;
                explosions.push(new Explosion(this.x, this.y, 100, this.damage));
                break;
            }
        }
    }
    draw() {
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI * 2); ctx.fill();

        // Blinking light
        if (Math.floor(this.blinkTimer / 30) % 2 === 0) {
            ctx.fillStyle = "#f00";
            ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill();

            // Glow effect
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.beginPath(); ctx.arc(this.x, this.y, 12, 0, Math.PI * 2); ctx.fill();
        }
    }
}

class Knife {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.angle = 0;
        this.dist = 60;
        this.damage = 20;
        this.x = 0; this.y = 0;
    }
    update() {
        this.angle += 0.05; // Spin speed
        const offset = (Math.PI * 2 / this.total) * this.index;
        this.x = player.x + Math.cos(this.angle + offset) * this.dist;
        this.y = player.y + Math.sin(this.angle + offset) * this.dist;

        // Collision
        const nearby = enemyGrid.query(this.x, this.y);
        nearby.forEach(e => {
            if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) < e.size + 10) {
                e.takeHit(this.damage, 2, player.x, player.y);
                // Visual Spark
                particles.push(new Particle(this.x, this.y, "#fff", 2, 5, 2));
            }
        });
    }
    draw() {
        Visuals.drawKnife(ctx, this);
    }
}

class Axe {
    constructor(x, y, tx, ty, damage) {
        this.x = x; this.y = y;
        this.damage = damage;
        this.rotation = 0;

        // Arc Logic
        const dist = Math.hypot(tx - x, ty - y);
        const angle = Math.atan2(ty - y, tx - x);
        this.vx = Math.cos(angle) * 6;
        this.vy = Math.sin(angle) * 6;
        this.life = 60; // 1 second flight
        this.dead = false;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.3;
        this.life--;
        if (this.life <= 0) this.dead = true;

        // Collision (Pierce)
        const nearby = enemyGrid.query(this.x, this.y);
        nearby.forEach(e => {
            if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) < e.size + 15) {
                e.takeHit(this.damage, 5, this.x, this.y);
                // Blood/Spark
                particles.push(new Particle(e.x, e.y, "#a00", 2, 10, 3));
            }
        });
    }
    draw() {
        Visuals.drawAxe(ctx, this);
    }
}



// --- INSTANCES ---
let player = new Player();
let camera = new Camera();
var bullets = [], enemies = [], pickups = [], projectiles = [], explosions = [], aoeEffects = [], floatingTexts = [], particles = [], outposts = [], towers = [];
var knives = [], axes = [];

// --- SYSTEMS ---

function getNearestEnemy(x, y) {
    let nearest = null; let minDist = Infinity;
    for (let e of enemies) {
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < minDist) { minDist = dist; nearest = e; }
    }
    return { enemy: nearest, dist: minDist };
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push(new FloatingText(x, y, text, color));
}

function spawnPickup(x, y, type, value) {
    // Only merge CASH and XP
    if (type === 'CASH' || type === 'XP') {
        for (let p of pickups) {
            if (p.type === type && Math.hypot(p.x - x, p.y - y) < 50) {
                p.value += value;
                p.life = 7200; // Reset expiration timer on merge
                // Reset magnet to give player a chance to pick up the bigger pile if they are close
                // p.magnetized = false; 
                return;
            }
        }
    }
    pickups.push(new Pickup(x, y, type, value));
}

function spawnEnemy() {
    const spawnRate = Math.max(10, 80 - (frame / 100));
    if (frame % Math.floor(spawnRate) === 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
        const ex = player.x + Math.cos(angle) * dist;
        const ey = player.y + Math.sin(angle) * dist;
        let type = 0;
        if (frame > 1200 && Math.random() < 0.3) type = 1;
        // Standard Boss (Type 2) replaced by timed spawn, but keep random chance for later game?
        // Let's remove random boss spawn and stick to timer for now as requested.
        // if (frame > 3600 && Math.random() < 0.1) type = 2; 
        enemies.push(new Enemy(ex, ey, type));
    }

    // Timed Spawns (Every 30s)
    // 30s = 1800 frames
    if (time > 0 && time % 30 === 0) {
        // Boss
        if (time !== lastBossSpawn) {
            lastBossSpawn = time;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
            enemies.push(new Enemy(player.x + Math.cos(angle) * dist, player.y + Math.sin(angle) * dist, 2));
            createFloatingText(player.x, player.y - 80, "BOSS SPAWNED!", "#ff0000");
        }
        // Bomber
        if (time !== lastBomberSpawn) {
            lastBomberSpawn = time;
            const angle = Math.random() * Math.PI * 2; // Different angle maybe?
            const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
            enemies.push(new Enemy(player.x + Math.cos(angle + 1) * dist, player.y + Math.sin(angle + 1) * dist, 3));
            createFloatingText(player.x, player.y - 60, "BOMBER INCOMING!", "#ff5500");
        }
    }
}

function checkCollisions() {
    // 1. Rebuild Grid
    enemyGrid.clear();
    enemies.forEach(e => enemyGrid.add(e));

    // 2. Bullet Collisions
    bullets.forEach(b => {
        if (b.dead) return;

        if (b.isEnemy) {
            // Check collision with player
            if (Math.hypot(b.x - player.x, b.y - player.y) < player.size / 2 + b.size) {
                player.takeDamage(b.damage);
                b.dead = true;
            }
        } else {
            // Check collision with enemies using Grid
            const nearbyEnemies = enemyGrid.query(b.x, b.y);
            for (let e of nearbyEnemies) {
                if (e.hp > 0 && Math.hypot(b.x - e.x, b.y - e.y) < e.size + b.size) {
                    e.takeHit(b.damage, b.knockback, b.x, b.y);
                    b.dead = true;

                    if (b.type === 'explosive') {
                        explosions.push(new Explosion(b.x, b.y, 120, b.damage));
                    }

                    if (b.type === 'FLAME') {
                        e.isBurning = true;
                        // Burn damage = 20% of hit damage per tick (0.5s), min 1
                        e.burnDamage = Math.max(1, b.damage * 0.2);
                    }

                    // Impact Particles
                    for (let i = 0; i < 5; i++) {
                        particles.push(new Particle(b.x, b.y, "#ffff00", 2, 15, 3));
                    }
                    break; // Bullet hits one enemy and dies (unless piercing?)
                }
            }
        }
    });

    // 3. Cleanup Dead Entities (In-place to reduce GC)
    // Helper to remove dead items (Swap and Pop for O(1) - Order not preserved but much faster)
    function removeDead(arr, checkFn) {
        let i = arr.length;
        while (i--) {
            if (checkFn(arr[i])) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
            }
        }
    }

    removeDead(enemies, e => e.hp <= 0);
    removeDead(bullets, b => b.dead);
    removeDead(pickups, p => p.update()); // update returns true if picked up
    removeDead(projectiles, p => { p.update(); return p.dead; });
    removeDead(explosions, e => { e.update(); return e.l <= 0; });
    removeDead(aoeEffects, a => { a.update(); return a.l <= 0; });
    removeDead(floatingTexts, t => { t.update(); return t.life <= 0; });

    // Limit particles to prevent lag
    if (particles.length > 200) {
        // Remove oldest (start of array) - splice is O(N) but only runs when over limit
        // Since we want to keep newest, and removeDead scrambles order, we might lose "oldest" concept if we use removeDead on particles.
        // Actually, removeDead iterates backwards.
        // Let's just hard limit.
        particles.length = 200;
    }
    removeDead(particles, p => { p.update(); return p.life <= 0; });

    outposts.forEach(o => {
        o.update();
        if (o.hp <= 0) {
            // Game Over
            gameState = "GAME_OVER";
            createFloatingText(player.x, player.y, "BASE DESTROYED!", "#ff0000");
            endGame(); // Assuming endGame exists or we trigger it
        }
    });
    towers.forEach(t => t.update());
    knives.forEach(k => k.update());
    removeDead(axes, a => { a.update(); return a.dead; });
}


// --- ERROR HANDLING ---

function logError(error) {
    const msg = error.message || error.toString();
    // Filter known external extension errors
    if (msg.includes("initEternlDomAPI") || msg.includes("tabReply")) return;

    console.error(error);
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        debugConsole.classList.remove('hidden');
        debugConsole.innerText += `\n[ERROR] ${msg}`;
        // Auto-scroll to bottom
        debugConsole.scrollTop = debugConsole.scrollHeight;
    }
}

window.onerror = function (message, source, lineno, colno, error) {
    logError(`Global Error: ${message} at ${source}:${lineno}:${colno}`);
    return false; // Let default handler run too
};

// Filter console warnings
const originalWarn = console.warn;
console.warn = function (...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('tabReply')) return;
    originalWarn.apply(console, args);
};

// --- GAME LOOP ---

function update() {
    if (gameState !== "PLAYING") return;
    frame++;
    time = Math.floor(frame / 60);

    // Drop Multiplier: +10% every minute
    dropMultiplier = 1 + (Math.floor(time / 60) * 0.1);

    // Difficulty Scaling: Double every 5 minutes (300 seconds)
    if (time > 0 && time % 300 === 0 && time !== lastDifficultyIncrease) {
        difficultyMultiplier *= 2;
        lastDifficultyIncrease = time;
        createFloatingText(player.x, player.y - 50, "DIFFICULTY DOUBLED!", "#ff0000");
    }

    player.update();
    camera.follow(player);
    spawnEnemy();
    enemies.forEach(e => e.update());
    bullets.forEach(b => b.update());
    checkCollisions();
    updateHUD();

    // Handle Box Queue (Non-blocking)
    if (boxQueue > 0 && !boxIsSpinning) {
        processSafetyBox();
    }

    // Check Outpost Interaction
    checkOutpostInteraction();
}

function checkOutpostInteraction() {
    let nearOutpost = false;
    let targetOutpost = null;

    for (let o of outposts) {
        if (Math.hypot(player.x - o.x, player.y - o.y) < 100) {
            nearOutpost = true;
            targetOutpost = o;
            break;
        }
    }

    const btn = document.getElementById('upgrade-btn');
    if (nearOutpost) {
        btn.classList.remove('hidden');
        btn.onclick = () => targetOutpost.upgrade();
        btn.innerText = `UPGRADE ($${targetOutpost.upgradeCost})`;
    } else {
        btn.classList.add('hidden');
    }

    // Check Territory for Building Towers
    let inTerritory = false;
    for (let o of outposts) {
        // Square check (radius is half-width)
        if (Math.abs(player.x - o.x) < o.territoryRadius && Math.abs(player.y - o.y) < o.territoryRadius) {
            inTerritory = true;
            break;
        }
    }

    const buildBtn = document.getElementById('build-tower-btn');
    if (inTerritory && !nearOutpost) { // Don't show if upgrading outpost
        buildBtn.classList.remove('hidden');
    } else {
        buildBtn.classList.add('hidden');
    }
}


function buildTower() {
    console.log("buildTower called");
    const cost = 200;

    if (player.cash < cost) {
        createFloatingText(player.x, player.y - 40, "NEED $200!", "#ff5555");
        return;
    }

    // Find nearest outpost
    let nearestOutpost = null;
    let minDist = Infinity;
    for (let o of outposts) {
        const d = Math.hypot(player.x - o.x, player.y - o.y);
        if (d < minDist) {
            minDist = d;
            nearestOutpost = o;
        }
    }

    if (!nearestOutpost) return;

    // Define Slots (Same as Visuals)
    const radius = nearestOutpost.territoryRadius;
    const slots = [
        { dx: -radius, dy: -radius }, { dx: 0, dy: -radius }, { dx: radius, dy: -radius },
        { dx: radius, dy: 0 },
        { dx: radius, dy: radius }, { dx: 0, dy: radius }, { dx: -radius, dy: radius },
        { dx: -radius, dy: 0 }
    ];

    let validSlot = null;
    let slotDist = Infinity;

    // Check if player is near a valid, empty slot
    for (let slot of slots) {
        const sx = nearestOutpost.x + slot.dx;
        const sy = nearestOutpost.y + slot.dy;
        const d = Math.hypot(player.x - sx, player.y - sy);

        // Check if occupied
        let occupied = false;
        for (let t of towers) {
            if (Math.hypot(t.x - sx, t.y - sy) < 20) {
                occupied = true;
                break;
            }
        }

        if (!occupied && d < 40) { // Must be within 40px of the slot center
            if (d < slotDist) {
                slotDist = d;
                validSlot = { x: sx, y: sy };
            }
        }
    }

    if (validSlot) {
        player.cash -= cost;
        towers.push(new Tower(validSlot.x, validSlot.y));
        createFloatingText(player.x, player.y - 40, "TOWER BUILT!", "#44ff44");
        updateHUD();
    } else {
        createFloatingText(player.x, player.y - 40, "STAND ON A SLOT!", "#ff5555");
    }
}

function draw() {
    if (gameState === "LOGIN") return;
    ctx.fillStyle = "#1e1e1e"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFloor();

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    aoeEffects.forEach(a => { if (isOnScreen(a, 50)) a.draw(); });
    outposts.forEach(o => { if (isOnScreen(o, 60)) o.draw(); });
    towers.forEach(t => { if (isOnScreen(t, 30)) t.draw(ctx); });
    pickups.forEach(p => { if (isOnScreen(p, 20)) p.draw(); });
    enemies.forEach(e => { if (isOnScreen(e, 50)) e.draw(); });
    player.draw(); // Always draw player
    bullets.forEach(b => { if (isOnScreen(b, 20)) b.draw(); });
    projectiles.forEach(p => { if (isOnScreen(p, 20)) p.draw(); });
    explosions.forEach(e => { if (isOnScreen(e, 80)) e.draw(); });
    particles.forEach(p => { if (isOnScreen(p, 10)) p.draw(); });
    floatingTexts.forEach(t => { if (isOnScreen(t, 50)) t.draw(); });
    knives.forEach(k => k.draw()); // Always draw knives (attached to player)
    axes.forEach(a => { if (isOnScreen(a, 30)) a.draw(); });

    ctx.restore();
}

let errorCount = 0;
function loop() {
    try {
        update();
        draw();
    } catch (e) {
        logError(e);
        errorCount++;
        if (errorCount > 10) {
            logError("Too many errors, stopping game loop.");
            return; // Stop loop
        }
    }
    requestAnimationFrame(loop);
}

ctx.fillStyle = "#2c2c2c"; ctx.fillRect(0, 0, canvas.width, canvas.height);
loop();
