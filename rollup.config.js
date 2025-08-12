import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const external = ['axios', 'eventemitter3'];

export default [
  // Browser builds (core only)
  {
    input: 'src/core.ts',
    output: [
      {
        file: 'dist/ainative.umd.js',
        format: 'umd',
        name: 'AINative',
        globals: {
          axios: 'axios',
          eventemitter3: 'EventEmitter3'
        }
      },
      {
        file: 'dist/ainative.umd.min.js',
        format: 'umd',
        name: 'AINative',
        globals: {
          axios: 'axios',
          eventemitter3: 'EventEmitter3'
        },
        plugins: [terser()]
      }
    ],
    external,
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      json(),
      typescript({ 
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/react/**', '**/vue/**']
      })
    ]
  },
  // Node.js and module builds (core only)
  {
    input: 'src/core.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm'
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({ 
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/react/**', '**/vue/**']
      })
    ]
  },
  // Type definitions
  {
    input: 'src/core.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts({
      exclude: ['**/react/**', '**/vue/**']
    })]
  }
];