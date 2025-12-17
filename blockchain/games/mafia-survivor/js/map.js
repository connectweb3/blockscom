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

    // Draw Grass everywhere
    if (Visuals.sprites.grass && Visuals.sprites.grass.complete && Visuals.sprites.grass.naturalWidth !== 0) {
        ctx.drawImage(Visuals.sprites.grass, x, y, TILE_SIZE, TILE_SIZE);
    } else {
        ctx.fillStyle = "#1a3a1a"; // Dark Grass fallback
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
}
