

export function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, undefined, children)
}

export function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text)
}

// 产生虚拟节点
export function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentsInstance: '', // 虚拟节点新增的
    }
}