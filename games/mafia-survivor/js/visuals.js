/**
 * VISUALS & CUSTOMIZATION
 * Centralized drawing logic for all game entities.
 */

const Visuals = {
    // --- CONFIGURATION ---
    colors: {
        player: {
            body: "#000",
            shirt: "#fff",
            tie: "#ff0000",
            skin: "#ffccaa",
            hat: "#333",
            gun: "#555"
        },
        associate: {
            body: "#000",
            shirt: "#fff",
            tie: "#ff0000",
            skin: "#ffccaa",
            hat: "#333",
            gun: "#555"
        },
        enemy: {
            thug: "#3a4a5a",
            brute: "#3a5a3a",
            boss: "#5a3a3a",
            bomber: "#ff3300",
            flash: "#fff"
        },
        outpost: {
            base: "#2a2a2a",
            body: "#444",
            detail: "#111",
            turret: "#4488ff", // Default, overridden by instance color
            highlight: "#fff"
        },
        bullet: {
            trail: "rgba(100, 100, 100, 0.3)",
            body: "#560",
            flame: "#ffaa00" // Default flame color
        },
        effects: {
            muzzleFlash: "#ffaa00",
            lazer: "#00ffff", // Cyan for Lazer
            knife: "#cccccc",
            axe: "#885522"
        }
    },

    // --- ASSETS ---
    sprites: {
        enemy: new Image(),
        enemyVariant: new Image(),
        boss: new Image()
    },

    init() {
        this.sprites.enemy.src = 'asset/enemysprite.png';
        this.sprites.enemyVariant.src = 'asset/enemy_variant.png';
        this.sprites.boss.src = 'asset/boss_sprite.png';
    },

    // --- DRAWING METHODS ---

    drawPlayer(ctx, p) {
        const s = p.size;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(p.x, p.y + s / 2, s / 2, s / 4, 0, 0, Math.PI * 2); ctx.fill();

        if (typeof characterSprite !== 'undefined' && characterSprite.complete && characterSprite.naturalWidth !== 0) {
            let row = 0;
            // Mapping based on p.animState and p.animDir
            // Idle: 0-3, Walk: 4-7, Run: 8-11, Attack: 12-19
            if (p.animState === 'idle') {
                row = 0 + (p.animDir || 0);
            } else if (p.animState === 'walk') {
                row = 4 + (p.animDir || 0);
            } else if (p.animState === 'run') {
                row = 8 + (p.animDir || 0);
            } else if (p.animState === 'attack') {
                row = 12 + (p.animDir || 0);
            }

            const frame = p.animFrame || 0;
            const fw = 128;
            const fh = 128;

            // Draw centered, scaled down to reasonable size (e.g. 64x64 for a 24-size hitbox)
            const drawSize = 64;
            ctx.drawImage(characterSprite,
                frame * fw, row * fh, fw, fh,
                p.x - drawSize / 2, p.y - drawSize / 2 - 10, drawSize, drawSize // Offset Y slightly up
            );
        } else {
            // Fallback Drawing
            // Body (Black Suit)
            ctx.fillStyle = this.colors.player.body; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);

            // Shirt (White)
            ctx.fillStyle = this.colors.player.shirt; ctx.fillRect(p.x - 4, p.y - s / 2 + 4, 8, 12);

            // Tie (Red)
            ctx.fillStyle = this.colors.player.tie; ctx.fillRect(p.x - 2, p.y - s / 2 + 4, 4, 8);

            // Skin (Face)
            ctx.fillStyle = this.colors.player.skin; ctx.fillRect(p.x - s / 2 + 2, p.y - s + 4, s - 4, s / 2);

            // Hat (Black)
            ctx.fillStyle = this.colors.player.hat;
            ctx.fillRect(p.x - s / 2, p.y - s, s, 6);
            ctx.fillRect(p.x - s / 2 + 4, p.y - s - 6, s - 8, 8);

            // Gun
            ctx.fillStyle = this.colors.player.gun;
            const gunX = p.facingRight ? p.x + 10 : p.x - 20;
            ctx.fillRect(gunX, p.y, 14, 6);
        }
    },

    drawAssociate(ctx, a) {
        const s = 16; // Smaller size

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(a.x, a.y + s / 2, s / 2, s / 4, 0, 0, Math.PI * 2); ctx.fill();

        // Body
        ctx.fillStyle = this.colors.associate.body; ctx.fillRect(a.x - s / 2, a.y - s / 2, s, s);

        // Shirt
        ctx.fillStyle = this.colors.associate.shirt; ctx.fillRect(a.x - 3, a.y - s / 2 + 3, 6, 8);

        // Tie
        ctx.fillStyle = this.colors.associate.tie; ctx.fillRect(a.x - 1.5, a.y - s / 2 + 3, 3, 6);

        // Skin
        ctx.fillStyle = this.colors.associate.skin; ctx.fillRect(a.x - s / 2 + 1, a.y - s + 3, s - 2, s / 2);

        // Hat
        ctx.fillStyle = this.colors.associate.hat;
        ctx.fillRect(a.x - s / 2, a.y - s + 1, s, 4);
        ctx.fillRect(a.x - s / 2 + 2, a.y - s - 3, s - 4, 4);

        // Gun
        ctx.fillStyle = this.colors.associate.gun;
        const facingRight = player.facingRight; // Follow player facing
        const gunX = facingRight ? a.x + 6 : a.x - 14;
        ctx.fillRect(gunX, a.y + 2, 10, 4);
    },

    drawEnemy(ctx, e, frame) {
        const s = e.size;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(e.x, e.y + s / 2, s / 2, s / 4, 0, 0, Math.PI * 2); ctx.fill();

        let sprite = this.sprites.enemy;
        if (e.type === 1 || e.type === 3) sprite = this.sprites.enemyVariant; // Brute or Bomber
        if (e.type === 2) sprite = this.sprites.boss;

        if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
            let fw = 128;
            let fh = 128;
            if (e.type === 2) {
                fw = 256;
                fh = 256;
            }
            // Animation: 5 frames
            // Use global frame or e.id if available to offset? Just global frame for sync is fine.
            // Assuming 60fps, change frame every 10 ticks = 6fps animation
            const animFrame = Math.floor(frame / 10) % 5;

            // Draw Size
            // Boss is bigger
            let drawSize = 64;
            if (e.type === 2) drawSize = 128; // Boss bigger

            // Flipping
            // Sprite faces RIGHT.
            // If player is to the LEFT (player.x < e.x), enemy moves LEFT. We need to flip.
            const facingRight = player.x > e.x;

            ctx.save();
            ctx.translate(e.x, e.y);
            if (!facingRight) {
                ctx.scale(-1, 1);
            }

            // Flash effect
            if (e.flash > 0) {
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "white";
            }

            ctx.drawImage(sprite,
                animFrame * fw, 0, fw, fh,
                -drawSize / 2, -drawSize / 2 - (drawSize * 0.2), drawSize, drawSize
            );

            if (e.flash > 0) {
                // Simple flash overlay if composite doesn't work well with drawImage immediately
                // Actually composite needs to be done on a temp canvas to work perfectly, 
                // but for simple flash we can just draw a white rect over it with 'source-in' or just ignore complex flash
                // Let's just draw a white circle over it for hit feedback if simple
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "white";
                ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();

        } else {
            // Fallback Rectangle
            if (e.flash > 0) ctx.fillStyle = this.colors.enemy.flash;
            else if (e.type === 0) ctx.fillStyle = this.colors.enemy.thug;
            else if (e.type === 1) ctx.fillStyle = this.colors.enemy.brute;
            else if (e.type === 2) ctx.fillStyle = this.colors.enemy.boss;
            else if (e.type === 3) ctx.fillStyle = this.colors.enemy.bomber;

            ctx.fillRect(e.x - s / 2, e.y - s / 2, s, s);
        }
    },

    drawOutpost(ctx, o) {
        // TOWER VISUAL

        // 1. Base (Concrete Foundation)
        ctx.fillStyle = this.colors.outpost.base;
        ctx.fillRect(o.x - 20, o.y - 10, 40, 20); // Perspective base
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x - 20, o.y - 10, 40, 20);

        // 2. Tower Body (Vertical)
        ctx.fillStyle = this.colors.outpost.body;
        ctx.fillRect(o.x - 15, o.y - 50, 30, 40);
        ctx.strokeRect(o.x - 15, o.y - 50, 30, 40);

        // Details (Vents)
        ctx.fillStyle = this.colors.outpost.detail;
        ctx.fillRect(o.x - 10, o.y - 40, 20, 4);
        ctx.fillRect(o.x - 10, o.y - 30, 20, 4);

        // 3. Turret Head (Rotates)
        // Since we don't track angle in Outpost state explicitly for drawing, we can just draw a cool head
        ctx.fillStyle = o.color || this.colors.outpost.turret;
        ctx.beginPath();
        ctx.arc(o.x, o.y - 55, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Turret Barrel (Generic direction or up)
        ctx.fillStyle = "#333";
        ctx.fillRect(o.x - 4, o.y - 70, 8, 15);

        // Shine
        ctx.fillStyle = this.colors.outpost.highlight;
        ctx.beginPath();
        ctx.arc(o.x + 5, o.y - 60, 4, 0, Math.PI * 2);
        ctx.fill();

        // Range Indicator (if close)
        const distToPlayer = Math.hypot(player.x - o.x, player.y - o.y);
        if (distToPlayer < 60) {
            ctx.strokeStyle = "rgba(68, 136, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.range, 0, Math.PI * 2);
            ctx.stroke();

            // Text
            ctx.fillStyle = "#fff";
            ctx.font = "8px 'Press Start 2P'";
            ctx.fillText(`LVL ${o.level}`, o.x - 15, o.y - 80);
            ctx.fillText(`$${o.upgradeCost}`, o.x - 15, o.y + 20);
        }
    },

    drawKnife(ctx, k) {
        ctx.save();
        ctx.translate(k.x, k.y);
        ctx.rotate(k.angle); // Rotate based on orbit angle or self rotation

        // Blade
        ctx.fillStyle = "#ddd";
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Handle
        ctx.fillStyle = "#630";
        ctx.fillRect(-2, -15, 4, 6);

        ctx.restore();
    },

    drawAxe(ctx, a) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation); // Spin

        // Handle
        ctx.fillStyle = "#630";
        ctx.fillRect(-2, -10, 4, 20);

        // Blade
        ctx.fillStyle = "#aaa";
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(10, -10, 10, 5);
        ctx.quadraticCurveTo(0, 0, 0, 5);
        ctx.fill();
        ctx.stroke();

        // Double bit?
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(-10, -10, -10, 5);
        ctx.quadraticCurveTo(0, 0, 0, 5);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    },

    drawBullet(ctx, b) {
        // Smoke Trail
        if (b.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(b.trail[0].x, b.trail[0].y);
            for (let i = 1; i < b.trail.length; i++) {
                ctx.lineTo(b.trail[i].x, b.trail[i].y);
            }
            ctx.strokeStyle = this.colors.bullet.trail;
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // Bullet Body
        if (b.type === 'LAZER') {
            // Neon Blue Effect
            const laserColor = "#00ffff"; // Neon Cyan/Blue

            // Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = laserColor;

            ctx.save();
            const angle = Math.atan2(b.vy, b.vx);
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);

            // Outer Beam (Neon Blue)
            ctx.strokeStyle = laserColor;
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(15, 0);
            ctx.stroke();

            // Inner Core (White)
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(15, 0);
            ctx.stroke();

            ctx.restore();

            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = this.colors.bullet.body;
            if (b.type === 'explosive') ctx.fillStyle = "#ff5500"; // Bazooka rocket color

            ctx.save();
            // Simple rotation based on velocity
            const angle = Math.atan2(b.vy, b.vx);
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);
            ctx.fillRect(-4, -2, 8, 4);
            ctx.restore();
        }
    },

    drawExplosion(ctx, e) {
        const progress = 1 - (e.l / e.maxLife); // 0 to 1
        const fade = e.l / e.maxLife;

        // Shockwave
        ctx.save();
        ctx.globalAlpha = fade;

        // Outer Ring
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * progress, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Circle (Fire)
        ctx.fillStyle = progress < 0.5 ? "#ffff00" : "#ff5500";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 0.8 * progress, 0, Math.PI * 2);
        ctx.fill();

        // Flash (First few frames)
        if (progress < 0.2) {
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.8 * (1 - progress * 5);
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawParticle(ctx, p) {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    },

    drawFirePool(ctx, fp) {
        // Base Glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ff5500";
        ctx.beginPath();
        ctx.ellipse(fp.x, fp.y, fp.r, fp.r / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner Hot Spot
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.ellipse(fp.x, fp.y, fp.r * 0.6, fp.r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }
};
