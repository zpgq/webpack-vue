let uid = 0;
export class Dep {
  constructor() {
    this.id = uid ++;
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