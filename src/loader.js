import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';
import { default as EventEmitter } from 'eventemitter3';

import { init as initAsteroid } from './asteroid';
import { Sounds } from './sounds';
import { isSafari14OrLower } from './util';

export class Loader extends EventEmitter {
    // extension is the best file format extension for the current browser.
    constructor(canvas, extension) {
        super();

        this.canvas = canvas;
        this.done = false;
        this.extension = extension;

        // Set the default batch size to 10k so things like ropes are properly batched.
        PIXI.Mesh.BATCHABLE_SIZE = 10000;

        // iOS 14 and lower have a bug in their WebGL implementation that causes
        // PixiJS to crash when using the new WebGL2 renderer.
        if (isSafari14OrLower()) {
            PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL_LEGACY;
        }

        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');

        this.loadingText.innerText = 'loading images...';

        this.loadingBar.style.width = '10%';

        Assets.init().then(() => {
            Assets.load(
                [
                    // Add any assets you need to have loaded before the game starts here.
                    'images/sheet' + this.extension + '.json',
                ],
                (progress) => {
                    // Update our progress, but don't let it go below 10% or above 80%.
                    const p = Math.max(progress, 0.1) * 80;
                    this.loadingBar.style.width = p + '%';
                },
            ).then(() => {
                this.postload();
            });
        });
    }

    postload() {
        let width = window.innerWidth * 1.2;
        let height = window.innerHeight * 1.2;

        this.app = new PIXI.Application({
            width,
            height,
            backgroundColor: 0,
            antialias: true,
            premultipliedAlpha: false,
            backgroundAlpha: 1,
            resolution: 1,
            autoDensity: false,
            autoStart: true,
            view: this.canvas,
            powerPreference: 'high-performance',
        });

        // Expose our app to the PixiJS Chrome Devtools
        // See: https://github.com/bfanger/pixi-inspector
        window.__PIXI_APP__ = this.app;

        const tasks = [];

        this.loadingText.innerText = 'generating images...';

        // This is an array of tasks we should execute in order before we can start the game.
        // Each entry is a function that either performs the task sync or returns a promise.
        [
            () => {
                initAsteroid(this.app);
            },
            () => {
                this.sounds = new Sounds();

                // If you have some assets you need later you can load them in the background here.
                // Assets.backgroundLoad(['images/someimage' + this.extension]);

                // This wills start the loading of the sounds, we don't have to wait for it to finish.
                this.sounds.init();

                this.loadingText.innerText = 'done';

                this.loadingBar = null;
                this.loadingText = null;

                PokiSDK.gameLoadingFinished();
                PokiSDK.setPlaytestCanvas(this.canvas);

                this.done = true;

                this.emit('done');
            },
        ].forEach((task) => tasks.push(task));

        const numTasks = tasks.length;

        const doTask = () => {
            // Update our progress, and keep it between 80% and 100%.
            const p = 80 + ((numTasks - tasks.length) / numTasks) * 20;
            if (this.loadingBar) {
                this.loadingBar.style.width = p + '%';
            }

            if (tasks.length === 0) {
                return;
            }

            const pr = tasks.shift()();

            // If the task returns a promise then wait for it to finish before continuing.
            if (pr && pr.then) {
                pr.then(() => {
                    doTask();
                });
            } else {
                // Give the browser some time to render the DOM and handle interactions.
                setTimeout(() => {
                    doTask();
                }, 1);
            }
        };

        doTask();
    }
}
