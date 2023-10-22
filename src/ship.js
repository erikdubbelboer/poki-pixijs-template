import * as PIXI from 'pixi.js';

import { Laser } from './laser';
import { rotateWithSpeed } from './util';

const PI = Math.PI;
const PI05 = PI * 0.5;
const maxPointerMovement = 30 * window.devicePixelRatio;
const velocityScale = 1;
const scale = 0.5;
const shootInterval = 200;

const isTouchDevice = window.isMobile || window.isTablet || window.isIpadOS;

// Example Ship class which can be controlled by the player.
export class Ship extends PIXI.Container {
    constructor(x, y, game) {
        super();

        this.sprite = PIXI.Sprite.from('ship.png');
        this.sprite.width *= scale;
        this.sprite.height *= scale;
        this.sprite.anchor.set(0.5);
        this.sprite.tint = 0xffffff;
        this.sprite.addChild(this.sprite);

        this.addChild(this.sprite);

        this.x = x;
        this.y = y;

        this.size = Math.max(this.sprite.width, this.sprite.height);

        this.speed = 1.5;
        this.velocity = { x: 0, y: 0 };
        this.wantRotation = 0;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        this.pointerMove = false;
        this.cancelPointerMoveAfter = 0;
        this.pointerRotation = false;
        let joystickStart = null;
        this.joystickMove = null;

        this.spaceDown = false;
        this.cancelShoot = null;

        this.keyDownHandler = (event) => {
            switch (event.code) {
                case 'KeyS':
                case 'ArrowDown':
                    this.down = true;
                    break;
                case 'KeyW':
                case 'ArrowUp':
                    this.up = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.right = true;
                    break;
                case 'Space':
                    // Browser key events can be weird,
                    // sometimes they repeat, sometimes they don't.
                    // Keep track of the state of the space key ourselves.
                    if (this.spaceDown) {
                        return;
                    }
                    this.spaceDown = true;
                    if (this.cancelShoot) {
                        this.cancelShoot();
                    }
                    // game.interval unlike window.setInterval will trigger
                    // immediately and then wait for the interval.
                    this.cancelShoot = game.interval(() => {
                        this.shoot(game);
                    }, shootInterval);
                    break;
            }

            event.preventDefault();
        };
        this.keyUpHandler = (event) => {
            switch (event.code) {
                case 'KeyS':
                case 'ArrowDown':
                    this.down = false;
                    break;
                case 'KeyW':
                case 'ArrowUp':
                    this.up = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.right = false;
                    break;
                case 'Space':
                    this.spaceDown = false;
                    if (this.cancelShoot) {
                        this.cancelShoot();
                        this.cancelShoot = null;
                    }
                    break;
            }

            event.preventDefault();
        };
        this.pointerDownHandler = (event) => {
            if (isTouchDevice) {
                joystickStart = {
                    x: event.clientX,
                    y: event.clientY,
                };
                this.joystickMove = null;
            }

            if (this.cancelShoot) {
                this.cancelShoot();
            }

            // Only shoot using the left mouse button.
            if (event.button === 0) {
                // interval unlike window.setInterval will trigger
                // immediately and then wait for the interval.
                this.cancelShoot = game.interval(() => {
                    this.shoot(game);
                }, shootInterval);
            }
        };
        this.pointerUpHandler = () => {
            joystickStart = null;
            this.joystickMove = null;

            if (this.cancelShoot) {
                this.cancelShoot();
                this.cancelShoot = null;
            }
        };
        this.pointerMoveHandler = (event) => {
            if (joystickStart) {
                let x = event.clientX - joystickStart.x;
                let y = event.clientY - joystickStart.y;

                if (x > maxPointerMovement) {
                    x = maxPointerMovement;
                } else if (x < -maxPointerMovement) {
                    x = -maxPointerMovement;
                }
                if (y > maxPointerMovement) {
                    y = maxPointerMovement;
                } else if (y < -maxPointerMovement) {
                    y = -maxPointerMovement;
                }

                this.joystickMove = { x, y };

                if (game.portrait) {
                    // In portrait mode, the ship is rotated 90 degrees.
                    const tmp = this.joystickMove.x;
                    this.joystickMove.x = this.joystickMove.y;
                    this.joystickMove.y = -tmp;
                }

                this.pointerRotation = Math.atan2(this.joystickMove.y, this.joystickMove.x) + PI05;
                this.pointerMove = false;
            } else {
                this.pointerMove = true;

                // We ain for the player cursor, unless the player hasn't moved
                // the cursor in a while, then we aim in the direction of movement.
                this.cancelPointerMoveAfter = performance.now() + 1000;
            }
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('pointerdown', this.pointerDownHandler);
        document.addEventListener('pointerup', this.pointerUpHandler);
        document.addEventListener('pointermove', this.pointerMoveHandler);
    }

    pointermove(x, y) {
        this.pointerX = x;
        this.pointerY = y;
    }

    update(delta, game) {
        let dx = 0;
        let dy = 0;
        const d = 0.01;

        if (this.left) {
            dx = -delta * this.speed * d;
        }
        if (this.right) {
            dx = delta * this.speed * d;
        }
        if (this.up) {
            dy = -delta * this.speed * d;
        }
        if (this.down) {
            dy = delta * this.speed * d;
        }

        if (game.portrait) {
            // In portrait mode, the ship is rotated 90 degrees.
            const tmp = dx;
            dx = dy;
            dy = -tmp;
        }

        if (this.joystickMove) {
            dx = delta * this.speed * ((d / maxPointerMovement) * this.joystickMove.x);
            dy = delta * this.speed * ((d / maxPointerMovement) * this.joystickMove.y);
        }

        this.velocity.x += dx;
        this.velocity.y += dy;

        const vt = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (vt > this.speed) {
            const dr = this.speed / vt;
            this.velocity.x *= dr;
            this.velocity.y *= dr;
        }

        this.x = this.x + this.velocity.x * velocityScale;
        this.y = this.y + this.velocity.y * velocityScale;

        // Slowly loose velocity over time.
        const dr = Math.pow(isTouchDevice ? 0.6 : 0.9, delta / (1000 / 16));
        this.velocity.x *= dr;
        this.velocity.y *= dr;

        if (this.left) {
            if (this.up) {
                this.wantRotation = (-90 + 45) * (PI / 180);
            } else if (this.down) {
                this.wantRotation = (-90 - 45) * (PI / 180);
            } else if (!this.right) {
                this.wantRotation = -90 * (PI / 180);
            }
        } else if (this.right) {
            if (this.up) {
                this.wantRotation = (90 - 45) * (PI / 180);
            } else if (this.down) {
                this.wantRotation = (90 + 45) * (PI / 180);
            } else {
                this.wantRotation = 90 * (PI / 180);
            }
        } else if (this.up) {
            if (!this.down) {
                this.wantRotation = 0 * (PI / 180);
            }
        } else if (this.down) {
            this.wantRotation = 180 * (PI / 180);
        }

        if (game.portrait) {
            // In portrait mode, the ship is rotated 90 degrees.
            this.wantRotation -= PI05;
        }

        // We ain for the player cursor, unless the player hasn't moved
        // the cursor in a while, then we aim in the direction of movement.
        if (this.cancelPointerMoveAfter < performance.now()) {
            this.pointerMove = false;
        }

        if (this.pointerMove) {
            const mx = this.pointerX - this.x;
            const my = this.pointerY - this.y;

            this.wantRotation = Math.atan2(my, mx) + PI05;
        } else if (this.joystickMove) {
            this.wantRotation = this.pointerRotation;
        }

        // Changing 0.01 to 0.003 for example will make the ship rotate slower and will make the game harder.
        this.sprite.rotation = rotateWithSpeed(this.sprite.rotation, this.wantRotation, delta * 0.01);
    }

    die() {
        if (this.cancelShoot) {
            this.cancelShoot();
        }
    }

    shoot(game) {
        const dx = Math.cos(this.sprite.rotation - PI05);
        const dy = Math.sin(this.sprite.rotation - PI05);
        const laser = new Laser(this.x, this.y, dx, dy);

        game.laserContainer.addChild(laser);

        game.sounds.play('laser');
    }

    destroy(opts) {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        document.removeEventListener('pointerdown', this.pointerDownHandler);
        document.removeEventListener('pointerup', this.pointerUpHandler);
        document.removeEventListener('pointermove', this.pointerMoveHandler);

        super.destroy(opts);
    }
}
