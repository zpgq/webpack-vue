
const seenObjects = new Set()

export function traverse(val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val, seen) {
  if (typeof val !== 'object') return

  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (Array.isArray(val)) {
    for (const iterator of val) {
      _traverse(iterator)
    }
  } else {
    for (const key in val) {
      _traverse(val[key])
    }
  }
}