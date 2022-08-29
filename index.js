import HippyVueObserver from "./src/components/hippy-vue-observer";
import HippyIntersectionObserver from "./src/utils/HippyIntersectionObserver";
import { HippyIntersectionEmitEvent } from "./src/utils/HippyIntersectionObserver";

const install = function (Vue) {
    Vue.component(HippyVueObserver.name, HippyVueObserver);
}

export default { install, HippyVueObserver };
