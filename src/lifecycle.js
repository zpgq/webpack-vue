import { Watcher } from "./oberver/watcher";
import { patch } from "./vnode/patch"

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        // 使用新建的元素替换老的元素
        vm.$el = patch(vm.$el, vnode)
    }
}

export function mountComponent(vm, el) {
    vm.$el = el;
    // 调用render方法渲染el熟悉
    // 1. 调用render函数创建虚拟节点
    // 2. 将虚拟节点渲染到页面
    let updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, ()=>{}, {
        before() {
            callHook(vm, 'beforeUpdate')
        }
    }, true /* isRenderWatcher */)
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            try {
                handlers[i].call(vm)
            } catch (error) {
                console.log('error', error)
            }
        }
    }
}