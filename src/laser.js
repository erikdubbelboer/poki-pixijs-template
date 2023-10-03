import * as PIXI from 'pixi.js';

const scale = 0.5;
const speed = 1;

// Example laser projectile class.
export class Laser extends PIXI.Sprite {
    constructor(x, y, dx, dy) {
        super(PIXI.Texture.from('laser.png'));

        this.width *= scale;
        this.height *= scale;

        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;

        this.rotation = Math.atan2(dy, dx) + Math.PI * 0.5;
    }

    update(delta, game) {
        this.x += this.dx * delta * speed;
        this.y += this.dy * delta * speed;

        if (!game.isInScreen(this.x, this.y, 0)) {
            this.destroy();
        }
    }
}
