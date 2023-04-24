/*
 * @Description: 
 * @Author: 朱谱刚
 * @Date: 2023-04-24 14:27:27
 * @LastEditors: 朱谱刚
 * @LastEditTime: 2023-04-24 14:27:27
 */
export function tagName(node) {
    return node.tagName
}

export function parentNode(node) {
    return node.parentNode
}

export function nextSibling(node) {
    return node.nextSibling
}

export function appendChild(node, child) {
    node.appendChild(child)
}

export function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode)
}

export function createTextNode(text) {
    return document.createTextNode(text)
}

export function createElement(tagName, vnode) {
    const elm = document.createElement(tagName)
    if (tagName !== 'select') {
        return elm
    }
    if (
        vnode.data &&
        vnode.data.attrs &&
        vnode.data.attrs.multiple !== undefined
    ) {
        elm.setAttribute('multiple', 'multiple')
    }
    return elm

}