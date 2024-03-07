/**
 * 对类型系统的辅助、补充
 */

/**
 * 解决 TypeScript 中，数组字面量 [1, 'a'] 无法自动识别为 tuple 的问题
 *
 * 使用方法：
 * const t = tuple(1, 'a')    // 类型会识别为 [1, 'a'] 而不是 (number | string)[]
 *
 * 待官方提供语言层面的支持
 * https://github.com/microsoft/TypeScript/issues/27179
 * https://github.com/microsoft/TypeScript/issues/16656
 */
export function tuple<T extends unknown[]>(...elements: T) {
  return elements
}

/** 将一个对象中的指定 key 设为必须的 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Pick<Required<T>, K>

/** 将一个对象中的指定 key 设为非必须的 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** 用 ReplaceT 中的字段定义代替 T 中的 */
export type ReplaceFields<T, ReplaceT> = Omit<T, keyof ReplaceT> & ReplaceT

/** 获取一个对象所有 value 的集合 */
export type ValueOf<T> = T extends { [_ in keyof T]: infer U } ? U : never

/**
 * 获取指定类型的 key 的集合
 * 可以解决 keyof 无法正确获取继承了 plain object interface 的类型的 key 的问题
 *
 * interface Base { [key: string]: number }
 * interface MyType extends Base { a: 1, b: 2 }
 * keyof MyType          // string | number
 * KnownKeys<MyType>     // 'a' | 'b'
 */
export type KnownKeys<T> = ValueOf<{
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}>

/** 排除对象中指定类型的项目 */
export type ExcludePropertiesOfType<T, ExcludeValueT> = Pick<
  T,
  { [K in keyof T]: T[K] extends ExcludeValueT ? never : K }[keyof T]
>

/**
 * 生成不包含指定 key 的类型
 * 与 Omit<T, Keys> 的区别是
 */
export type ExcludeKeys<T, ExcludeKeys> = Pick<
  T,
  { [K in keyof T]: K extends ExcludeKeys ? never : K }[keyof T]
>

/** 排除对象的方法（仅保留属性） */
// eslint-disable-next-line @typescript-eslint/ban-types
export type ExcluceMethods<T> = ExcludePropertiesOfType<T, Function>

/**
 * 确认变量是否有值
 * 注意：空字符串和数字 0 也会判定为没有值
 */
function truthy(
  value: string | number | boolean | null | undefined
): value is string | number | true
function truthy<T>(
  value: T | string | number | boolean | null | undefined
): value is T | string | number | true
function truthy<T>(value: T | string | number | boolean | null | undefined) {
  return value !== null && value !== undefined && value !== '' && value !== 0 && value !== false
}
export { truthy }

/** 定义 JSON 数据 */
export type JSONData = number | boolean | string | null | JSONData[] | { [key: string]: JSONData }

/**
 * 有些场景不适合用 undefined 判断一个变量是否被赋值（例如它允许被赋值成 undefined）
 * 此时可以用这个 symbol 来做判断。
 *
 * if (value === noValue) console.log('未赋值')
 * else console.log('已赋值', value)
 */
export const noValue = Symbol('no-value')
