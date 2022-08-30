# hippy-vue-intersection-observer

hippy-vue-intersection-observer is a [Hippy-Vue](https://hippyjs.org/#/hippy-vue/introduction) implementation of [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). 

It provides an easier way to detect view exposure in complex application.

Note: This component is inspired by and adapted from  ['rn-intersection-observer'](https://www.npmjs.com/package/rn-intersection-observer)

## Install
```bash
# Install using Yarn:
yarn add hippy-vue-intersection-observer

# or NPM:
npm install -S hippy-vue-intersection-observer
```

## Usage

### Target view

```vue
<hippy-vue-observer
  scope="YourOwnScope"
  :thresholds="[0.2, 0.5]"
  @on-change="onIntersectionChange"
>
{/* your own view */}
</hippy-vue-observer>


<script>

import { HippyVueObserver, HippyIntersectionEmitEvent } from "hippy-vue-intersection-observer";

// register hippy-vue-observer before use
Vue.use(HippyVueObserver);

// ...

export default {
  // ...
  methods: {
    onIntersectionChange(entry) {
      console.log(entry);
    },
  },
  
}

</script>

```

### Trigger detection from Vue

```vue
methods: {
    onScroll(e) {
      HippyIntersectionEmitEvent("myScope");
    },
}
```


### Trigger detection from Native

```java  
HippyMap hippyMap = new HippyMap();
hippyMap.pushString("scope", "YourOwnScope");
mEngineManager.getCurrentEngineContext()
    .getModuleManager()
    .getJavaScriptModule(EventDispatcher.class)
    .receiveNativeEvent("IntersectionObserverEvent", hippyMap);
```

```oc
// 可参考HippyEventObserverModule.m
[self sendEvent:@"IntersectionObserverEvent" params:@{ @"scope": @"YourOwnScope" }];
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params {
    HippyAssertParam(eventName);
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" 
                                    methodName:@"receiveNativeEvent" 
                                          args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}
```

## Props & Params

### 1) IntersectionObserver / hippy-vue-observer

| Props                                                                                          | Params Type                                                | Description                                                      |
|:-----------------------------------------------------------------------------------------------|:-----------------------------------------------------------|:-----------------------------------------------------------------|
| scope                                                                                          | string                                                     | Scope of the target View, required in event trigger.             |
| [rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin) | {top: number, left: number, bottom: number, right: number} | Distance from screen edge of detect area.                        |
| [thresholds](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds) | number[]                                                   | Intersection ratios which should trigger intersection callbacks. |
| throttle                                                                                       | number                                                     | Throttle time between each detection(ms).                        |


### 2) Intersection Callback (on-change)

Different from IntersectionObserver, hippy-vue-observer provides single parameter.

| Params                                                                                               | Params Type                                                | Description                                                        |
|:-----------------------------------------------------------------------------------------------------|:-----------------------------------------------------------|:-------------------------------------------------------------------|
| [boundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) | {top: number, left: number, bottom: number, right: number} | Position of target View's edge.                                    |
| intersectionRatio                                                                                    | number                                                     | Intersection ratio of target View in detect area                   |
| intersectionRect                                                                                     | {top: number, left: number, bottom: number, right: number} | Position of intersection area's edge.                              |
| target                                                                                               | Ref                                                        | Ref of target View                                                 |
| isIntersecting                                                                                       | boolean                                                    | Determine current intersection ratio is larger than any threshold. |


## License

ISC
