export function parsePath(path) {
  // 拆成数组
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      obj = obj[segments[i]]
    }
    return obj
  }
}