import { compileToFunctions } from "./compiler";
import { initState } from "./state";


export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options || {};

    // 初始化数据, 初始化props、methods、data、computed、watch等等
    initState(vm);


    if(vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  // 挂载操作
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;

    el = document.querySelector(el);

    // 生成元素的查找逻辑 rander -> template -> el选中的html元素
    if (!options.rander) {
      let template = options.template;
      if(!template && el) {
        template = el.outerHTML // outerHTML最外层div也带上
      }
      const rander = compileToFunctions(template); // 将模板编译成rander函数
      options.rander = rander
    }
    // console.log(options.rander) // 最终都是使用的rander来渲染
  }
}