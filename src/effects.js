import * as particles from '@pixi/particle-emitter';

import { lerpColor } from './util';

// For more emitter examples, see: https://github.com/pixijs/particle-emitter#examples
export function spawnExplosion(game, x, y, dx, dy, size, color) {
    const emitter = new particles.Emitter(game.emittersContainer, {
        lifetime: {
            min: 0.5,
            max: 0.5,
        },
        frequency: 0.008,
        emitterLifetime: 0.1,
        maxParticles: 10,
        addAtBack: false,
        pos: {
            x,
            y,
        },
        behaviors: [
            {
                type: 'alpha',
                config: {
                    alpha: {
                        list: [
                            {
                                time: 0,
                                value: 0.8,
                            },
                            {
                                time: 1,
                                value: 0.1,
                            },
                        ],
                    },
                },
            },
            {
                type: 'scale',
                config: {
                    scale: {
                        list: [
                            {
                                time: 0,
                                value: size / 40,
                            },
                            {
                                time: 1,
                                value: size / 120,
                            },
                        ],
                    },
                    minMult: 1,
                },
            },
            {
                type: 'color',
                config: {
                    color: {
                        list: [
                            {
                                time: 0,
                                value: ('00000' + color.toString(16)).substr(-6),
                            },
                            {
                                time: 1,
                                value: ('00000' + Math.floor(lerpColor(color, 0, 0.5)).toString(16)).substr(-6),
                            },
                        ],
                    },
                },
            },
            {
                type: 'rotationStatic',
                config: {
                    min: 0,
                    max: 360,
                },
            },
            {
                type: 'textureRandom',
                config: {
                    textures: ['particle.png'],
                },
            },
            {
                type: 'spawnShape',
                config: {
                    type: 'torus',
                    data: {
                        x: 0,
                        y: 0,
                        radius: 10,
                        innerRadius: 0,
                        affectRotation: false,
                    },
                },
            },
            {
                type: 'moveAcceleration',
                config: {
                    accel: {
                        x: dx * 100,
                        y: dy * 100,
                    },
                    minStart: size * 2,
                    maxStart: size * 2,
                    rotate: true,
                },
            },
        ],
    });

    game.sounds.play('explosion');

    emitter.playOnceAndDestroy();
}
