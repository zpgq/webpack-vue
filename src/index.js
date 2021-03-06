import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle';
import { stateMixin } from './state.js'
import { eventsMixin } from './events'
import { renderMixin } from './render.js';
import { initGlobalApi } from './global-api';


function Vue(options) {
  this._init(options);
}

initGlobalApi(Vue); // 全局api

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue);

window.Vue = Vue;
export default Vue;


