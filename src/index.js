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
    arr: [1, 2, 3],
    obj: {
      name: '111',
      age: '222'
    }
  }
})

vm.$watch('obj', (newVal, oldVal) => {
  console.log('watch==>', newVal, oldVal)
}, {deep: true})


vm.obj.name = 333

console.log(vm.obj.name)


// vm.arr.push(22)




