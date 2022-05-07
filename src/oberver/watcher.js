import { parsePath } from "../utils";
import { traverse } from "./traverse"

export class Watcher {
  constructor(vm, expOrFn, cb, options = "") {
    this.vm = vm;
    this.cb = cb;
    if (options) {
      this.deep = !!options.deep
    }

    this.deps = [];
    this.depIds = new Set();

    this.getter = typeof expOrFn === 'function' ? expOrFn: parsePath(expOrFn)
    this.value = this.get();
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
  addDep(dep) {
    const id = dep.id;
    if(!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  updata() {
    this.run();
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