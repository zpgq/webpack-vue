
// 产生虚拟节点
export function VNode(tag, data, children, text) {
    const key = data && data.key
    return {
        tag,
        data,
        key,
        children,
        text,
        componentsInstance: '', // 虚拟节点新增的
    }
}

export function createElement(tag, data = {}, ...children) {
    return new VNode(tag, data, children)
}

export function createTextVnode(text) {
    return new VNode(undefined, undefined, undefined, text)
}