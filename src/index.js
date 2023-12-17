import { Loader } from './loader';
import { Game } from './game';

function init(extension) {
    let loadingWrapper = document.getElementById('loading-wrapper');
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('canvas');
    const loader = new Loader(canvas, extension);
    let gameStarted = false;

    window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    window.addEventListener('pagehide', () => {
        if (loader.sounds) {
            loader.sounds.pauseMusic();
        }
    });
    window.addEventListener('blur', () => {
        if (loader.sounds) {
            loader.sounds.pauseMusic();
        }
    });

    window.addEventListener('focus', () => {
        if (loader.sounds) {
            loader.sounds.resumeMusic();
        }
    });
    window.addEventListener('pageshow', () => {
        if (loader.sounds) {
            loader.sounds.resumeMusic();
        }
    });

    // window.startGame is called by the menu to start the game.
    window.startGame = () => {
        if (gameStarted) {
            return;
        }
        gameStarted = true;

        // When the loader isn't done yet, we show the loading screen
        // and wait for the loader to finish.
        if (!loader.done) {
            if (loadingWrapper) {
                loadingWrapper.style.display = 'block';
            }

            loader.once('done', () => {
                // Set gameStarted to false so the check above works again.
                gameStarted = false;
                window.startGame();
            });
            return;
        }

        if (loadingWrapper) {
            loadingWrapper.remove();
            loadingWrapper = null;
        }

        loader.sounds.play('click');

        menu.style.display = 'none';
        canvas.style.display = 'block';

        window.game = new Game(loader).once('done', () => {
            gameStarted = false;

            canvas.style.display = 'none';

            window.showMenu();
        });
    };
}

function supportsImg(data, cb) {
    if (!window.createImageBitmap) {
        cb(false);
        return;
    }

    fetch(data)
        .then((r) => {
            r.blob()
                .then((blob) => {
                    createImageBitmap(blob)
                        .then(
                            () => cb(true),
                            () => cb(false),
                        )
                        .catch(() => cb(false));
                })
                .catch(() => cb(false));
        })
        .catch(() => cb(false));
}

supportsImg(
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    (supported) => {
        if (supported) {
            init('.avif');
        } else {
            supportsImg('data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=', (supported) => {
                if (supported) {
                    init('.webp');
                } else {
                    init('.png');
                }
            });
        }
    },
);
