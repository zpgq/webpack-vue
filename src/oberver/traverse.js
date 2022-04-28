

export function traverse(val) {
  _traverse(val)
}

function _traverse(val) {
  if (typeof val !== 'object') return
  for (const key in val) {
    _traverse(val[key])
  }
}