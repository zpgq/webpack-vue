import { installRenderHelpers } from './rander-helps'

export function randerMixin(Vue) {
  //创建_v, _c等等函数, 返回vnode
  installRenderHelpers(Vue.prototype)
  
  Vue.prototype._rander = function () {
      const vm = this;
      const rander = vm.$options.rander
      let vnode = rander.call(vm)
      console.log('vnode', vnode)
      return vnode
  }
}