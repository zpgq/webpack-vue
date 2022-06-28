import { Dep } from "./dep"
import { arrayMethods } from './array'
import { def, hasOwn } from "../util";

export function observe(value) {
  if (typeof value !== 'object') {
    return;
  }

  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value);
  }

  return ob
}

class Observer {
  constructor(value) {
    this.dep = new Dep();
    def(value, '__ob__', this);

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(obj) {
    for (const key in obj) {
      defineReactive(obj, key)
    }
  }
  observeArray(items) {
    for (const item of items) {
      observe(item)
    }
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();

  if (arguments.length === 2) {
    val = obj[key];
  }
  const childOb = observe(val);

  Object.defineProperty(obj, key, {
    get() {
      dep.depend();
      if (childOb) {
        childOb.dep.depend()
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) return
      val = newVal;
      console.log(dep)
      dep.notify()
    }
  })
}