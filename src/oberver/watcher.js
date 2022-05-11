import { parsePath } from "../utils";
import { traverse } from "./traverse"

export class Watcher {
  constructor(vm, expOrFn, cb, options = "") {
    this.vm = vm;
    this.cb = cb;
    console.log('options', options)
    if (options) {
      this.deep = !!options.deep
      this.lazy = options.lazy
      this.dirty = this.lazy
    }

    this.deps = [];
    this.depIds = new Set();

    this.getter = typeof expOrFn === 'function' ? expOrFn: parsePath(expOrFn)
    // 计算熟悉默认不取值收集依赖
    this.value = this.lazy ? void 0 : this.get();
  }
  get() {
    window.target = this;
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      traverse(value)
    }
    window.target = undefined;
    return value
  }
  evalute() {
    this.value = this.get()
    this.dirty = false; // 取值后设为false防止值无变化下次在计算
  }
  addDep(dep) {
    const id = dep.id;
    if(!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
  updata() {
    if (this.lazy) {
      this.dirty = true; // 页面重新渲染就可以获取最新的值
    } else {
      this.run();
    }
  }
  run() {
    const vm = this
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value
      this.cb.call(vm, value, oldValue)
    }
  }
}