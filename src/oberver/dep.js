export class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    if(Dep.target) {
      Dep.target.addDep(this)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.updata()
    })
  }
}

const targetStack = [];
export function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target
}