import * as PIXI from 'pixi.js';
import { OutlineFilter } from '@pixi/filter-outline';

import { spawnExplosion } from './effects';

const PI = Math.PI;

const numImages = 4;
const outlineSize = 6;
const outlines = [];

// Create the outline textures for the asteroids.
// We cache these as textures instead of rendering them each frame.
export function init(app) {
    for (let i = 0; i < numImages; i++) {
        const c = new PIXI.Container();
        const p = PIXI.Sprite.from(`asteroid${i}.png`);

        const width = p.width + outlineSize * 2;
        const height = p.height + outlineSize * 2;

        c.width = width;
        c.height = height;

        // Add the sprite to the container, centered.
        p.position.x = width / 2;
        p.position.y = height / 2;
        p.anchor.set(0.5);
        c.addChild(p);

        // For more filters, see: http://filters.pixijs.download/dev/demo/index.html
        c.filters = [new OutlineFilter(outlineSize, 0xff2222, 1, 1, true)];

        const t = PIXI.RenderTexture.create({ width, height });
        app.renderer.render(c, { renderTexture: t });

        outlines[i] = t;
    }
}

export class Asteroid extends PIXI.Container {
    constructor(x, y) {
        super();

        this.x = x;
        this.y = y;

        const a = Math.random() * PI * 2;
        this.dx = Math.cos(a);
        this.dy = Math.sin(a);

        this.speed = 0.02 + Math.random() * 0.01;
        this.rotationSpeed = (Math.random() - 0.5) * 0.001;

        const n = Math.floor(Math.random() * numImages);

        this.sprite = PIXI.Sprite.from(`asteroid${n}.png`);

        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.rotation = Math.random() * PI * 2;
        this.sprite.anchor.set(0.5);

        this.outline = PIXI.Sprite.from(outlines[n]);
        this.outline.x = 0;
        this.outline.y = 0;
        this.outline.anchor.set(0.5);
        this.outline.rotation = this.sprite.rotation;
        this.outline.visible = false;

        this.addChild(this.outline);
        this.addChild(this.sprite);

        this.setScale(1);

        this.generation = 1;
        this.health = 5 - this.generation;
    }

    setScale(scale) {
        this._scale = scale;

        this.sprite.width *= scale;
        this.sprite.height *= scale;

        this.outline.width = this.sprite.width + outlineSize * 2;
        this.outline.height = this.sprite.height + outlineSize * 2;

        this.size = Math.max(this.sprite.width, this.sprite.height);
    }

    // update is called every frame, delta is the time in seconds since last update.
    update(delta, game) {
        if (!game.isInScreen(this.x, this.y, -this.size)) {
            const [x, y] = game.wrapAround(this.x, this.y, this.size);

            this.x = x;
            this.y = y;
        }

        this.x += this.dx * delta * this.speed;
        this.y += this.dy * delta * this.speed;

        this.sprite.rotation += this.rotationSpeed * delta;

        if (this.outline.visible) {
            this.outline.rotation = this.sprite.rotation;
            this.outline.alpha -= delta * 0.005;
            if (this.outline.alpha <= 0) {
                this.outline.visible = false;
            }
        }
    }

    hit(game) {
        this.outline.rotation = this.sprite.rotation;
        this.outline.visible = true;
        this.outline.alpha = 1;

        game.sounds.play('impact');

        this.health--;
        if (this.health <= 0) {
            if (this.generation < 3) {
                for (let i = 0; i < 4; i++) {
                    const a = new Asteroid(this.x, this.y);
                    a.generation = this.generation + 1;
                    a.speed = this.speed * 1.8;
                    a.rotationSpeed = (Math.random() - 0.5) * 0.001;
                    a.health = 5 - a.generation;
                    const ra = Math.random() * PI * 2;
                    a.dx = Math.cos(ra);
                    a.dy = Math.sin(ra);
                    a.setScale(this._scale * 0.8);
                    this.parent.addChild(a);
                }
            }

            spawnExplosion(game, this.x, this.y, this.dx, this.dy, this.size, 0xff2222);

            this.destroy();
        }
    }
}
