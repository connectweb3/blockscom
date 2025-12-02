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
            flame: "#ffaa00", // Default flame color
            outpostFire: "#ff8800"
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
        player: new Image(),
        enemy: new Image(),
        enemyVariant: new Image(),
        boss: new Image(),
        mafiaOutpost: new Image(),
        tower: new Image(),
        grass: new Image(),
        territoryTile: new Image()
    },

    init() {
        this.sprites.player.src = 'asset/character_spritesheet.png';
        this.sprites.enemy.src = 'asset/enemysprite.png';
        this.sprites.enemyVariant.src = 'asset/enemy_variant.png';
        this.sprites.boss.src = 'asset/boss_sprite.png';
        this.sprites.mafiaOutpost.src = 'asset/mafiaoutpost.png';
        this.sprites.tower.src = 'asset/towerpost.png';
        this.sprites.grass.src = 'asset/grass.png';
        this.sprites.territoryTile.src = 'asset/territorytile.png';
    },

    // --- DRAWING METHODS ---

    drawPlayer(ctx, p) {
        const s = p.size;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(p.x, p.y + s / 2, s / 2, s / 4, 0, 0, Math.PI * 2); ctx.fill();

        if (this.sprites.player && this.sprites.player.complete && this.sprites.player.naturalWidth !== 0) {
            // Killer Instinct Aura
            if (p.hasKillerInstinct) {
                const range = 100 + (p.killerInstinctLevel * 20);
                ctx.save();
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = "#ff00ff"; // Magenta Aura
                ctx.beginPath();
                ctx.arc(p.x, p.y, range, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ff00ff";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }
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
            ctx.drawImage(this.sprites.player,
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
            } else if (e.isBurning) {
                // Tint Red/Orange for burn
                ctx.globalCompositeOperation = "source-atop";
                ctx.fillStyle = "rgba(255, 85, 0, 0.5)";
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
            } else if (e.isBurning) {
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(255, 85, 0, 0.5)";
                ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, Math.PI * 2); ctx.fill();
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
        // 1. Draw Territory (Background)
        let drawn = false;
        const radius = o.territoryRadius; // This is now half-width of the square

        if (this.sprites.territoryTile && this.sprites.territoryTile.complete && this.sprites.territoryTile.naturalWidth !== 0) {
            try {
                ctx.save();
                ctx.beginPath();
                // Square Territory
                ctx.rect(o.x - radius, o.y - radius, radius * 2, radius * 2);
                ctx.closePath();
                // Create pattern
                const pattern = ctx.createPattern(this.sprites.territoryTile, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fill();

                // Add a border
                ctx.strokeStyle = "rgba(68, 255, 68, 0.5)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                drawn = true;
            } catch (e) {
                console.error("Failed to draw territory pattern:", e);
            }
        }

        if (!drawn) {
            ctx.strokeStyle = "rgba(68, 255, 68, 0.1)";
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.rect(o.x - radius, o.y - radius, radius * 2, radius * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw Tower Slots (8 spots)
        // Corners: (-r, -r), (r, -r), (r, r), (-r, r)
        // Mids: (0, -r), (r, 0), (0, r), (-r, 0)
        const slots = [
            { dx: -radius, dy: -radius }, { dx: 0, dy: -radius }, { dx: radius, dy: -radius },
            { dx: radius, dy: 0 },
            { dx: radius, dy: radius }, { dx: 0, dy: radius }, { dx: -radius, dy: radius },
            { dx: -radius, dy: 0 }
        ];

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;

        slots.forEach(slot => {
            const sx = o.x + slot.dx;
            const sy = o.y + slot.dy;

            // Check if occupied (simple check if a tower is close)
            // We can't easily access 'towers' array here without passing it or making it global.
            // Assuming 'towers' is global as per game.js
            let occupied = false;
            if (typeof towers !== 'undefined') {
                for (let t of towers) {
                    if (Math.hypot(t.x - sx, t.y - sy) < 20) {
                        occupied = true;
                        break;
                    }
                }
            }

            if (!occupied) {
                ctx.beginPath();
                ctx.arc(sx, sy, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        });

        // 2. Draw Outpost Sprite
        const sprite = this.sprites.mafiaOutpost;

        if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(o.x, o.y);

            // Calculate Aspect Ratio
            const ratio = sprite.naturalHeight / sprite.naturalWidth;
            const drawWidth = o.size;
            const drawHeight = o.size * ratio;

            // Draw Sprite (Centered)
            ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

            ctx.restore();
        } else {
            // Fallback if image not loaded
            ctx.fillStyle = o.color || this.colors.outpost.turret;
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 3. Range Indicator (Foreground UI)
        const distToPlayer = Math.hypot(player.x - o.x, player.y - o.y);
        if (distToPlayer < 60 + o.size) {
            ctx.strokeStyle = "rgba(68, 136, 255, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.range, 0, Math.PI * 2);
            ctx.stroke();

            // Text
            ctx.fillStyle = "#fff";
            ctx.font = "8px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText(`LVL ${o.level}`, o.x, o.y - o.size / 2 - 10);
            ctx.fillText(`$${o.upgradeCost}`, o.x, o.y + o.size / 2 + 15);
        }
    },

    drawTower(ctx, t) {
        const sprite = this.sprites.tower;

        if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(t.x, t.y);

            // Frame dimensions
            const fw = 176;
            const fh = 317;

            // Animation: 4 frames
            // Use fire rate to determine frame? Or just loop?
            // "4 attack frame" implies it animates when attacking.
            // t.lastShot is the frame of the last shot.
            // Let's animate for a short duration after firing.
            // Fire rate is 60. Let's say animation takes 20 frames.
            const framesSinceShot = frame - t.lastShot;
            let animFrame = 0;

            if (framesSinceShot < 20) {
                // 4 frames over 20 ticks = 5 ticks per frame
                animFrame = Math.floor(framesSinceShot / 5) % 4;
            } else {
                animFrame = 0; // Idle frame (first frame)
            }

            // Draw Size
            // Original is 176x317. That's huge.
            // Let's scale it down.
            // If base width is t.size (30), scale = 30 / 176 = 0.17
            // Height = 317 * 0.17 = 54.
            // Let's make it a bit bigger visually, maybe width 60?
            const drawWidth = 60;
            const scale = drawWidth / fw;
            const drawHeight = fh * scale;

            // Draw centered horizontally, bottom aligned to t.y
            ctx.drawImage(sprite,
                animFrame * fw, 0, fw, fh,
                -drawWidth / 2, -drawHeight + (t.size / 2), drawWidth, drawHeight
            );

            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = t.color;
            ctx.fillRect(t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);

            // Turret
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size / 3, 0, Math.PI * 2);
            ctx.fill();
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
        } else if (b.type === 'FLAME') {
            // Flame Particle Visual
            ctx.globalAlpha = b.life / 60; // Fade out
            ctx.fillStyle = Math.random() < 0.5 ? "#ff5500" : "#ffff00";
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size * (1 + (60 - b.life) / 20), 0, Math.PI * 2); // Grow
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (b.type === 'KNIFE') {
            // Spinning Knife Projectile
            ctx.save();
            ctx.translate(b.x, b.y);
            // Spin based on life or frame
            ctx.rotate(frame * 0.5);

            // Draw Knife (Reuse logic or simplified)
            ctx.fillStyle = "#ddd";
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(3, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-3, 0);
            ctx.closePath();
            ctx.fill();

            // Handle
            ctx.fillStyle = "#530";
            ctx.fillRect(-1.5, -12, 3, 4);

            ctx.restore();
        } else if (b.type === 'OUTPOST_FIRE') {
            // Outpost Fire Effect
            ctx.save();
            ctx.translate(b.x, b.y);
            const angle = Math.atan2(b.vy, b.vx);
            ctx.rotate(angle);

            // Core
            ctx.fillStyle = "#ffffaa";
            ctx.beginPath();
            ctx.arc(0, 0, b.size / 2, 0, Math.PI * 2);
            ctx.fill();

            // Outer Fire
            ctx.fillStyle = this.colors.bullet.outpostFire;
            ctx.beginPath();
            // Teardrop shape
            ctx.moveTo(b.size, 0);
            ctx.quadraticCurveTo(0, b.size, -b.size * 2, 0);
            ctx.quadraticCurveTo(0, -b.size, b.size, 0);
            ctx.fill();

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ff5500";
            ctx.stroke(); // Just to apply shadow

            ctx.restore();
        } else {
            // High Quality Default Bullet
            ctx.save();
            const angle = Math.atan2(b.vy, b.vx);
            ctx.translate(b.x, b.y);
            ctx.rotate(angle);

            // Glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = b.color;

            // Core
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-b.size, -b.size / 2, b.size * 2, b.size);

            // Outer Shell
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(-b.size, -b.size / 2, b.size * 2, b.size);

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
    },

    drawLightning(ctx, l) {
        ctx.save();
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffff";
        ctx.globalAlpha = l.life / 10;

        ctx.beginPath();
        if (l.segments.length > 0) {
            ctx.moveTo(l.segments[0].x1, l.segments[0].y1);
            for (let s of l.segments) {
                ctx.lineTo(s.x2, s.y2);
            }
        } else {
            ctx.moveTo(l.x1, l.y1);
            ctx.lineTo(l.x2, l.y2);
        }
        ctx.stroke();

        // White core
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
    },

    drawPickup(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Bobbing animation
        const bob = Math.sin(frame * 0.1) * 3;
        ctx.translate(0, bob);

        if (p.type === 'XP') {
            const size = 3 + Math.min(p.value / 10, 5);
            ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
        }
        else if (p.type === 'CASH') {
            const w = 12 + Math.min(p.value / 10, 8);
            const h = 6 + Math.min(p.value / 20, 4);
            ctx.fillStyle = "#85bb65"; ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.strokeRect(-w / 2, -h / 2, w, h);
            ctx.fillStyle = "#004400"; ctx.font = "8px sans-serif"; ctx.fillText("$", -2, 2.5);
        }
        else if (p.type === 'BOX') {
            // Treasure Chest Icon
            const size = 20;

            // Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffd700";

            // Base (Brown/Gold)
            ctx.fillStyle = "#8B4513"; // SaddleBrown
            ctx.fillRect(-10, -8, 20, 14);

            // Lid (Lighter)
            ctx.fillStyle = "#A0522D"; // Sienna
            ctx.beginPath();
            ctx.arc(0, -8, 10, Math.PI, 0);
            ctx.fill();

            // Gold Trim
            ctx.strokeStyle = "#FFD700"; // Gold
            ctx.lineWidth = 2;
            ctx.strokeRect(-10, -8, 20, 14);
            ctx.beginPath();
            ctx.arc(0, -8, 10, Math.PI, 0);
            ctx.stroke();

            // Lock
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(-2, -6, 4, 6);

            ctx.shadowBlur = 0;
        }
        else {
            // Buffs
            let color = "#fff";
            let icon = "?";
            if (p.type === 'DMG') { color = "#ff5555"; icon = "⚔️"; }
            if (p.type === 'HP') { color = "#ff88ff"; icon = "❤️"; }
            if (p.type === 'SPD') { color = "#55ffff"; icon = "⚡"; }

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            // Background Circle
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();

            // Border
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icon
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fff";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(icon, 0, 1);
        }

        ctx.restore();
    }
};
