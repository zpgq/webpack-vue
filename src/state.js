import { observe } from "./oberver";
import { Dep } from "./oberver/dep";
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
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) initWatch(vm)
}

function getData(data, vm) {
  return data.call(vm, vm)
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

function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evalute()
      }
      if (Dep.target) {
        watcher.depend() // 收集渲染watcher
      }
      return watcher.value
    }
  }
}
function defineComputed(vm, key, userDef) {
  const sharedPropertyDefinetion = {
    get: () => {},
    set: () => {}
  }

  if (typeof userDef === 'function') {
    sharedPropertyDefinetion.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinetion.get = createComputedGetter(key);
    sharedPropertyDefinetion.set = userDef.set
  }
  Object.defineProperty(vm, key, sharedPropertyDefinetion)
}
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null);
  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function'? userDef: userDef.get;
    watchers[key] = new Watcher(vm, getter, () => {}, {lazy: true})
    defineComputed(vm, key, userDef)
  }
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    const vm = this;
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}