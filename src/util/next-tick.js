const callbacks = []
let padding = false;
function flushCallbacks() {
  callbacks.forEach(cb => cb())
  padding = false;
  callbacks.length = 0;
}
let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  // 通过监控node节点异步执行
  let observe = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(1)
  observe.observe(textNode, {characterData: true}) 
  timerFunc = () => {
    textNode.textContent = 2;
  }
}
export function nextTick(cb) {
  callbacks.push(cb);
  if (!padding) {
    timerFunc();
    padding = true;
  }
}