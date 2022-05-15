export function randerMixin(Vue) {
    // 创建虚拟元素
    Vue.prototype._c = function () {
        return createElement(...arguments)
    }
    // 创建stringify
    Vue.prototype._s = function (val) {
        return val == null 
        ?  '' : (typeof val=== 'object') 
        ? JSON.stringify(val) : val;
    }
    // 创建虚拟文本
    Vue.prototype._v = function (text) {
        return createTextVnode(text)
    }
    
    Vue.prototype._rander = function () {
        const vm = this;
        const rander = vm.$options.rander
        let vnode = rander.call(vm)
        return vnode
    }
}

function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, undefined, children)
}

function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text)
}

// 产生虚拟节点
function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentsInstance: '', // 虚拟节点新增的
    }
}