import { installRenderHelpers } from './render-helps'

export function renderMixin(Vue) {
  //创建_v, _c等等函数, 返回vnode
  installRenderHelpers(Vue.prototype)
  
  Vue.prototype._render = function () {
      const vm = this;
      const render = vm.$options.render
      let vnode = render.call(vm)
      return vnode
  }
}