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
        this.cashMultiplier = 1;
        this.xpMultiplier = 1;
        this.armor = 0;
        this.maxArmor = 0;

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

        // Killer Instinct
        this.hasKillerInstinct = false;
        this.killerInstinctLevel = 0;
        this.killerInstinctTimer = 0;

        // Lightning Chain
        this.hasLightningChain = false;
        this.lightningChainLevel = 0;
        this.lightningChainCooldown = 0;

        // Psychic Power
        this.psychicPowerCooldown = 0;
        this.psychicBlastCount = 0;
        this.psychicReloadTimer = 0;

        // Time Freeze
        this.hasTimeFreeze = false;
        this.timeFreezeTimer = 0;
        this.isTimeFrozen = false;

        this.lastShot = 0;
        this.facingRight = true;

        // Weapons
        // Weapons
        this.weapon = 'PISTOL';
        this.weapons = ['PISTOL', 'GRENADE_LAUNCHER', 'LAZER', 'FLAMETHROWER', 'THROWING_KNIFE', 'PSYCHIC_POWER'];
        this.weaponLevels = {
            'PISTOL': 1,

            'GRENADE_LAUNCHER': 0,
            'LAZER': 0,

            'FLAMETHROWER': 0,

            'THROWING_KNIFE': 0,
            'PSYCHIC_POWER': 0
        };

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

            // Calculate potential new position
            let nextX = this.x + dx * this.speed;
            let nextY = this.y + dy * this.speed;

            // Collision Check with Outposts
            let collision = false;
            for (let o of outposts) {
                const dist = Math.hypot(nextX - o.x, nextY - o.y);
                const minDist = o.size / 2 + this.size / 2;
                if (dist < minDist) {
                    // Allow moving AWAY if already stuck
                    const currentDist = Math.hypot(this.x - o.x, this.y - o.y);
                    if (currentDist < minDist && dist > currentDist) {
                        continue;
                    }
                    collision = true;
                    break;
                }
            }

            // Collision Check with Towers
            if (!collision) {
                for (let t of towers) {
                    const dist = Math.hypot(nextX - t.x, nextY - t.y);
                    const minDist = t.size / 2 + this.size / 2;
                    if (dist < minDist) {
                        // Allow moving AWAY if already stuck
                        const currentDist = Math.hypot(this.x - t.x, this.y - t.y);
                        if (currentDist < minDist && dist > currentDist) {
                            continue;
                        }
                        collision = true;
                        break;
                    }
                }
            }

            if (!collision) {
                this.x = nextX;
                this.y = nextY;
            }

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

        // Psychic Power Logic
        this.updatePsychicPower();

        // Killer Instinct Logic (AOE Aura)
        if (this.hasKillerInstinct) {
            this.killerInstinctTimer++;
            // Damage tick every 1 second (60 frames)
            if (this.killerInstinctTimer % 60 === 0) {
                const range = 100 + (this.killerInstinctLevel * 20);
                const damage = 3 * this.killerInstinctLevel; // 3 damage per stack/level

                // Query enemies in range
                // We can use the grid but since it's a circle around player, iterating nearby cells is good.
                // Or just iterate all enemies if count is low, but grid is better.
                // Let's use the grid query centered on player.
                // Grid cell size is 150. Range might be up to 200+.
                // query(x,y) gets 3x3 cells. 150*3 = 450. Should be enough.
                const nearby = enemyGrid.query(this.x, this.y);
                nearby.forEach(e => {
                    if (e.hp > 0 && Math.hypot(e.x - this.x, e.y - this.y) < range) {
                        e.takeHit(damage, 0, this.x, this.y);
                        // Visual effect for hit
                        createFloatingText(e.x, e.y - 20, Math.floor(damage), "#ff00ff");
                    }
                });
            }
        }

        // Lightning Chain Logic
        if (this.hasLightningChain && frame > this.lightningChainCooldown) {
            // Find nearest enemy
            const nearest = getNearestEnemy(this.x, this.y);
            if (nearest.enemy && nearest.dist < 300) {
                // Fire Lightning
                const damage = 10 + (this.lightningChainLevel * 5);
                const chainCount = 2 + this.lightningChainLevel;
                const chainRange = 150;

                let currentTarget = nearest.enemy;
                let currentX = this.x;
                let currentY = this.y;
                let currentDamage = damage;
                let hitList = [currentTarget]; // Keep track to avoid hitting same enemy twice in one chain

                // Initial Hit
                currentTarget.takeHit(currentDamage, 0, currentX, currentY);
                lightningBolts.push(new LightningBolt(currentX, currentY, currentTarget.x, currentTarget.y));
                createFloatingText(currentTarget.x, currentTarget.y - 20, Math.floor(currentDamage), "#00ffff");

                // Chain
                for (let i = 0; i < chainCount; i++) {
                    // Find next target from currentTarget
                    let nextTarget = null;
                    let minD = Infinity;

                    // Query nearby enemies from currentTarget
                    const nearby = enemyGrid.query(currentTarget.x, currentTarget.y);

                    for (let e of nearby) {
                        if (e.hp > 0 && !hitList.includes(e)) {
                            const d = Math.hypot(e.x - currentTarget.x, e.y - currentTarget.y);
                            if (d < chainRange && d < minD) {
                                minD = d;
                                nextTarget = e;
                            }
                        }
                    }

                    if (nextTarget) {
                        currentDamage = Math.floor(currentDamage / 2);
                        if (currentDamage < 1) currentDamage = 1;

                        nextTarget.takeHit(currentDamage, 0, currentTarget.x, currentTarget.y);
                        lightningBolts.push(new LightningBolt(currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y));
                        createFloatingText(nextTarget.x, nextTarget.y - 20, Math.floor(currentDamage), "#00ffff");

                        hitList.push(nextTarget);
                        currentTarget = nextTarget;
                    } else {
                        break; // No more targets to chain to
                    }
                }

                this.lightningChainCooldown = frame + Math.max(60, 180 - (this.lightningChainLevel * 20));
            }
        }

        // Time Freeze Logic
        if (this.hasTimeFreeze) {
            this.timeFreezeTimer++;
            // Every 15 seconds (900 frames)
            if (this.timeFreezeTimer >= 900) {
                this.isTimeFrozen = true;
                if (this.timeFreezeTimer === 900) {
                    createFloatingText(this.x, this.y - 50, "TIME FREEZE!", "#ffffff");
                }

                // Reset after 1 second (60 frames)
                if (this.timeFreezeTimer >= 960) {
                    this.isTimeFrozen = false;
                    this.timeFreezeTimer = 0;
                }
            } else {
                this.isTimeFrozen = false;
            }
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

            // Weapon Level Scaling
            const level = this.weaponLevels[this.weapon] || 1;
            const levelDmgMult = 1 + (level - 1) * 0.5; // +50% damage per level
            const levelProjAdd = (level - 1); // +1 projectile per level (except some weapons)

            if (this.weapon === 'GRENADE_LAUNCHER') {
                currentFireRate = 90 * (this.fireRate / 35); // Buffed Attack Speed

                // Attack Speed Scaling: +2 Speed (approx -2 frames delay?) per upgrade > 2
                if (level > 2) {
                    currentFireRate -= (level - 2) * 5; // Reducing delay by 5 frames per level to be noticeable
                }

                currentDamage = this.damage * 3 * levelDmgMult;
                currentSpeed = this.bulletSpeed * 0.6;
                bulletType = 'explosive';
                count = this.projectileCount + levelProjAdd;
                currentSpread = 0.5; // Increase spread randomness
            } else if (this.weapon === 'LAZER') {
                currentFireRate = 10 * (this.fireRate / 35);
                currentDamage = (this.damage + 10) * 0.5 * levelDmgMult;
                currentSpeed = 20;
                bulletType = 'LAZER';
                count = this.projectileCount + levelProjAdd;

            } else if (this.weapon === 'FLAMETHROWER') {
                currentFireRate = 3; // Super fast
                // Stronger scaling: Base 20% + 10% per level (was just multiplier)
                // Actually, let's make it depend more heavily on level.
                // Base damage is 10. 0.2 * 10 = 2 damage per tick.
                // Level 1: 2 * 1 = 2.
                // Level 5: 2 * 3 = 6.
                // Level 5: 2 * 3 = 6.
                // Let's boost the base scaling factor a bit more.
                currentDamage = (this.damage + 10) * (0.2 + (level * 0.1)) * levelDmgMult;
                currentSpeed = 6;
                // AOE Scaling: Spread increases with level
                currentSpread = 0.5 + (level * 0.1);
                bulletType = 'FLAME';
                count = 1 + Math.floor(levelProjAdd / 2); // Thicker stream
                // Size Scaling: Flames get bigger
                // We need to pass this size to bullet creation below, but bullet creation uses a local var 'bSize'
                // We can set a flag or just handle it in the loop below if we had access to 'bSize' there.
                // But 'bSize' is defined inside the loop.
                // Wait, I can just define a variable here and use it there?
                // No, 'bSize' is defined inside the loop: let bSize = 4;
                // I should change the loop logic or add a special case for FLAMETHROWER size there.
                // OR, I can just set a property on 'this' temporarily? No that's messy.
                // Let's just modify the loop logic in the next block.
                // Actually, I can't modify the loop logic easily from here without replacing the whole shoot function or a larger chunk.
                count = this.projectileCount + level;
            } else if (this.weapon === 'THROWING_KNIFE') {
                currentFireRate = 15;
                currentDamage = (5 + (level * 2)) * 1.5 * levelDmgMult; // Base 5 + 2 per level
                currentSpeed = 10;
                bulletType = 'KNIFE';
                count = this.projectileCount + level;
            } else {
                // Pistol / Default
                currentDamage *= levelDmgMult;
                count += levelProjAdd;
            }

            if (frame - this.lastShot > currentFireRate) {
                for (let i = 0; i < count; i++) {
                    const angle = Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x);
                    this.aimAngle = angle; // Update aim angle

                    let angleStep = 0.2;
                    if (this.weapon === 'GRENADE_LAUNCHER') angleStep = 0.4; // Wider cone for Grenade Launcher

                    const spread = (i - (count - 1) / 2) * angleStep + (Math.random() - 0.5) * currentSpread;

                    if (this.weapon === 'GRENADE_LAUNCHER') {
                        // Grenade Launcher Logic (Lobbed Grenades)
                        const dist = Math.hypot(nearest.enemy.x - this.x, nearest.enemy.y - this.y);
                        // Add some randomness to distance for spread?
                        const targetDist = dist + (Math.random() - 0.5) * 50;
                        const tx = this.x + Math.cos(angle + spread) * targetDist;
                        const ty = this.y + Math.sin(angle + spread) * targetDist;

                        projectiles.push(new Grenade(this.x, this.y, tx, ty, currentDamage));
                    } else {
                        let bSize = 4;
                        let bColor = "#ffff00";
                        // if (this.weapon === 'GRENADE_LAUNCHER') { bSize = 8; bColor = "#ffaa00"; } // Handled above
                        if (this.weapon === 'FLAMETHROWER') {
                            // Size scales with level: 4 + (level * 2)
                            const level = this.weaponLevels[this.weapon] || 1;
                            bSize = 4 + (level * 2);
                        }

                        const spawnX = this.x + Math.cos(angle) * 20;
                        const spawnY = this.y + Math.sin(angle) * 20;
                        bullets.push(new Bullet(spawnX, spawnY, angle + spread, currentDamage, currentSpeed, this.knockback, bSize, bColor, false, bulletType));
                    }
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
            let damage = 40 + (this.grenadeLevel * 10);
            let radius = 80;
            let color = "#ffaa00";

            // Combo: Grenade Launcher + The Pineapple
            if (this.weapon === 'GRENADE_LAUNCHER') {
                // Target farthest enemy
                let farthest = null;
                let maxDist = -1;
                enemies.forEach(e => {
                    if (e.hp > 0 && isOnScreen(e)) {
                        const d = Math.hypot(e.x - this.x, e.y - this.y);
                        if (d > maxDist) { maxDist = d; farthest = e; }
                    }
                });
                if (farthest) target = farthest;

                // Buffs
                damage *= 1.5; // More damage
                radius = 120; // More AOE
                color = "#00ff00"; // Different Color Blast (Green)
            }

            projectiles.push(new Grenade(this.x, this.y, target.x, target.y, damage, radius, color));
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

    updatePsychicPower() {
        const level = this.weaponLevels['PSYCHIC_POWER'];

        // Reload Logic
        if (this.psychicReloadTimer > 0) {
            this.psychicReloadTimer--;
            if (this.psychicReloadTimer <= 0) {
                this.psychicBlastCount = 0;
                createFloatingText(this.x, this.y - 40, "READY!", "#ff00ff");
            }
            return; // Reloading, cannot fire
        }

        if (level > 0 && frame > this.psychicPowerCooldown) {
            // Check if we need to reload
            if (this.psychicBlastCount >= 10) {
                this.psychicReloadTimer = 120; // 2 seconds
                return;
            }

            let targetCount = 1 + (level - 1); // Base 1, +1 per level upgrade
            let isCombo = false;

            // Time Freeze Combo
            if (this.isTimeFrozen) {
                targetCount *= 2;
                isCombo = true;
            }

            // Find targets
            let potentialTargets = enemies.filter(e => e.hp > 0 && isOnScreen(e, 100));
            if (potentialTargets.length === 0) return;

            // Sort by distance for Nearest
            potentialTargets.sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));

            let targets = [];

            if (!isCombo) {
                // Just take nearest
                targets = potentialTargets.slice(0, targetCount);
            } else {
                // Half nearest, Half farthest
                const half = targetCount / 2;
                // Nearest
                targets = targets.concat(potentialTargets.slice(0, half));

                // Farthest (Reverse the remaining array or just pick from end)
                // Filter out already selected
                let remaining = potentialTargets.filter(e => !targets.includes(e));
                // Sort remaining by distance descending (Farthest first)
                remaining.sort((a, b) => Math.hypot(b.x - this.x, b.y - this.y) - Math.hypot(a.x - this.x, a.y - this.y));

                targets = targets.concat(remaining.slice(0, half));
            }

            if (targets.length > 0) {
                const damage = 50 + (level * 25);
                // Attack Speed increases with level (Cooldown decreases)
                const cooldown = Math.max(60, 180 - (level * 20));

                targets.forEach(t => {
                    projectiles.push(new PsychicBlast(t, damage, 60)); // 1 second delay
                    this.psychicBlastCount++; // Increment shot count per projectile
                });

                this.psychicPowerCooldown = frame + cooldown;
            }
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

        // Draw Psychic Reload Bar
        if (this.psychicReloadTimer > 0) {
            const barWidth = 40;
            const barHeight = 6;
            const x = this.x - barWidth / 2;
            const y = this.y - this.size - 15;
            const pct = this.psychicReloadTimer / 120; // 120 frames max

            // Background
            ctx.fillStyle = "#000";
            ctx.fillRect(x, y, barWidth, barHeight);

            // Fill (Inverse because timer counts down)
            ctx.fillStyle = "#ff00ff";
            ctx.fillRect(x + 1, y + 1, (barWidth - 2) * (1 - pct), barHeight - 2);
        }
    }

    takeDamage(amt) {
        // Armor Absorption
        if (this.armor > 0) {
            let armorDmg = Math.min(this.armor, amt);
            this.armor -= armorDmg;
            amt -= armorDmg;
        }

        if (amt > 0) {
            this.hp -= amt;
            if (this.hp <= 0) {
                this.hp = 0;
                if (gameState !== "GAME_OVER") endGame();
            }
        }
        updateHUD();
    }

    gainXp(amount) {
        this.xp += amount * this.xpMultiplier;
        if (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.level++;
            this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
            triggerLevelUp();
        }
        updateHUD();
    }

    gainCash(amount) {
        this.cash += amount * this.cashMultiplier;
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
