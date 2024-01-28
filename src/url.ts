/**
 * URL 工具函数
 * 部分灵感来自：https://www.npmjs.com/package/qs
 *
 * [名词定义]
 * query: 指 a=1&b=2 格式的“查询字符串”或此类字符串的解析结果。
 * search: URL 中的 search 部分，与 location.search 一致，空字符串或以 '?' 开头。
 * hash: URL 中的 hash 部分，与 location.hash 一直，空字符串或以 '#' 开头。
 */
import isPlainObject from 'lodash/isPlainObject.js'

/*
从字符串中解析出 query 对象

array:
- 若开启，支持解析 a[]=1&a[]=2 格式的参数，会解析成一个数组 { a: ['1', '2'] }
- 否则把 `a[]` 整体当做一个参数名 { 'a[]': '2' }

strict:
是否开启“严格模式”（默认不开启）。
在非严格模式下，会做很多兼容处理：
1. 支持直接传入 query string（a=1&b=2）；严格模式下，则需在开头补充一个 ?（?a=1&b=2）
2. hash 里的内容也会被解析，以兼容拼接错误的 URL（把 query 拼到了 hash 后面）。
3. 出现多个 ? 符号时，会把 ? 也当做 & 分隔符（index.html?a=1&b=2?c=3）

小技巧：
在非严格模式下，如果明确只想解析 hash 或 search 里的内容，可以传入 location.search / hash 而不是传入整个 location.href

此函数不会对 query 值进行 decode，需自定处理
*/
function parseQuery(url: string, options?: { array?: false, strict?: boolean }): Record<string, string> // prettier-ignore
function parseQuery(url: string, options: { array: true, strict?: boolean }): Record<string, string | string[]> // prettier-ignore
function parseQuery(
  url: string,
  options?: { array?: boolean; strict?: boolean }
): Record<string, string | string[]> {
  if (!url) return {}
  const { array = false, strict = false } = options ?? {}

  const queryString = strict
    ? (/^[^?#]*\?(.+?)(\?|#|$)/.exec(url) ?? ['', ''])[1] // 排除 hash、重复的 ? 符号
    : url

  const query: { [name: string]: string | string[] } = {}
  const reg = /([^#?&]*)=([^#?&]*)/g
  let re = reg.exec(queryString)
  while (re) {
    const [name, value] = [re[1]!, re[2]!]
    if (name.endsWith('[]') && array) {
      const realName = name.slice(0, -2)
      if (Array.isArray(query[realName])) (query[realName] as string[]).push(value)
      else query[realName] = [value]
    } else {
      query[name] = value
    }
    re = reg.exec(queryString)
  }
  return query
}
export { parseQuery }

/**
 * 取 query 中指定参数的值
 * - 参数存在，返回参数值（可能是空字符串）；不存在返回 null
 * - 解析 query 固定基于 parseQuery() 的 { array: false, strict: false } 规则
 * - 和 parseQuery() 一样，url 可以根据需要传 location.href/search/hash
 */
export function getQueryParam(name: string, url: string): string | null {
  const query = parseQuery(url)
  return typeof query[name] === 'string' ? query[name]! : null
}

/**
 * 把对象合并成 query string。
 * 支持字符串、数值、布尔值（不建议，考虑用 0 和 1 代替），数组会转换成 name[]=value 的格式
 */
type StringifyVal = string | number | boolean
export function stringifyQuery(obj: { [key: string]: StringifyVal | StringifyVal[] | undefined }) {
  if (!isPlainObject(obj)) return ''
  return (
    Object.entries(obj)
      // 过滤值为 undefined 的项目，使其完全不出现在最终的 query 中
      .filter((entry): entry is [string, StringifyVal | StringifyVal[]] => entry[1] !== undefined)
      .map(([name, value]) => stringifyQueryItem(name, value))
      .join('&')
  )
}
function stringifyQueryItem(name: string, value: StringifyVal | StringifyVal[]): string {
  if (Array.isArray(value))
    return value.map(subValue => stringifyQueryItem(`${name}[]`, subValue)).join('&')
  return `${name}=${value}`
}

/**
 * 拆分 URL 的各个部分
 *
 * bare 为 true，则 search 不带 '?'，hash 不带 '#'
 * 否则和 location.search / hash 一样
 */
export function splitUrl(url: string, bare = true): { base: string; search: string; hash: string } {
  let hashIndex = url.indexOf('#')
  if (hashIndex === -1) hashIndex = url.length
  const bareHash = url.slice(hashIndex + 1)

  let searchIndex = url.slice(0, hashIndex).indexOf('?')
  if (searchIndex === -1) searchIndex = hashIndex
  const bareSearch = url.slice(searchIndex + 1, hashIndex)

  return {
    base: url.slice(0, searchIndex),
    search: bare ? bareSearch : bareSearch ? '?' + bareSearch : '',
    hash: bare ? bareHash : bareHash ? '#' + bareHash : '',
  }
}

/**
 * 把指定 query 和 hash 内容合并到 url 上
 *
 * query   object    与现有 search 合并，替换同名项（值为数组的，用新数组代替老的，不会合并数组）
 * hash    string    若 url 已有 hash，会用此值代替。带不带开头的 '?' 皆可。
 */
export function combineUrl(
  origUrl: string,
  query: Record<string, string | string[]> = {},
  hash: string = ''
) {
  if (hash.startsWith('#')) hash = hash.slice(1)

  // 拆分原 url 的 search、hash
  const { base, search: origSearch, hash: origHash } = splitUrl(origUrl)

  // 拼接新 URL
  let newUrl = base
  const newSearch = stringifyQuery({ ...parseQuery(origSearch), ...query })
  const newHash = hash || origHash
  if (newSearch) newUrl += `?${newSearch}`
  if (newHash) newUrl += `#${newHash}`
  return newUrl
}

/**
 * decodeURIComponent() 对于不规范编码的字符串可能会报错（例如字符串里出现了“%”）
 * 用此函数代替可避免此问题
 */
export function safeDecode(content: string) {
  try {
    return decodeURIComponent(content)
  } catch (e) {
    return content
  }
}

/**
 * 将 URL 中的 http:// 协议改成 https://
 */
export function ensureHttps(url: string | undefined) {
  return url?.replace(/http:\/\//g, 'https://')
}
