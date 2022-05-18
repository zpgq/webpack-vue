import { hasOwn } from '../util'

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

  console.log('opts', options.data())

  return options
}