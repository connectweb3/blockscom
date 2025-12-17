
class LightningBolt {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
        this.life = 10; // Lasts 10 frames
        this.segments = [];

        // Generate jagged segments
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.floor(dist / 10);
        let cx = x1; let cy = y1;

        for (let i = 0; i < steps; i++) {
            const t = (i + 1) / steps;
            const tx = x1 + (x2 - x1) * t;
            const ty = y1 + (y2 - y1) * t;

            // Jitter
            const jitter = (Math.random() - 0.5) * 20;
            const nx = tx + (Math.random() - 0.5) * 10;
            const ny = ty + (Math.random() - 0.5) * 10;

            this.segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
            cx = nx; cy = ny;
        }
        this.segments.push({ x1: cx, y1: cy, x2: x2, y2: y2 });
    }

    update() {
        this.life--;
    }

    draw() {
        Visuals.drawLightning(ctx, this);
    }
}
