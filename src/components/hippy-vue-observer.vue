<script>
import HippyIntersectionObserver from "../utils/HippyIntersectionObserver";
import Bus from '../utils/bus.js';

export default {
  name: "hippy-vue-observer",
  props: ['scope', 'rootMargin', 'thresholds', 'throttle'],
  data() {
    return {
      observer: null,
      isMounted: false,
    };
  },
  mounted() {
    const options = {
      rootMargin: this.rootMargin,
      thresholds: this.thresholds,
      throttle: this.throttle,
    };
    const callback = entries => {
      entries.forEach(entry => {
        this.$emit("on-change", entry);
      });
    }
    this.observer = new HippyIntersectionObserver(Bus, this.scope, callback, options);
    this.observer.observe(this.$slots.default[0].elm);
    this.isMounted = true;
  },
  beforeDestroy() {
    this.observer.unobserve(this.$slots.default[0].elm);
    this.isMounted = false;
  },
  render(h) {
    return h('div', {collapsable: "false"}, this.$slots.default);
  }
}
</script>

