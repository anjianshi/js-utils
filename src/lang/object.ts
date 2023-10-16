/**
 * 对两个对象进行浅比较
 * 代码取自 react-addons-shallow-compare 包
 */
export function shallowEqual(objA: unknown, objB: unknown) {
  if (is(objA, objB)) return true
  if (!isObject(objA) || !isObject(objB)) return false

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) return false

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]!
    // eslint-disable-next-line prefer-object-has-own
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !is(objA[key], objB[key])) return false
  }

  return true
}
function is(x: unknown, y: unknown) {
  if (x === y) return x !== 0 || y !== 0 || 1 / x === 1 / y
  else return x !== x && y !== y // eslint-disable-line no-self-compare
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
