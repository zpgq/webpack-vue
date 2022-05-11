let uid = 0;
export class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    if (window.target) {
      window.target.addDep(this)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.updata()
    })
    console.log('this.subs', this.subs)
  }
  removeSub(sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      return this.subs.splice(index, 1)
    }
  }
}

let stack = []; // 为了收集渲染watcher, 计算属性时需要使用
export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher;
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
  // Dep.target = null;
}