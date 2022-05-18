import { patch } from "./vnode/patch"

export function lifecycleMixin(Vue) {
    Vue.prototype._updata = function (vnode) {
        const vm = this;
        // 使用新建的元素替换老的元素
        vm.$el = patch(vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el;
    // 调用rander方法渲染el熟悉
    // 1. 调用rander函数创建虚拟节点
    // 2. 将虚拟节点渲染到页面
    vm._updata(vm._rander())
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        for (let i = 0; i < handlers.length; i ++) {
            try {
                handlers[i].call(vm)
            } catch (error) {
                console.log('error', error)
            }
        }
    }
}