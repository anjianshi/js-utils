/**
 * MaySuccess：代表一种“可能失败”的操作结果，可以作为函数返回值，也可以作为接口响应值。
 * 它的灵感来自 Scala 的 Option 类型。
 *
 * 原本，在 JavaScript 里一个可能失败的操作有两种表示失败的方式：
 * 1. 返回空值，如 null、0、''
 * 2. 抛出异常
 * 返回空值的方式无法附带失败信息；而抛出异常会导致层层嵌套的 try catch 语句，且其实性能不好。
 *
 * MaySuccess 就是为了解决这两个痛点：
 * 1. 它的 Failed 类型可以携带失败信息。
 * 2. 无需 try catch，只需简单的 result.success 判断
 */

/** 类型定义 */
export interface Success<T = void> {
  success: true
  data: T
}
export type Failed<T = void> = {
  success: false
  message: string
  code?: string | number
  data: T
}
export type MaySuccess<T = void, FT = void> = Success<T> | Failed<FT>

/** 生成 Success 数据 */
function success(): Success
function success<T>(data: T): Success<T>
function success<T = void>(data?: T) {
  return { success: true, data }
}
export { success }

/** 生成 Failed 数据 */
function failed(message: string, code?: string | number): Failed
function failed<T>(message: string, code: string | number | undefined, data: T): Failed<T>
function failed<T>(message: string, code?: string | number, data?: T): Failed<T> {
  return { success: false, message, code, data: data as T }
}
export { failed }

/**
 * 若传入值为 success，格式化其 data；否则原样返回错误
 * 支持传入会返回 MaySuccess 的 Promise
 */
function formatSuccess<T1, T2, FT = void>(value: MaySuccess<T1, FT>, formatter: (value: T1) => T2): MaySuccess<T2, FT> // prettier-ignore
function formatSuccess<T1, T2, FT = void>(value: Promise<MaySuccess<T1, FT>>, formatter: (value: T1) => T2): Promise<MaySuccess<T2, FT>> // prettier-ignore
function formatSuccess<T1, T2, FT = void>(
  value: MaySuccess<T1, FT> | Promise<MaySuccess<T1, FT>>,
  formatter: (value: T1) => T2
) {
  if ('then' in value) return value.then(finalValue => formatSuccess(finalValue, formatter))
  return value.success ? success(formatter(value.data)) : value
}
export { formatSuccess }
