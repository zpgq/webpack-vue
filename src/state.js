import { observe } from "./oberver";
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

  if (opts.props) initProps(vm);
  if (opts.methods) initMethods(vm)
  if (opts.data) initData(vm)
  if (opts.computed) initComputed(vm)
  if (opts.watch) initWatch(vm)
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
  observe(data)
}

function getData(data, vm) {
  return data.call(vm, vm)
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    const vm = this;
    const watcher = new Watcher(vm, expOrFn, cb, options)
  }
}