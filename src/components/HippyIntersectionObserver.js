import Vue from 'vue';
import throttle from 'lodash/throttle';
import Bus from './bus';

function restrictValueInRange(start = 0, end = 0, value = 0) {
  return Math.min(Math.max(start, value), end);
}

function getLastMatchedThreshold(value, thresholds) {
  let matchedThreshold = 0;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value >= thresholds[i]) {
      matchedThreshold = thresholds[i];
    }
  }
  return matchedThreshold;
}

export const IntersectionObserverEvent = 'IntersectionObserverEvent';
export const kDefaultRootMargin = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
export const kDefaultThresholds = [0];
export const kDefaultThrottle = 300;

class HippyIntersectionObserver {
  constructor(app, scope, callback, options) {
    this.targets = [];
    this.previousIntersectionRatios = new Map(); // 前一次的相交比例，决定是否回调
    /**
     * 开始监听指定元素
     * @param target 目标元素
     */
    this.observe = (target) => {
      const index = this.targets.indexOf(target);
      if (index < 0) {
        this.targets.push(target);
        this.measureTarget(target).then((targetMeasureResult) => {
          this.callback([targetMeasureResult]);
          this.previousIntersectionRatios.set(target, targetMeasureResult.intersectionRatio);
        });
      }
      if (this.targets.length > 0) {
        this.app.$on(IntersectionObserverEvent, throttle(this.handleEmitterEvent, this.throttle));
      }
    };
    /**
     * 停止监听指定元素
     * @param target 目标元素
     */
    this.unobserve = (target) => {
      const index = this.targets.indexOf(target);
      if (index >= 0) {
        this.targets.splice(index, 1);
      }
      if (this.targets.length <= 0) {
        // todo: check is null ok?
        this.app.$off(IntersectionObserverEvent, null);
      }
    };
    this.measureTarget = (target) => {
      return new Promise((resolve) => {
        if (target === undefined) {
          // do nothing
        }
        Vue.Native.measureInWindow(target).then((measureResult) => {
          const boundingClientRect = {
            left: measureResult.left,
            top: measureResult.top,
            right: measureResult.right,
            bottom: measureResult.bottom,
          };
          console.log('debug: measure in window result:');
          console.log(boundingClientRect);
          const { intersectionRatio, intersectionRect } = this.measureIntersection(boundingClientRect);
          const isIntersecting = this.isIntersecting(intersectionRatio);
          const targetMeasureResult = {
            boundingClientRect,
            intersectionRatio,
            intersectionRect,
            target,
            isIntersecting,
          };
          resolve(targetMeasureResult);
        });
      });
    };

    this.handleEmitterEvent = (params) => {
      if (params.scope && params.scope.length && this.scope && this.scope.length && params.scope !== this.scope) {
        return;
      }
      const measureTasks = this.targets.map((target) => {
        return this.measureTarget(target);
      });
      Promise.all(measureTasks).then((measureResults) => {
        const needReportEntries = measureResults.filter((measureResult) => {
          const previousRatio = this.previousIntersectionRatios.get(measureResult.target);
          return this.needReportIntersection(measureResult.intersectionRatio, previousRatio);
        });
        measureResults.forEach((measureResult) => {
          this.previousIntersectionRatios.set(measureResult.target, measureResult.intersectionRatio);
        });
        if (needReportEntries && needReportEntries.length > 0) {
          this.callback(needReportEntries);
        }
      });
    };

    this.isIntersecting = (intersectionRatio) => {
      const minIntersectionThreshold = Math.max(Math.min(...this.thresholds), 0);
      return intersectionRatio >= minIntersectionThreshold;
    };

    this.needReportIntersection = (ratio, previousRatio = 0) => {
      console.log(`debug: intersection ratio:${ratio}, previous:${previousRatio}`);
      if (this.isIntersecting(ratio) !== this.isIntersecting(previousRatio)) {
        return true;
      }
      return (
        getLastMatchedThreshold(ratio, this.thresholds) !== getLastMatchedThreshold(previousRatio, this.thresholds)
      );
    };

    this.measureIntersection = (boundingClientRect) => {
      const { window } = Vue.Native.Dimensions;
      const pageHeight = window.height;
      const pageWidth = window.width;
      // 计算屏幕可见区域
      const displayAreaTop = this.rootMargin.top;
      const displayAreaBottom = pageHeight - this.rootMargin.bottom;
      const displayAreaLeft = this.rootMargin.left;
      const displayAreaRight = pageWidth - this.rootMargin.right;
      // 计算目标元素可视区域
      const visibleTop = restrictValueInRange(displayAreaTop, displayAreaBottom, boundingClientRect.top);
      const visibleBottom = restrictValueInRange(displayAreaTop, displayAreaBottom, boundingClientRect.bottom);
      const visibleLeft = restrictValueInRange(displayAreaLeft, displayAreaRight, boundingClientRect.left);
      const visibleRight = restrictValueInRange(displayAreaLeft, displayAreaRight, boundingClientRect.right);
      // 计算两个区域的面积
      const itemArea =
        (boundingClientRect.bottom - boundingClientRect.top) * (boundingClientRect.right - boundingClientRect.left);
      const visibleArea = (visibleBottom - visibleTop) * (visibleRight - visibleLeft);
      const intersectionRect = {
        top: visibleTop,
        bottom: displayAreaBottom,
        left: visibleLeft,
        right: displayAreaRight,
      };
      const intersectionRatio = itemArea ? visibleArea / itemArea : 0;
      const intersectionRatioRound = Math.round(intersectionRatio * 100) / 100;
      return {
        intersectionRect,
        intersectionRatio: intersectionRatioRound,
      };
    };
    this.app = app;
    this.scope = scope;
    this.rootMargin = (options && options.rootMargin) || kDefaultRootMargin;
    this.thresholds = (options && options.thresholds) || kDefaultThresholds;
    this.throttle = (options && options.throttle) || kDefaultThrottle;
    this.thresholds.sort();
    this.callback = callback;
  }
}

/**
 * 触发IntersectionObserver检测，通常在onScroll时机进行触发
 * @param scope
 */
export function HippyIntersectionEmitEvent(scope) {
  const emitFunc = throttle((scope) => {
    Bus.$emit(IntersectionObserverEvent, {
      scope,
    });
  }, 50);
  return emitFunc(scope);
}

export default HippyIntersectionObserver;
