import { initMixin } from './init'
import { stateMixin } from './state.js'


function Vue(options) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);

window.Vue = Vue;
export default Vue;


