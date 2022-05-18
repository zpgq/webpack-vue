export function patch(oldVnode, vnode) {
    // 虚拟节点转化成真实的节点
    let el = createEle(vnode);
    let parentEle = oldVnode.parentNode;
    parentEle.insertBefore(el, oldVnode.nextSibling); // 新节点插入到#app下一个兄弟元素
    parentEle.removeChild(oldVnode); // 删除老节点
    
    return el;
}

function createEle(vnode) {
    let {tag, children, key, data, text} = vnode;
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);
        // 更新元素属性
        updataProperties(vnode)
        children.forEach(child => {
            vnode.el.appendChild(createEle(child))
        });
    } else {
         vnode.el = document.createTextNode(text)
    }
    return vnode.el;
}

// 更新属性
function updataProperties(vnode) {
    let el = vnode.el;
    let newProps = vnode.data || {}

    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName]
            }
        } else if (key === 'class') {
            el.className = el.class;
        } else {
            el.setAttribute(key, newProps[key])
        }
    }

}