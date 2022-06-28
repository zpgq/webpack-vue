import { compileToFunctions } from "./compiler";
import { initEvents } from "./events";
import { mountComponent, callHook } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./util";


export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;

    vm.$options = mergeOptions(
      vm.constructor.options,
      options || {},
    );
    // console.log('vm.$options', vm.$options)
    
    initEvents(vm)
    callHook(vm, 'beforeCreate')
    // 初始化数据, 初始化props、methods、data、computed、watch等等
    initState(vm);
    callHook(vm, 'created')

    // 解析模板渲染
    if(vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  // 挂载操作
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;

    el = document.querySelector(el);
    vm.$el = el;

    // 生成元素的查找逻辑 render -> template -> el选中的html元素
    if (!options.render) {
      let template = options.template;
      if(!template && el) {
        template = el.outerHTML // outerHTML最外层div也带上
      }
      const render = compileToFunctions(template); // 将模板编译成render函数
      options.render = render
    }
    // console.log('render=>', options.render) // 最终都是使用的render来渲染

    // 挂在组件
    mountComponent(vm, el)
  }
}