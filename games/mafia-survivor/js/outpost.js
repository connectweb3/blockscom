class Outpost {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.level = 1;
        this.range = 200;
        this.damage = 15;
        this.fireRate = 40;
        this.lastShot = 0;
        this.size = 100; // Start even bigger (was 80)
        this.color = "#4488ff";
        this.upgradeCost = 10000; // Reduced from 100k
        this.projectileCount = 1;
    }

    update() {
        // Auto-fire at nearest enemy
        if (frame - this.lastShot > this.fireRate) {
            let nearest = getNearestEnemy(this.x, this.y);
            if (nearest.enemy && nearest.dist < this.range) {
                const baseAngle = Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x);

                for (let i = 0; i < this.projectileCount; i++) {
                    const spread = (i - (this.projectileCount - 1) / 2) * 0.2;
                    // Bigger size (8), Orange Fire color
                    bullets.push(new Bullet(this.x, this.y, baseAngle + spread, this.damage, 10, 2, 8, "#ffaa00"));
                }

                // Muzzle Flash
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x + Math.cos(baseAngle) * 15,
                        this.y + Math.sin(baseAngle) * 15,
                        "#ff5500", 1.5, 8, 3));
                }

                this.lastShot = frame;
            }
        }
    }

    draw() {
        Visuals.drawOutpost(ctx, this);
    }

    upgrade() {
        if (player.cash >= this.upgradeCost) {
            player.cash -= this.upgradeCost;
            this.level++;
            this.projectileCount++; // Add projectile
            this.damage += 5;
            this.range += 20;

            // Visual Upgrades
            this.size += 10; // Get bigger

            this.fireRate = Math.max(10, this.fireRate * 0.9);
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
            createFloatingText(this.x, this.y - 40, "UPGRADED!", "#55ffff");
            updateHUD();
            return true;
        }
        return false;
    }
}
