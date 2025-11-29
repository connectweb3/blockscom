class Camera {
    constructor() { this.x = 0; this.y = 0; }
    follow(target) {
        this.x = target.x - canvas.width / 2;
        this.y = target.y - canvas.height / 2;
    }
}

// City Map Generation
const TILE_SIZE = 100; // Size of a city block
const ROAD_WIDTH = 40; // Width of roads

function drawFloor() {
    const startX = Math.floor(camera.x / TILE_SIZE) - 1;
    const startY = Math.floor(camera.y / TILE_SIZE) - 1;
    const endX = startX + Math.ceil(canvas.width / TILE_SIZE) + 2;
    const endY = startY + Math.ceil(canvas.height / TILE_SIZE) + 2;

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            drawCityBlock(x, y);
        }
    }

    ctx.restore();
}

// Pseudo-random number generator for consistent city generation based on coordinates
function pseudoRandom(x, y) {
    let n = x * 331 + y * 433;
    n = (n << 13) ^ n;
    return 1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0;
}

function drawCityBlock(gx, gy) {
    const x = gx * TILE_SIZE;
    const y = gy * TILE_SIZE;

    // More roads: Every 2nd block is a road
    const isRoadX = gx % 2 === 0;
    const isRoadY = gy % 2 === 0;

    if (isRoadX || isRoadY) {
        // It's a Road
        ctx.fillStyle = "#222"; // Road Color
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Dashed Lines
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);

        if (isRoadX && !isRoadY) {
            // Vertical Road
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE / 2, y);
            ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE);
            ctx.stroke();
        } else if (isRoadY && !isRoadX) {
            // Horizontal Road
            ctx.beginPath();
            ctx.moveTo(x, y + TILE_SIZE / 2);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
            ctx.stroke();
        } else {
            // Intersection
            ctx.fillStyle = "#333";
            ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 20);
        }
        ctx.setLineDash([]);
    } else {
        // It's a City Block
        const rand = Math.abs(pseudoRandom(gx, gy));

        // Sidewalk
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // Fewer buildings (prob > 0.6), more parks/parking lots
        if (rand > 0.6) {
            // Building
            const colors = ["#2a2a3a", "#3a2a2a", "#2a3a2a", "#333"];
            ctx.fillStyle = colors[Math.floor(rand * 10) % colors.length];

            // Main Building
            const margin = 8;
            ctx.fillRect(x + margin, y + margin, TILE_SIZE - margin * 2, TILE_SIZE - margin * 2);

            // Roof Detail
            ctx.fillStyle = "#111";
            ctx.fillRect(x + margin + 10, y + margin + 10, 10, 10);

            // Border/Parapet
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + margin, y + margin, TILE_SIZE - margin * 2, TILE_SIZE - margin * 2);

        } else {
            // Park / Open Area
            ctx.fillStyle = "#1a3a1a"; // Dark Grass
            ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);

            // Tree?
            if (rand > 0.3) {
                ctx.fillStyle = "#0f2f0f";
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}
