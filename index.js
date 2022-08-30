import HippyVueObserver from './src/components/hippy-vue-observer';
export { HippyIntersectionEmitEvent } from './src/components/HippyIntersectionObserver';

const install = function (Vue) {
  Vue.component(HippyVueObserver.name, HippyVueObserver);
};

const plugin = { install, HippyVueObserver };
export { plugin as HippyVueObserver };
