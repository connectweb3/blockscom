class MobileControls {
    constructor() {
        this.joystick = { x: 0, y: 0, active: false };
        this.baseX = 0;
        this.baseY = 0;
        this.stickX = 0;
        this.stickY = 0;
        this.maxRadius = 50;
        this.touchId = null;

        this.init();
    }

    init() {
        // Create Joystick Elements
        const container = document.createElement('div');
        container.id = 'joystick-zone';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '10';
        container.style.touchAction = 'none'; // Prevent scrolling
        // Only show on touch devices or always? Let's hide by default and show via CSS media query or JS detection
        // For now, let's just append it. CSS will handle visibility/positioning logic if needed, 
        // but typically we want the zone to cover the screen or left half.
        // Actually, let's make a specific joystick container in HTML or just append here.
        // Let's append to body.
        document.body.appendChild(container);

        const base = document.createElement('div');
        base.id = 'joystick-base';
        base.style.position = 'absolute';
        base.style.width = '120px';
        base.style.height = '120px';
        base.style.borderRadius = '50%';
        base.style.background = 'rgba(255, 255, 255, 0.1)';
        base.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        base.style.display = 'none'; // Hidden until touch
        base.style.pointerEvents = 'none'; // Let touches pass through to zone
        container.appendChild(base);

        const stick = document.createElement('div');
        stick.id = 'joystick-stick';
        stick.style.position = 'absolute';
        stick.style.width = '50px';
        stick.style.height = '50px';
        stick.style.borderRadius = '50%';
        stick.style.background = 'rgba(255, 204, 0, 0.5)'; // Gold tint
        stick.style.display = 'none';
        stick.style.pointerEvents = 'none';
        container.appendChild(stick);

        this.baseEl = base;
        this.stickEl = stick;
        this.zoneEl = container;

        // Events
        this.zoneEl.addEventListener('touchstart', e => this.handleStart(e), { passive: false });
        this.zoneEl.addEventListener('touchmove', e => this.handleMove(e), { passive: false });
        this.zoneEl.addEventListener('touchend', e => this.handleEnd(e));
        this.zoneEl.addEventListener('touchcancel', e => this.handleEnd(e));
    }

    handleStart(e) {
        e.preventDefault();
        // Only handle first touch if not already active
        if (this.joystick.active) return;

        // Look for a touch on the left half of the screen (optional, but good for dual stick feel)
        // For now, anywhere starts the joystick.
        const touch = e.changedTouches[0];
        this.touchId = touch.identifier;
        this.joystick.active = true;

        this.baseX = touch.clientX;
        this.baseY = touch.clientY;
        this.stickX = touch.clientX;
        this.stickY = touch.clientY;

        // Show Visuals
        this.baseEl.style.display = 'block';
        this.stickEl.style.display = 'block';
        this.updateVisuals();
    }

    handleMove(e) {
        e.preventDefault();
        if (!this.joystick.active) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                const touch = e.changedTouches[i];

                const dx = touch.clientX - this.baseX;
                const dy = touch.clientY - this.baseY;
                const dist = Math.hypot(dx, dy);

                // Clamp stick
                const angle = Math.atan2(dy, dx);
                const clampDist = Math.min(dist, this.maxRadius);

                this.stickX = this.baseX + Math.cos(angle) * clampDist;
                this.stickY = this.baseY + Math.sin(angle) * clampDist;

                // Update Output (-1 to 1)
                this.joystick.x = (Math.cos(angle) * clampDist) / this.maxRadius;
                this.joystick.y = (Math.sin(angle) * clampDist) / this.maxRadius;

                // Deadzone
                if (clampDist < 10) {
                    this.joystick.x = 0;
                    this.joystick.y = 0;
                }

                this.updateVisuals();
                break;
            }
        }
    }

    handleEnd(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this.joystick.active = false;
                this.joystick.x = 0;
                this.joystick.y = 0;
                this.touchId = null;

                // Hide Visuals
                this.baseEl.style.display = 'none';
                this.stickEl.style.display = 'none';
                break;
            }
        }
    }

    updateVisuals() {
        // Center elements
        this.baseEl.style.left = (this.baseX - 60) + 'px'; // 120/2
        this.baseEl.style.top = (this.baseY - 60) + 'px';

        this.stickEl.style.left = (this.stickX - 25) + 'px'; // 50/2
        this.stickEl.style.top = (this.stickY - 25) + 'px';
    }
}

const mobileControls = new MobileControls();
