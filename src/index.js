import { initMixin } from './init'
import { stateMixin } from './state.js'


function Vue(options) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);

export default Vue;

const vm = new Vue({
  data: {
    name: 1,
    obj: {
      name: '111',
      age: '222'
    }
  }
})

vm.$watch('obj.age', (newVal, oldVal) => {
  console.log('watch==>', newVal, oldVal)
})

vm.obj.age = 333;




