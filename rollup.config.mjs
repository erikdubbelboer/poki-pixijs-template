import fs from 'fs';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import CleanCSS from 'clean-css';
import { minify } from 'html-minifier-terser';

const plugins = [resolve({ browser: true, preferBuiltins: false }), commonjs(), babel({ babelHelpers: 'bundled' })];

// For 'yarn watch' we use public as output directory and serve it on localhost:8080
let target = 'public';

if (process.argv.includes('-w')) {
    plugins.push(serve({ contentBase: target, port: 8080 }));
} else {
    // For 'yarn build' we use dist as output directory and minify the output
    target = 'dist';

    plugins.push(terser());

    fs.mkdirSync('dist/css', { recursive: true });

    fs.cpSync('public/images', 'dist/images', { recursive: true });
    fs.cpSync('public/sounds', 'dist/sounds', { recursive: true });

    const css = new CleanCSS({ level: 2 });
    fs.writeFileSync('dist/css/loader.css', css.minify(fs.readFileSync('public/css/loader.css')).styles);
    fs.writeFileSync('dist/css/index.css', css.minify(fs.readFileSync('public/css/index.css')).styles);
    fs.cpSync('public/css/quicksand.woff2', 'dist/css/quicksand.woff2');

    fs.writeFileSync(
        'dist/index.html',
        await minify(fs.readFileSync('public/index.html', 'utf8'), {
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeAttributeQuotes: true,
            removeComments: true,
            minifyJS: true,
        }),
    );
}

export default [
    {
        input: 'src/index.js',
        output: {
            file: `${target}/index.js`,
            format: 'iife',
            sourcemap: target !== 'dist',
        },
        plugins,
    },
    {
        input: 'src/menu.js',
        output: {
            file: `${target}/menu.js`,
            format: 'iife',
            sourcemap: target !== 'dist',
        },
        plugins,
    },
];
