import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle';
import { stateMixin } from './state.js'
import { randerMixin } from './vnode';


function Vue(options) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
lifecycleMixin(Vue)
randerMixin(Vue)

window.Vue = Vue;
export default Vue;


