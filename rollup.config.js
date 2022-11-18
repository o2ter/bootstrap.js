import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import fs from 'fs';
import path from 'path';

function readdir(dir) {
  const subdirs = fs.readdirSync(dir);
  const files = subdirs.map(subdir => {
    const res = path.resolve(dir, subdir);
    return fs.statSync(res).isDirectory() ? readdir(res).map(f => `${subdir}/${f}`) : subdir;
  });
  return files.reduce((a, f) => a.concat(f), []);
}

const rollupPlugins = [
  typescript(),
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
  commonjs({
    transformMixedEsModules: true,
  }),
  json(),
];

export default [
  {
    input: `src/index`,
    external: [
      /node_modules\/(?!sass)/
    ],
    output: [
      {
        file: `dist/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/index.mjs`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      {
          name: 'files:bootstrap',
          resolveId: (id) => {
              if (id === 'files:bootstrap') return id;
          },
          load: (id) => {
              if (id === 'files:bootstrap') {
                const dir = './node_modules/bootstrap/scss';
                const files = readdir(dir);
                const contents = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.resolve(dir, f), 'utf-8')]));
                return `export const bootstrap = ${JSON.stringify(contents)}`;
              }
          }
      },
      resolve({
        extensions: ['.ts', '.tsx', '.mjs', '.js']
      }),
      ...rollupPlugins
    ],
  },
  {
    input: `src/index`,
    external: [
      /node_modules/
    ],
    output: [
      {
        file: `dist/index.d.ts`,
        format: 'es',
      },
    ],
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.mjs', '.js']
      }),
      dts()
    ],
  },
];