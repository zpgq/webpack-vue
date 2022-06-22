import { nextTick, parsePath } from "../util";
import { popTarget, pushTarget } from "./dep";
import { traverse } from "./traverse"

let uid = 0;
export class Watcher {
  constructor(vm, expOrFn, cb, options = "") {
    this.id = uid ++; // 批量更新相同watcher去重
    this.vm = vm;
    this.cb = cb;

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
    // window.target = this;
    pushTarget(this)
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      traverse(value)
    }
    // window.target = undefined;
    popTarget()
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
      queueWatcher(this); // 暂存, 批量处理watcher
      // this.run();
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
  depend() {
    let i = this.deps.length;
    while (i --) {
      this.deps[i].depend() // 收集渲染watcher
    }
  }
}

let queue = []; // 将需要批量更新的watcher存到队列中, 稍后执行
let has = {}; // watcher去重
let padding = false;

function flushSchedulerQueue() {
  queue.forEach(watcher => watcher.run())
  queue = [];
  has = {};
  padding = false;
}

function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    queue.push(watcher)
    has[id] = true;
  }

  // 异步执行, 相同的watcher值执行一次
  if (!padding) {
    nextTick(flushSchedulerQueue) // 异步更新
    padding = true
  }
}