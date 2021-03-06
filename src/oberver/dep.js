let uid = 0;
export class Dep {
  constructor() {
    this.id = uid++; // 相同状态创建依赖去重
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.updata()
    })
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
}