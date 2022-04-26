import { Dep } from "./dep"

export function oberve(data) {
  if(typeof data !== 'object') {
    return;
  }
  new Observer(data)
}

class Observer {
  constructor(data) {
    if (Array.isArray(data)) {

    } else {
      this.walk(data)
    }
  }
  walk(data) {
    for (const key in data) {
      defineReactive(data, key, data[key])
    }
  }
}

function defineReactive(data, key, val) {
  oberve(val)
  const dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      console.log('getter', val)
      dep.depend();
      return val;
    },
    set(newVal) {
      if(val === newVal) return
      val = newVal;
      dep.notify()
    }
  })
}