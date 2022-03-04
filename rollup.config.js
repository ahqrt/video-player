import resolve  from '@rollup/plugin-node-resolve'
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from 'rollup-plugin-terser'
import css from "rollup-plugin-import-css"
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss'
import svg from 'rollup-plugin-svg'
export default [
    // {
    //     input: './src/index.ts',
    //     output: {
    //         exports: 'auto',
    //         dir: 'dist',
    //         declarationDir: 'dist',
    //         format: 'cjs',
    //         entryFileNames: '[name].cjs.js',
    //     },
    //     plugins: [terser(), resolve(), commonjs(), json(),typescript(),  css(), scss(), svg()],
    // },
    // {
    //     input: './src/index.ts',
    //     output: {
    //         exports: 'auto',
    //         dir: 'dist',
    //         format: 'esm',
    //         entryFileNames: '[name].esm.js',
    //     },
    //     plugins: [terser(), resolve(), commonjs(),json(), typescript(), css(), scss(), svg()],
    // },
    {
        input: './src/index.ts',
        output: {
            exports: 'auto',
            dir: 'dist',
            format: 'iife',
            entryFileNames: 'videoPlayer.js',
        },
        plugins: [terser(), resolve(), commonjs(),json(), typescript(), css(), scss(), svg()],
    }
];
