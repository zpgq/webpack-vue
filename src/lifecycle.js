import { patch } from "./vnode/patch"

export function lifecycleMixin(Vue) {
    Vue.prototype._updata = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    // 调用rander方法渲染el熟悉

    // 1. 调用rander函数创建虚拟节点
    // 2. 将虚拟节点渲染到页面
    vm._updata(vm._rander())
}