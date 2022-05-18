import { observe } from ".";
import { def } from "../util";

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

;[
  'push'
].forEach(method => {
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;

      let insert
      switch (method) {
        case 'push':
          insert = args
      }
      if(insert) ob.observeArray(insert);
      
      ob.dep.notify();
      return result
    })
  });