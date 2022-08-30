import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import babel from '@rollup/plugin-babel';

export default {
  input: './index.js',
  output: {
    name: 'HippyVueIntersectionObserver',
    file: './dist/index.js',
    format: 'umd',
    globals: {
      vue: 'Vue',
    },
  },
  plugins: [resolve({ extensions: ['.vue'] }), commonjs(), vue(), babel({ babelHelpers: 'bundled' })],
  external: ['vue', 'lodash/throttle'],
};
