class Tower {
    constructor(x, y) {
        console.log("Creating Tower at", x, y);
        this.x = x;
        this.y = y;
        this.range = 150;
        this.damage = 10;
        this.fireRate = 60; // 1 shot per second
        this.lastShot = 0;
        this.size = 30;
        this.color = "#44ff44";
        this.cost = 200;
    }

    update() {
        // Auto-fire at nearest enemy
        if (frame - this.lastShot > this.fireRate) {
            let nearest = getNearestEnemy(this.x, this.y);
            if (nearest.enemy && nearest.dist < this.range) {
                const angle = Math.atan2(nearest.enemy.y - this.y, nearest.enemy.x - this.x);
                bullets.push(new Bullet(this.x, this.y, angle, this.damage, 8, 1, 4, this.color));
                this.lastShot = frame;
            }
        }
    }

    draw(ctx) {
        if (!ctx) {
            console.error("Tower.draw: ctx is undefined");
            return;
        }
        Visuals.drawTower(ctx, this);
    }
}
