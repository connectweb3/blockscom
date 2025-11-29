class Player {
    constructor() {
        this.x = 0; this.y = 0;
        this.size = 24;
        this.baseSpeed = 1.5;
        this.speed = 1.5;
        this.maxHp = 100;
        this.hp = 100;
        this.xp = 0;
        this.nextLevelXp = 10;
        this.level = 1;
        this.cash = 0;

        // Stats
        this.fireRate = 35;
        this.damage = 10;
        this.knockback = 1;
        this.bulletSpeed = 4;
        this.projectileCount = 1;
        this.pickupRange = 60;

        // Stacks (Max 20)
        this.stackDmg = 0;
        this.stackHp = 0;
        this.stackSpd = 0;
        this.maxStack = 20;

        // Abilities
        this.hasGrenade = false;
        this.grenadeLevel = 0;
        this.grenadeCooldown = 0;
        this.hasMolotov = false;
        this.molotovLevel = 0;
        this.molotovCooldown = 0;

        this.associates = [];
        this.associateCount = 0;

        this.hasLandmine = false;
        this.landmineLevel = 0;
        this.landmineLevel = 0;
        this.landmineCooldown = 0;

        // New Abilities
        this.knifeCount = 0;
        this.axeLevel = 0;
        this.axeCooldown = 0;

        this.lastShot = 0;
        this.facingRight = true;

        // Weapons
        this.weapon = 'PISTOL'; // PISTOL, MACHINE_GUN, BAZOOKA, LAZER, SUBMACHINE_GUN
        this.weapons = ['PISTOL', 'MACHINE_GUN', 'BAZOOKA', 'LAZER', 'SUBMACHINE_GUN'];

        // Animation
        this.animState = 'idle'; // idle, walk, run, attack
        this.animDir = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.aimAngle = 0;
    }

    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.weapon = this.weapons[index];
            createFloatingText(this.x, this.y - 40, `EQUIPPED: ${this.weapon}`, "#ffffff");
        }
    }

    addAssociate() {
        this.associateCount++;
        // Position relative to player
        const angle = (this.associateCount * (Math.PI * 2)) / 5; // Spread them out
        this.associates.push(new Associate(this.x, this.y, angle));
    }

    update() {
        // Movement
        let dx = 0; let dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy = -1;
        if (keys['KeyS'] || keys['ArrowDown']) dy = 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx = -1;
        if (keys['KeyD'] || keys['ArrowRight']) dx = 1;

        // Joystick Input Override
        if (mobileControls.joystick.active) {
            dx = mobileControls.joystick.x;
            dy = mobileControls.joystick.y;
        }

        if (dx !== 0 || dy !== 0) {
            // Normalize keyboard input only (Joystick is already normalized/clamped)
            if (!mobileControls.joystick.active) {
                const length = Math.sqrt(dx * dx + dy * dy);
                if (length > 0) {
                    dx /= length; dy /= length;
                }
            }

            this.x += dx * this.speed;
            this.y += dy * this.speed;
            if (dx > 0) this.facingRight = true;
            if (dx < 0) this.facingRight = false;
        }

        // Gun Auto-Fire
        if (frame - this.lastShot > this.fireRate) this.shoot();

        // Ability Logic
        if (this.hasGrenade && frame > this.grenadeCooldown) this.throwGrenade();
        if (this.hasMolotov && frame > this.molotovCooldown) this.throwMolotov();
        if (this.hasLandmine && frame > this.landmineCooldown) this.placeLandmine();

        // New Ability Logic
        if (this.knifeCount > 0) {
            // Rebuild knives array if count changed or empty
            if (knives.length !== this.knifeCount) {
                knives = [];
                for (let i = 0; i < this.knifeCount; i++) knives.push(new Knife(i, this.knifeCount));
            }
        }

        if (this.axeLevel > 0 && frame > this.axeCooldown) {
            this.throwAxe();
        }

        // Associates
        this.associates.forEach(a => a.update());

        // Passive Regen
        if (frame % 120 === 0 && this.hp < this.maxHp) {
            this.hp += 1;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        // Animation Logic
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animFrame = (this.animFrame + 1) % 5;
            this.animTimer = 0;
        }

        const isMoving = dx !== 0 || dy !== 0;
        const isRunning = this.speed > this.baseSpeed + 0.5;
        const isAttacking = frame - this.lastShot < 15;

        if (isAttacking) {
            this.animState = 'attack';
            // 8-way direction from aimAngle
            // Angle is in radians. 0 = Right, PI/2 = Down, PI = Left, -PI/2 = Up
            let deg = this.aimAngle * (180 / Math.PI);
            if (deg < 0) deg += 360;

            // Map 0-360 to 8 directions
            // 0 (Right) -> 1
            // 45 (Down-Right) -> 2
            // 90 (Down) -> 3
            // 135 (Down-Left) -> 4
            // 180 (Left) -> 5
            // 225 (Up-Left) -> 6
            // 270 (Up) -> 7
            // 315 (Up-Right) -> 0

            // User Mapping:
            // 0: Upper Right (Row 12) -> ~315
            // 1: Right (Row 13) -> ~0
            // 2: Lower Right (Row 14) -> ~45
            // 3: Down (Row 15) -> ~90
            // 4: Lower Left (Row 16) -> ~135
            // 5: Left (Row 17) -> ~180
            // 6: Upper Left (Row 18) -> ~225
            // 7: Up (Row 19) -> ~270

            const sector = Math.floor((deg + 22.5) / 45) % 8;
            // sector 0 (0 deg, Right) -> 1
            // sector 1 (45 deg, DR) -> 2
            // sector 2 (90 deg, Down) -> 3
            // sector 3 (135 deg, DL) -> 4
            // sector 4 (180 deg, Left) -> 5
            // sector 5 (225 deg, UL) -> 6
            // sector 6 (270 deg, Up) -> 7
            // sector 7 (315 deg, UR) -> 0

            const map = [1, 2, 3, 4, 5, 6, 7, 0];
            this.animDir = map[sector];

        } else if (isMoving) {
            this.animState = isRunning ? 'run' : 'walk';
            // 4-way direction
            // 0: Down, 1: Up, 2: Left, 3: Right
            if (Math.abs(dy) > Math.abs(dx)) {
                this.animDir = dy > 0 ? 0 : 1;
            } else {
                this.animDir = dx > 0 ? 3 : 2;
            }
        } else {
            this.animState = 'idle';
            // Keep last dir, but ensure it's 4-way compatible if we were attacking?
            // If we were attacking in 8-way, we might need to snap back to 4-way for idle.
            // Idle rows are 0-3 (Down, Up, Left, Right).
            // If animDir was > 3 (from attack), we need to map it.
            if (this.animDir > 3) {
                // Map 8-way to 4-way roughly
                // 0 (UR) -> 1 (Up) or 3 (Right)? Let's say Right.
                // 1 (R) -> 3
                // 2 (DR) -> 0 (Down)
                // 3 (D) -> 0
                // 4 (DL) -> 0
                // 5 (L) -> 2
                // 6 (UL) -> 1
                // 7 (U) -> 1
                const remap = [3, 3, 0, 0, 0, 2, 1, 1];
                this.animDir = remap[this.animDir];
            }
        }
    }

    shoot() {
        let nearest = getNearestEnemy(this.x, this.y);
        if (nearest.enemy && nearest.dist < 500) {

            let currentFireRate = this.fireRate;
            let currentDamage = this.damage;
            let currentSpeed = this.bulletSpeed;
            let currentSpread = 0;
            let bulletType = 'normal';
            let count = this.projectileCount;

            if (this.weapon === 'MACHINE_GUN') {
                currentFireRate = 8; // Fast
                currentDamage = this.damage * 0.4;
                currentSpread = 0.3;
            } else if (this.weapon === 'BAZOOKA') {
                // Scale fire rate based on player's fire rate (Base 35)
                // 120 is base Bazooka rate. If player.fireRate < 35, this decreases.
                currentFireRate = 120 * (this.fireRate / 35);
                currentDamage = this.damage * 3;
                currentSpeed = this.bulletSpeed * 0.6;
                bulletType = 'explosive';
                count = this.projectileCount; // Enable Projectile Upgrades
            } else if (this.weapon === 'LAZER') {
                // Scale fire rate based on player's fire rate
                currentFireRate = 10 * (this.fireRate / 35);
                currentDamage = this.damage * 0.5;
                currentSpeed = 20; // Instant
                bulletType = 'LAZER';
                count = this.projectileCount; // Enable Projectile Upgrades
            } else if (this.weapon === 'SUBMACHINE_GUN') {
                currentFireRate = 5; // Very Fast
                currentDamage = this.damage * 0.3; // Low Damage
                currentSpread = 0.4; // Spray
                currentSpeed = this.bulletSpeed * 1.2;
            }

            if (frame - this.lastShot > currentFireRate) {
                for (let i = 0; i < count; i++) {
                    const angle = Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x);
                    this.aimAngle = angle; // Update aim angle
                    const spread = (i - (count - 1) / 2) * 0.2 + (Math.random() - 0.5) * currentSpread;

                    let bSize = 4;
                    let bColor = "#ffff00";
                    if (this.weapon === 'BAZOOKA') { bSize = 8; bColor = "#ffaa00"; }

                    bullets.push(new Bullet(this.x, this.y, angle + spread, currentDamage, currentSpeed, this.knockback, bSize, bColor, false, bulletType));
                }
                // Muzzle Flash
                for (let i = 0; i < 8; i++) {
                    particles.push(new Particle(this.x + Math.cos(Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x)) * 20,
                        this.y + Math.sin(Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x)) * 20,
                        Visuals.colors.bullet.flame, 1.5, 15, 6));
                }
                this.lastShot = frame;
            }
        }
    }

    placeLandmine() {
        projectiles.push(new Landmine(this.x, this.y, 50 + (this.landmineLevel * 25)));
        this.landmineCooldown = frame + Math.max(100, 300 - (this.landmineLevel * 30));
    }

    throwGrenade() {
        if (enemies.length > 0) {
            let target = enemies[Math.floor(Math.random() * enemies.length)];
            projectiles.push(new Grenade(this.x, this.y, target.x, target.y, 40 + (this.grenadeLevel * 10)));
            this.grenadeCooldown = frame + Math.max(60, 200 - (this.grenadeLevel * 20));
        }
    }

    throwMolotov() {
        if (enemies.length > 0) {
            let target = getNearestEnemy(this.x, this.y).enemy || { x: this.x + 100, y: this.y };
            projectiles.push(new MolotovBottle(this.x, this.y, target.x, target.y, 10 + (this.molotovLevel * 5)));
            this.molotovCooldown = frame + Math.max(120, 300 - (this.molotovLevel * 30));
        }
    }

    throwAxe() {
        if (enemies.length > 0) {
            // Throw at random enemy or nearest? Random is more chaotic/fun for axe
            let target = enemies[Math.floor(Math.random() * enemies.length)];
            axes.push(new Axe(this.x, this.y, target.x, target.y, 30 + (this.axeLevel * 10)));
            this.axeCooldown = frame + Math.max(40, 100 - (this.axeLevel * 10));
        }
    }

    applyStack(type) {
        if (type === 'dmg' && this.stackDmg < this.maxStack) {
            this.stackDmg++;
            this.damage += 1;
            createFloatingText(this.x, this.y - 20, "+1 DMG", "#ff5555");
        }
        if (type === 'hp' && this.stackHp < this.maxStack) {
            this.stackHp++;
            this.maxHp += 1;
            this.hp = this.maxHp; // Full heal
            createFloatingText(this.x, this.y - 20, "+1 HP & HEAL", "#ff88ff");
        }
        if (type === 'spd' && this.stackSpd < this.maxStack) {
            this.stackSpd++;
            this.speed = this.baseSpeed + (this.stackSpd * 0.075);
            createFloatingText(this.x, this.y - 20, "+SPEED", "#55ffff");
        }
        updateStackUI();
        updateHUD();
    }

    draw() {
        Visuals.drawPlayer(ctx, this);
        this.associates.forEach(a => a.draw());
    }

    takeDamage(amt) {
        this.hp -= amt;
        if (this.hp <= 0) endGame();
        updateHUD();
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
            triggerLevelUp();
        }
        updateHUD();
    }

    gainCash(amount) {
        this.cash += amount;
        updateHUD();
    }
}

class Associate {
    constructor(x, y, offsetAngle) {
        this.x = x; this.y = y;
        this.offsetAngle = offsetAngle;
        this.dist = 40;
        this.lastShot = 0;
        this.fireRate = 50;
    }
    update() {
        // Follow Player
        const targetX = player.x + Math.cos(this.offsetAngle + frame * 0.02) * this.dist;
        const targetY = player.y + Math.sin(this.offsetAngle + frame * 0.02) * this.dist;

        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;

        // Shoot
        if (frame - this.lastShot > this.fireRate) {
            let nearest = getNearestEnemy(this.x, this.y);
            if (nearest.enemy && nearest.dist < 400) {
                const angle = Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x);
                bullets.push(new Bullet(this.x, this.y, angle, player.damage * 0.8, player.bulletSpeed, 0));
                this.lastShot = frame;
            }
        }
    }
    draw() {
        Visuals.drawAssociate(ctx, this);
    }
}
