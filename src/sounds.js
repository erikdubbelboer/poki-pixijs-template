import { Howl, Howler } from 'howler';

const baseVolume = 0.5; // The base volume of all our sounds.

export class Sounds {
    constructor() {
        this.sounds = {}; // name -> Howl.
        this.loaded = {}; // true|false if the sound is loaded.
        this.queued = {}; // queued sounds waiting to play when loaded.
        this.playing = {}; // name -> { id -> true }.
        this.currentRate = 1; // The rate at which sounds are played, higher will pitch up.
        this.muted = false;
        this.musicMuted = false;
        this.usable = false;

        try {
            this.muted = localStorage.getItem('savegame_asteroids_muted') === 'true';
            this.musicMuted = localStorage.getItem('savegame_asteroids_music_muted') === 'true';
        } catch (e) {
            console.error(e);
        }
    }

    init() {
        // Try loading music in this order of preference.
        const extensions = ['opus', 'm4a', 'ogg', 'mp3'];
        for (let i = 0; i < extensions.length; i++) {
            const extension = extensions[i];

            // Use Howler's built-in codec detection.
            if (Howler.codecs(extension)) {
                const m = new Audio('sounds/music.' + extension);
                m.autoplay = false;
                m.preload = 'auto';
                m.loop = true;
                m.volume = 0.3 * baseVolume;
                m.addEventListener(
                    'canplaythrough',
                    () => {
                        // Start playing one second after the browser thinks we can
                        // keep playing without pausing for buffering.
                        // The browser is sometimes a bit optimistic.
                        setTimeout(() => {
                            this.resumeMusic();
                        }, 1000);
                    },
                    false
                );

                this.music = m;

                break;
            }
        }

        this.load('click', {
            src: ['sounds/click.opus', 'sounds/click.m4a', 'sounds/click.ogg', 'sounds/click.mp3'],
            volume: 1 * baseVolume,
        });

        this.load('laser', {
            src: ['sounds/laser.opus', 'sounds/laser.m4a', 'sounds/laser.ogg', 'sounds/laser.mp3'],
            volume: 0.4 * baseVolume,
        });

        this.load('impact', {
            src: ['sounds/impact.opus', 'sounds/impact.m4a', 'sounds/impact.ogg', 'sounds/impact.mp3'],
            volume: 1 * baseVolume,
        });

        this.load('explosion', {
            src: ['sounds/explosion.opus', 'sounds/explosion.m4a', 'sounds/explosion.ogg', 'sounds/explosion.mp3'],
            volume: 0.8 * baseVolume,
        });

        this.usable = true;
    }

    load(name, options) {
        const s = new Howl(options);

        this.playing[name] = {};

        s.once('load', () => {
            this.loaded[name] = true;

            if (this.queued[name]) {
                this.play(name);
                delete this.queued[name];
            }
        });

        s.on('play', (id) => {
            // Each time we play a sound we have to keep track of the ID for
            // if we want to pause or ajust the volume of a specific sound.
            this.playing[name][id] = true;

            // Each time we play we also have to set the current rate.
            s.rate(this.currentRate, id);
        });

        const endOrStop = (id) => {
            delete this.playing[name][id];
        };

        s.on('end', endOrStop);
        s.on('stop', endOrStop);

        this.sounds[name] = s;
    }

    queue(name, noOverlap = false) {
        if (!this.usable || !this.loaded[name]) {
            this.queued[name] = true;
        } else {
            this.play(name, noOverlap);
        }
    }

    play(name, noOverlap = false) {
        if (!this.usable) {
            return;
        }
        if (!this.loaded[name]) {
            return;
        }
        if (this.muted) {
            return;
        }

        // Don't play if we're already playing and we don't want overlap.
        if (noOverlap && this.playing[name] && Object.keys(this.playing[name]).length > 0) {
            return;
        }

        this.sounds[name].play();
    }

    // stop all sounds with the given name.
    stop(name) {
        delete this.queued[name];

        if (!this.playing[name]) {
            return;
        }

        const ids = Object.keys(this.playing[name]);
        for (let j = 0; j < ids.length; j++) {
            this.sounds[name].stop(Number(ids[j]));
        }
    }

    // pause all sounds except for the background music.
    pause() {
        const names = Object.keys(this.playing);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const ids = Object.keys(this.playing[name]);

            for (let j = 0; j < ids.length; j++) {
                this.sounds[name].pause(Number(ids[j]));
            }
        }
    }

    // resume all sounds except for the background music.
    resume() {
        if (!this.usable) {
            return;
        }
        if (this.muted) {
            return;
        }

        const names = Object.keys(this.playing);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const ids = Object.keys(this.playing[name]);

            for (let j = 0; j < ids.length; j++) {
                this.sounds[name].play(Number(ids[j]));
            }
        }
    }

    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }

    resumeMusic() {
        if (!this.usable) {
            return;
        }
        if (this.musicMuted) {
            return;
        }
        if (!this.music) {
            return;
        }

        // To be able to play music we need to wait for a user interaction.
        const tryAgain = () => {
            const tryPlay = () => {
                document.removeEventListener('touchstart', tryPlay, true);
                document.removeEventListener('touchend', tryPlay, true);
                document.removeEventListener('click', tryPlay, true);
                document.removeEventListener('keydown', tryPlay, true);

                this.resumeMusic();
            };

            document.addEventListener('touchstart', tryPlay, true);
            document.addEventListener('touchend', tryPlay, true);
            document.addEventListener('click', tryPlay, true);
            document.addEventListener('keydown', tryPlay, true);
        };

        try {
            this.music.play().catch(() => {
                // If playing the music failed, we try again on the next user interaction.
                tryAgain();
            });
        } catch (ignore) {
            // If playing the music failed, we try again on the next user interaction.
            tryAgain();
        }
    }

    seek(name, s) {
        if (!this.usable) {
            return;
        }
        if (!this.loaded[name]) {
            return;
        }

        this.sounds[name].seek(s);
    }

    volume(name, v) {
        if (!this.usable) {
            return;
        }
        if (!this.loaded[name]) {
            return;
        }

        this.sounds[name].volume(v * baseVolume);
    }

    rate(r) {
        if (!this.usable) {
            return;
        }

        this.currentRate = r;

        if (this.music) {
            this.music.playbackRate = r;
        }

        const names = Object.keys(this.playing);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const ids = Object.keys(this.playing[name]);

            for (let j = 0; j < ids.length; j++) {
                this.sounds[name].rate(this.currentRate, Number(ids[j]));
            }
        }
    }

    // toggle mute on all sounds except for the background music.
    // mute means all sounds are paused, not just silent.
    toggleMute() {
        this.muted = !this.muted;

        if (this.muted) {
            this.pause();
        } else {
            this.resume();
        }

        try {
            localStorage.setItem('savegame_asteroids_muted', this.muted);
        } catch (e) {
            console.error(e);
        }
    }

    toggleMuteMusic() {
        this.musicMuted = !this.musicMuted;

        if (this.musicMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }

        try {
            localStorage.setItem('savegame_asteroids_music_muted', this.musicMuted);
        } catch (e) {
            console.error(e);
        }
    }
}
