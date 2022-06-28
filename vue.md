## vue仿造vue从0实现
## 实现过程简要说明
双向绑定原理
1. 简单来说就是重写get、set, 读的时候收集依赖(watcher)、改的时候通知更新(dep保存的所有watcher)
2. watcher观察者, 实例化watcher除了计算属性都会自动get, 执行get会将自身赋值给dep的target, 即此时能够被dep收集
3. watcher执行get的时候会去解析第二参数expOrFn, 即会被observe的get劫持到, 把当前观察的属性收集进dep
4. 当修改属性的时候同样会先执行计算属性的get, 且把旧的值赋值给一个新的遍历, 即可以拿到新旧状态, 同时会被observe的set劫持到, 即通知所有收集的watcher更新
5. 需要注意的是vue2使用defineProperty劫持时, 改变数组无法触发set, 源码使用的是拦截数组原型上的方法手动更新


Vue的渲染过程
1. 初始化混入, 所有状态混入到$options, 初始化props、methods、data、computed、watch
2. 挂载元素render —> template
3. 解析template成有父子结构的ast语法树, 在根据这个语法树生成render函数, 根据render函数生成虚拟dom, 即_render
4. 将_render函数执行生成的虚拟dom传递到_updata中进行新旧虚拟dom对比, 将对比好的newVnode渲染到页面
5. 状态更新的时候执行_updata(_render())更新页面


### vue响应式原理
1. 观察者
```
export function observe(value) {
  if (typeof value !== 'object') {
    return;
  }

  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value);
  }

  return ob
}

class Observer {
  constructor(value) {
    this.dep = new Dep();
    def(value, '__ob__', this);

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(obj) {
    for (const key in obj) {
      defineReactive(obj, key)
    }
  }
  observeArray(items) {
    for (const item of items) {
      observe(item)
    }
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();

  if (arguments.length === 2) {
    val = obj[key];
  }
  const childOb = observe(val);

  Object.defineProperty(obj, key, {
    get() {
      dep.depend();
      if (childOb) {
        childOb.dep.depend()
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) return
      val = newVal;
      dep.notify()
    }
  })
}
```
- 拦截数组手动更新
```
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

;[
  'push'
].forEach(method => {
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;

      let insert
      switch (method) {
        case 'push':
          insert = args
      }
      if(insert) ob.observeArray(insert);
      
      ob.dep.notify();
      return result
    })
  });
```
2. 依赖、即多个订阅, 需要注意的是watcher的第二参数是可以是一个对象也可以是一个函数、当为一个函数时会手机函数内所用到的所有状态
```
let uid = 0;
export class Watcher {
  constructor(vm, expOrFn, cb, options = "") {
    this.id = uid ++; // 批量更新相同watcher去重
    this.vm = vm;
    this.cb = cb;

    if (options) {
      this.deep = !!options.deep
      this.lazy = options.lazy
      this.dirty = this.lazy
    }

    this.deps = [];
    this.depIds = new Set();

    this.getter = typeof expOrFn === 'function' ? expOrFn: parsePath(expOrFn)
    // 计算熟悉默认不取值收集依赖
    this.value = this.lazy ? void 0 : this.get();
  }
  get() {
    // window.target = this;
    pushTarget(this)
    const vm = this.vm
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      traverse(value) // 递归循环数组对象收集依赖
    }
    // window.target = undefined;
    popTarget()
    return value
  }
  evalute() {
    this.value = this.get()
    this.dirty = false; // 取值后设为false防止值无变化下次在计算
  }
  addDep(dep) {
    const id = dep.id;
    if(!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
  updata() {
    if (this.lazy) {
      this.dirty = true; // 页面重新渲染就可以获取最新的值
    } else {
      queueWatcher(this); // 暂存, 批量处理watcher
      // this.run();
    }
  }
  run() {
    const vm = this
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value
      this.cb.call(vm, value, oldValue)
    }
  }
  depend() {
    let i = this.deps.length;
    while (i --) {
      this.deps[i].depend() // 收集渲染watcher
    }
  }
}

let queue = []; // 将需要批量更新的watcher存到队列中, 稍后执行
let has = {}; // watcher去重
let padding = false;

function flushSchedulerQueue() {
  queue.forEach(watcher => watcher.run())
  queue = [];
  has = {};
  padding = false;
}

function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    queue.push(watcher)
    has[id] = true;
  }

  // 异步执行, 相同的watcher值执行一次
  if (!padding) {
    nextTick(flushSchedulerQueue) // 异步更新
    padding = true
  }
}
```
3. 依赖仓库、即一个主题
```
let uid = 0;
export class Dep {
  constructor() {
    this.id = uid++; // 相同状态创建依赖去重
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.updata()
    })
  }
  removeSub(sub) {
    const index = this.subs.indexOf(sub)
    if (index > -1) {
      return this.subs.splice(index, 1)
    }
  }
}

let stack = []; // 为了收集渲染watcher, 计算属性时需要使用
export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher;
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}
```

### 入口文件项目分层, 初始化混入、状态混入、事件混入、更新视图混入、渲染函数混入
```
import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle';
import { stateMixin } from './state.js'
import { eventsMixin } from './events'
import { renderMixin } from './render.js';
import { initGlobalApi } from './global-api';


function Vue(options) {
  this._init(options);
}

initGlobalApi(Vue); // 全局api

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue);

window.Vue = Vue;
export default Vue;
```

1. 初始化混入
```
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;

    vm.$options = mergeOptions(
      vm.constructor.options,
      options || {},
    );
    
    initEvents(vm)
    callHook(vm, 'beforeCreate')
    // 初始化数据, 初始化props、methods、data、computed、watch等等
    initState(vm);
    callHook(vm, 'created')

    // 解析模板渲染
    if(vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```
- 初始化事件
```
export function initEvents(vm) {
vm._event = Object.create(null);
}
```
- 初始化状态, 注意其顺序props->methods->data->computed->watch故、props里面的数据在data中能访问, data中声明的数据在computed能直接使用
```
export function initState(vm) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm);
  if (opts.methods) initMethods(vm)
  if (opts.data) initData(vm)
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) initWatch(vm)
}
```
- 代理data, 不用使用vm._data.obj直接使用vm.obj直接访问 
```
function proxy(target, soureKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[soureKey][key]
    },
    set(val) {
      target[soureKey][key] = val
    }
  })
}
function getData(data, vm) {
  return data.call(vm, vm)
}
function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data

  const keys = Object.keys(data)
  let i = keys.length;
  while (i--) {
    const key = keys[i]
    proxy(vm, '_data', key)
  }
  observe(data)
}
```
- 初始化computed
```
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evalute()
      }
      if (Dep.target) {
        watcher.depend() // 收集渲染watcher
      }
      return watcher.value
    }
  }
}
function defineComputed(vm, key, userDef) {
  const sharedPropertyDefinetion = {
    get: () => {},
    set: () => {}
  }

  if (typeof userDef === 'function') {
    sharedPropertyDefinetion.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinetion.get = createComputedGetter(key);
    sharedPropertyDefinetion.set = userDef.set
  }
  Object.defineProperty(vm, key, sharedPropertyDefinetion)
}
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null);
  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function'? userDef: userDef.get;
    watchers[key] = new Watcher(vm, getter, () => {}, {lazy: true})
    defineComputed(vm, key, userDef)
  }
}
```
2. statMinx混入
```
export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    const vm = this;
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```
3. 事件混入
```
export function eventsMixin(Vue) {
  Vue.prototype.$on = function (event, fn) {
    // console.log('$on', event)
    const vm = this;
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i ++) {
        vm.$on(event[i], fn)
      }
    } else {
      (vm._event[event] || (vm._events[event] = [])).push(fn)
    }
    return vm
  }
  Vue.prototype.$emit = function (event) {
    const vm = this;
    let cbs = vm._event[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      const args = toArray(arguments, 1)
    }
    return vm
  }
}
```
4. 挂在$mount
```
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;

    el = document.querySelector(el);
    vm.$el = el;

    // 生成元素的查找逻辑 render -> template
    if (!options.render) {
      let template = options.template;
      if(!template && el) {
        template = el.outerHTML // outerHTML最外层div也带上
      }
      const render = compileToFunctions(template); // 将模板编译成render函数
      options.render = render
    }
    // console.log('render=>', options.render) // 最终都是使用的render来渲染

    // 挂在组件
    mountComponent(vm, el)
  }

  export function mountComponent(vm, el) {
    vm.$el = el;
    // 调用render方法渲染el熟悉
    // 1. 调用render函数创建虚拟节点
    // 2. 将虚拟节点渲染到页面
    vm._updata(vm._render())
    }
```
- 解析模版模版生成render、具体如何解析可查看源码、思路
    - 正则匹配出开始标签、结束标签、文本、注释并且匹配到的时候触发对应的函数
    - 采用一个先进后出的栈接口存储解析出来的数据、且解析出来就删除对应的模版字符当匹配到结束标签时把当前那条数据弹出来存储起来、这样很同意就能得到一个父子接口的ast树
    - 在根据这个树递归出render函数tag类型包装个_c, 属性包个_v, 文本中函数{{}}的包一个_s


```
export function compileToFunctions(template) {
  // html模板 ==> render函数
  // 1. html转化成ast语法树
  let ast = parseHTML(template)
  // console.log('ast', ast)
  /*  
      attrs: (2) [{…}, {…}]
      children: [{…}]
      parent: null
      tag: "div"
      type: 1 
  */
  // 2. 通过ast树生成render函数
  let code = generate(ast);
  // console.log('code=>', code)
  /*  
    render() {
      return 
    }
  */
//  console.log('code', code)
  // 3. 将字符串转化成函数
  // 通过with 限制取值范围为this, 稍后通过改变this就能取到值了
  let render = new Function(`with(this){return ${code}}`)
  return render; 
}
```
- render混入
```
export function renderMixin(Vue) {
  //创建_v, _c等等函数, 返回vnode
  installRenderHelpers(Vue.prototype)
  
  Vue.prototype._render = function () {
      const vm = this;
      const render = vm.$options.render
      let vnode = render.call(vm)
      console.log('vnode', vnode)
      return vnode
  }
}
```
- lifycycle混入
```
export function lifecycleMixin(Vue) {
    Vue.prototype._updata = function (vnode) {
        const vm = this;
        // 使用新建的元素替换老的元素
        vm.$el = patch(vm.$el, vnode)
    }
}
```
- 新旧虚拟dom对比, 目前只实现新旧直接替换并未实现diff算法对比
具体如何实现有兴趣的小伙伴可以去查看源码, diff算法对比大概分五种情况
新头 diff 旧头、 新头 diff 旧尾、 新尾 diff 旧头、 新尾 diff 旧尾、暴力对比
```
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
```
5. nextTick实现
```
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
```
6. 混入、生命周期合并
```
  Vue.options = {};
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
  }

  const strategies = {}

function defaultStrategy(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
];

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

LIFECYCLE_HOOKS.forEach(hook => {
  strategies[hook] = mergeHook
})

export function mergeOptions(parent, child) { // 将子选项和父选项合并
  const options = {};
  function mergeFied(key) {
    const strategy = strategies[key] || defaultStrategy;
    options[key] = strategy(parent[key], child[key])
  }

  for (const key in parent) {
    if (parent.hasOwnProperty(key)) {
      mergeFied(key)
    }
  }

  for (const key in child) {
    if (child.hasOwnProperty(key) && !parent.hasOwnProperty(key)) {
      mergeFied(key)
    }
  }
  return options
}
```