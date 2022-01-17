import resolve  from '@rollup/plugin-node-resolve'
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from 'rollup-plugin-terser'
export default [
    {
        input: './src/index.ts',
        output: {
            exports: 'auto',
            dir: 'dist',
            declarationDir: 'dist',
            format: 'cjs',
            entryFileNames: '[name].cjs.js',
        },
        plugins: [terser(), resolve(), commonjs(), typescript()],
    },
    {
        input: './src/index.ts',
        output: {
            exports: 'auto',
            dir: 'dist',
            format: 'esm',
            entryFileNames: '[name].esm.js',
        },
        plugins: [terser(), resolve(), commonjs(), typescript()],
    },
    {
        input: './src/index.ts',
        output: {
            exports: 'auto',
            dir: 'dist',
            format: 'iife',
            entryFileNames: 'videoPlayer.js',
        },
        plugins: [terser(), resolve(), commonjs(), typescript()],
    }
];
