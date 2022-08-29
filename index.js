import HippyVueObserver from "./src/components/hippy-vue-observer";
export { HippyIntersectionEmitEvent } from "./src/components/HippyIntersectionObserver";

const install = function (Vue) {
    Vue.component(HippyVueObserver.name, HippyVueObserver);
}

export default { install, HippyVueObserver };
