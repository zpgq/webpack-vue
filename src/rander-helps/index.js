
import { createElement, createTextVnode } from '../vnode'

export function installRenderHelpers(target) {
  // 创建虚拟元素
  target._c = function () {
    return createElement(...arguments)
  }
  // 创建stringify
  target._s = function (val) {
    return val == null
      ? '' : (typeof val === 'object')
        ? JSON.stringify(val) : val;
  }
  // 创建虚拟文本
  target._v = function (text) {
    return createTextVnode(text)
  }
}