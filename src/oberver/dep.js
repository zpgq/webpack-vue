export class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    if(window.target) {
      window.target.addDep(this)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.updata()
    })
  }
}