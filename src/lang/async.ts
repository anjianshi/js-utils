/**
 * 异步行为相关函数
 */

/**
 * 返回一个指定毫秒后 resolve 的 Promise
 * 若指定了 resolveValue，则 Promise 最终会解析出此值
 */
async function sleep(ms: number): Promise<void>
async function sleep<T>(ms: number, resolveValue: T): Promise<T>
async function sleep<T>(ms: number, resolveValue?: T) {
  return new Promise<T | void>(resolve => {
    setTimeout(() => resolve(resolveValue), ms)
  })
}
export { sleep }

/**
 * 给 Promise 增加时限。
 * - 若 silent 为 false，超时时 reject 一个 TimeoutError
 * - 若 silent 为 true，则超时后，promise 永远不会 resolve 或 reject
 */
export async function timeout<T>(
  promise: Promise<T>,
  timeoutMS: number,
  silent = false,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let isTimeout = false
    setTimeout(() => {
      isTimeout = true
      if (!silent) reject(new TimeoutError('timeout'))
    }, timeoutMS)

    promise.then(
      result => {
        if (!isTimeout) resolve(result)
      },
      error => {
        if (!isTimeout) reject(error)
      },
    )
  })
}
export class TimeoutError extends Error {
  isTimeout = true
}
