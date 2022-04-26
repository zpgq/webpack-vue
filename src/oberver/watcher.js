import { parsePath } from "../utils";
import { pushTarget } from "./dep";

export class Watcher {
  constructor(vm, expOrFn, cb, options = {}) {
    this.vm = vm;
    this.cb = cb
    this.getter = parsePath(expOrFn)
    this.value = this.get();
  }
  addDep(dep) {
    dep.addSub(this)
  }
  get() {
    pushTarget(this)
    const vm = this.vm
    const value = this.getter.call(vm, vm)
    return value
  }
  updata() {
    this.run()
  }
  run() {
    const value = this.get()
    if( value !== this.value) {
      const oldValue = this.value
      this.cb(value, oldValue)
    }
  }
}