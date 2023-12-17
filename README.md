# Poki PixiJS Template

Welcome to the **poki-pixijs-template**! This is a quick and dirty template to help developers swiftly build hypercasual PixiJS games.

## Philosophy

The idea behind this template is to support short-term projects that span a couple of months. The aim is to maintain a high project velocity. You should be able to keep everything in mind without heavily structuring your code. Think of it as "move fast and maybe break things", but with fun.

## Features

-   **Progressive Loading**: The game menu loads first, making initial user interaction swift.
-   **Optimized Assets**: The template supports various image and audio formats, ensuring the smallest asset size.
-   **Image Spritesheet**: The template leverages [TexturePacker](https://www.codeandweb.com/texturepacker) to combine all images into a spritesheet.
-   **HTML UI**: By default, the game uses HTML for the menu and in-game UI. However, PixiJS can also be utilized for this.
-   **Audio Integration**: [howler.js](https://github.com/goldfire/howler.js) is used for game sounds and a native Audio element for music streaming.

## Example game

The example game from this template can be found here: https://inspector.poki.dev/?game=external-erikdubbelboer.github.io%252Fpoki-pixijs-template%252F

## File Structure

Here's a brief overview of the project's file structure:

-   **Configuration**: `.babelrc`, `.browserslistrc`, `.eslint*`, `.prettier*`, `.stylelintrc.json`, `rollup.config.mjs`, `package.json`
-   **Art Assets**: Inside the `images/` directory.
-   **Web Assets**: Housed in the `public/` directory.
-   **Game Logic & Modules**: All `.js` files within the `src/` directory.
-   **Helpers**: `updateimages.sh`, `updatesouds.sh`
-   **Dependencies**: `yarn.lock`

## File Structure Details

Before diving in, let's familiarize ourselves with the main files and their responsibilities:

1. **menu.js**:

    - **Purpose**: Manages the game's HTML menu functionality.
    - **Execution**: Loaded before the game itself. When `startGameMenu()` is invoked, it checks if the game has loaded. If it's loaded, it directly calls `startGame()`. If not, it shows the loading progress before eventually launching `startGame()`.

2. **index.js**:

    - **Purpose**: Serves as the primary gateway to the game.
    - **Execution**: Initiates a `Loader` (sourced from `loader.js`) and subsequently generates a `Game` object (from `game.js`) to kick off the game.

3. **loader.js**:

    - **Purpose**: Responsible for loading visuals and other resources.
    - **Execution**: Constructs the `PIXI.Application` object which is consistently employed by all `Game` objects.

4. **sounds.js**:

    - **Purpose**: Handles sound resources, from loading to playback.
    - **Execution**: Once all primary loading is finished, it silently loads sound assets in the background, ensuring that gameplay isn't held up waiting for sound resources.

5. **game.js**:
    - **Purpose**: Manages the central game mechanics, from game state to event handling.
    - **Execution**: Contains the primary game loop, reacting to user input and updating game states.

## Getting Started

1. Clone this repository:

    ```bash
    git clone git@github.com:erikdubbelboer/poki-pixijs-template.git
    cd poki-pixijs-topdown-template
    ```

2. Install dependencies:

    ```bash
    yarn install
    ```

3. Start the development server:

    ```bash
    yarn watch
    ```

    This will start a local server at `http://localhost:8080/` to serve the `public/` directory and watch for changes in the `src/` directory.

    You can now test your game by opening the [Poki Inspector](https://inspector.poki.dev/?game=external-http%253Alocalhost%253A8080) or [localhost](http://localhost:8080/) in your browser.

4. For production, build the game:
    ```bash
    yarn build
    ```
    This will produce a `dist` directory that can be uploaded to the [Poki Inspector](https://inspector.poki.dev/) or [Poki for Developers](https://app.poki.dev/).

## Games build with this template

-   [Silly Sky](https://poki.com/en/g/silly-sky)
-   [Million Spaceships (in early stage)](https://inspector.poki.dev/?game=upload-ckerd559qpsb0ojimi6g)

## Contribution

Feel free to dive in! Open an issue, submit a PR, or provide suggestions to improve the template.

## License & Credits

Please check `credits.txt` for the example game assets' credits. The codebase itself is under the MIT License.

---

Happy game building! Hope this template helps streamline your development process and lets you focus on making games fun.
