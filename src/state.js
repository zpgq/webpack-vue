import { oberve } from "./oberver";
import { Watcher } from "./oberver/watcher";

function proxy(target, soureKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[soureKey][key]
    },
    set(val) {
      target[soureKey][key] = val
    }
  })
}

export function initState(vm) {
  vm._watchers = [];
  const opts = vm.$options;

  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) initComputed(vm, opts.computed)
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data

  const keys = Object.keys(data)
  let i = keys.length;
  while (i--) {
    const key = keys[i]
    proxy(vm, '_data', key)
  }
  oberve(data)
}

function getData(data, vm) {
  return data.call(vm, vm)
}

function initComputed(vm, computed) { }

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    const vm = this;
    const watcher = new Watcher(vm, expOrFn, cb, options)
  }
}