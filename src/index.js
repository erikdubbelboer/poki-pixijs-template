import { Loader } from './loader';
import { Game } from './game';

function init(extension) {
    let loadingWrapper = document.getElementById('loading-wrapper');
    const menu = document.getElementById('menu');
    const canvas = document.getElementById('canvas');
    const loader = new Loader(canvas, extension);
    let gameStarted = false;

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

    window.startGame = () => {
        if (gameStarted) {
            return;
        }
        gameStarted = true;

        if (!loader.done) {
            if (loadingWrapper) {
                loadingWrapper.style.display = 'block';
            }

            loader.once('done', () => {
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

const avif = new Image();
avif.addEventListener('load', () => {
    init('.avif');
});
avif.addEventListener('error', () => {
    const webp = new Image();
    webp.addEventListener('load', () => {
        init('.webp');
    });
    webp.addEventListener('error', () => {
        init('.png');
    });
    webp.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
});
avif.src =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
