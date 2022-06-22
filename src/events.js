import { toArray } from './util'

export function initEvents(vm) {
  vm._event = Object.create(null);
}

export function eventsMixin(Vue) {
  Vue.prototype.$on = function (event, fn) {
    // console.log('$on', event)
    const vm = this;
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i ++) {
        vm.$on(event[i], fn)
      }
    } else {
      (vm._event[event] || (vm._events[event] = [])).push(fn)
    }
    return vm
  }
  Vue.prototype.$emit = function (event) {
    const vm = this;
    let cbs = vm._event[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      const args = toArray(arguments, 1)
    }
    return vm
  }
}