const loadingWrapper = document.getElementById('loading-wrapper');
const loadingBar = document.getElementById('loading-bar');
const menu = document.getElementById('menu');
const startGameButton = document.getElementById('startgame');

window.showMenu = () => {
    menu.style.display = 'block';
};

function checkLoaded() {
    // If the CSS hasn't loaded yet don't show the menu.
    if (!window.cssLoaded) {
        setTimeout(checkLoaded, 100);
        return;
    }

    clearInterval(window.fakeLoadingInterval);

    if (loadingWrapper) {
        loadingWrapper.style.display = 'none';
    }

    window.showMenu();
}

function startGameMenu(showLoadingWrapper) {
    menu.style.display = 'none';

    // window.startGame will be set once the game is loaded.
    if (window.startGame) {
        loadingWrapper.style.display = 'none';

        window.startGame();
    } else {
        // If the game hasn't loaded yet show our loading screen again.
        if (showLoadingWrapper && loadingWrapper) {
            loadingWrapper.style.display = 'block';

            if (loadingBar) {
                loadingBar.style.width = '5%';
            }
        }

        // Check again in 100ms if the game has loaded.
        setTimeout(() => {
            startGameMenu(false);
        }, 100);
    }
}

startGameButton.addEventListener('click', () => {
    startGameMenu(true);
});

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Enter':
        case 'Space':
            startGameMenu(true);
            break;
    }
});

PokiSDK.init({
    //debug: true,
});

checkLoaded();
