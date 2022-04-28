import { parsePath } from "../utils";
import { traverse } from "./traverse"
import { delTarget, pushTarget } from "./dep";

export class Watcher {
  constructor(vm, expOrFn, cb, options = "") {
    this.vm = vm;
    this.cb = cb;
    if(options) {
      this.deep = !!options.deep
    }

    this.getter = typeof expOrFn === 'function' ? expOrFn: parsePath(expOrFn)
    this.value = this.get();
    console.log('【value】', this.value)
  }
  get() {
    window.target = this;
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    if(this.deep) {
      traverse(value)
    }
    window.target = undefined;
    return value
  }
  addDep(dep) {
    dep.addSub(this)
  }
  updata() {
    this.run();
  }
  run() {
    console.log('【updata value】', this.value)
    
    // const value = this.get();
    // if (value !== this.value) {
    //   console.log('a')
    //   const oldValue = this.value
    //   this.cb.call(vm, value, oldValue)
    // }
  }
}