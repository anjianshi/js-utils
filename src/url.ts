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

/**
 * 从 URL 中解析出 query 对象
 * 注意：不带 ? 号的纯 query 内容需手动加上 ? 再传入。
 *
 * [array]
 * 是否把重复出现的 key 保存为数组（默认不开启）
 * a=1&a=2 => { a: [1,2] }
 *
 * [loose]
 * 是否开启“宽松模式”（默认不开启）
 * 1. hash 里的内容也会被解析，以兼容拼接错误的 URL（把 query 拼到了 hash 后面）。
 * 2. 出现多个 ? 符号时，会把 ? 也当做 & 分隔符（index.html?a=1&b=2?c=3）
 *
 * [decode]
 * 是否对 query 值进行 decode（默认开启）
 */
function parseQuery(url: string, options?: { array?: false, loose?: boolean, decode?: boolean }): Record<string, string> // prettier-ignore
function parseQuery(url: string, options: { array: true, loose?: boolean, decode?: boolean }): Record<string, string | string[]> // prettier-ignore
function parseQuery(
  url: string,
  options?: { array?: boolean; loose?: boolean; decode?: boolean }
): Record<string, string | string[]> {
  const { array = false, loose = false, decode = true } = options ?? {}

  // 正常状态下，将仅剩 a=1&b=1（即不会再有 ? 和 #）；loose 模型下，可能为 a=1&b=2#c=3?d=4
  const queryString = (loose ? /(\?|#)(.+)/ : /(\?)(.+?)(#|$)/).exec(url)?.[2] ?? ''
  if (!queryString) return {}

  const query: { [name: string]: string | string[] } = {}
  const reg = /([^#?&]*)=([^#?&]*)/g
  let re = reg.exec(queryString)
  while (re) {
    const [name, rawValue] = [re[1]!, re[2]!] as [string, string]
    const value = decode ? safeDecode(rawValue) : rawValue
    if (array && query[name] !== undefined) {
      const prev = query[name]!
      query[name] = Array.isArray(prev) ? [...prev, value] : [prev, value]
    } else {
      query[name] = value
    }
    re = reg.exec(queryString)
  }
  return query
}
export { parseQuery }

/**
 * 把对象合并成 query string。
 * - 支持字符串、数值、布尔值、数组。
 * - 布尔值会替换成 0 和 1。
 * - 数组会多次赋值：{ a: [1,2,3] } => 'a=1&a=2&a=3'，不支持嵌套数组
 * - encode 为 true 时会对 value 执行 encodeURIComponent（默认为 true）
 */
type StringifyVal = string | number | boolean
type StringifyQuery = { [key: string]: StringifyVal | StringifyVal[] | undefined }
export function stringifyQuery(obj: StringifyQuery, encode = true) {
  if (!isPlainObject(obj)) return ''
  return (
    Object.entries(obj)
      // 过滤值为 undefined 的项目，使其完全不出现在最终的 query 中
      .filter((entry): entry is [string, StringifyVal | StringifyVal[]] => entry[1] !== undefined)
      .map(([name, value]) => stringifyQueryItem(name, value, encode))
      .join('&')
  )
}
function stringifyQueryItem(
  name: string,
  value: StringifyVal | StringifyVal[],
  encode: boolean
): string {
  if (Array.isArray(value))
    return value.map(subValue => stringifyQueryItem(name, subValue, encode)).join('&')
  if (typeof value === 'boolean') value = value ? '1' : '0'
  if (typeof value === 'number') value = value.toString()
  if (encode) value = encodeURIComponent(value)
  return `${name}=${value}`
}

/**
 * 拆分 URL 的各个部分
 *
 * bare 为 true，则 search 不带 '?'，hash 不带 '#'
 * 否则和 location.search / hash 一样
 * （默认为 true）
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
 * 把 query 和 hash 内容合并到 url 上
 *
 * query   object    与现有 search 合并，替换同名项（值为数组的，用新数组代替老的，不会合并数组）
 * hash    string    带不带开头的 '#' 皆可。会代替 url 已有的 hash。
 */
export function combineUrl(origUrl: string, query: StringifyQuery = {}, hash: string = '') {
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
 * 移除路径中所有非必须的 "/"
 * 清理后的字符串只有这几种可能的格式：''、'abc'、'abc/def'
 * 例如 /abc/def 和 abc/def/ 都会变成 abc/def
 *
 * 注意：此操作不会统一大小写，因此不保证处理后两个字符串在代码层面全等（a === b）
 */
export function clearSlash(path: string) {
  if (path.startsWith('/')) path = path.slice(1)
  if (path.endsWith('/')) path = path.slice(0, -1)
  path = path.replace(/\/+/g, '/')
  return path
}

/**
 * 合并几段路径，保证合并处只有一个斜杠
 */
export function joinPath(...nodes: string[]) {
  // - node 为 '' 时忽略 node
  // - path 可能的格式：'' 'a' 'a/' ‘/a/'
  //   - path 为 ''，则 node 开头 '/' 保持原样
  //   - 否则，根据 path 结尾有没有 '/'，决定 node 开头带不带 '/'
  // - node 开头、结尾若有多个 '/' 均替换成单个
  return nodes.reduce((path, node) => {
    if (!node) return path
    type Matched = RegExpExecArray & { 1: string; 2: string; 3: string }
    const [, origPrefix, content, origSuffix] = /^(\/*)(.*?)(\/*)$/.exec(node)! as Matched
    const prefix = (path === '' ? !!origPrefix : !path.endsWith('/')) ? '/' : ''
    const suffix = origSuffix ? '/' : ''
    const result = `${path}${prefix}${content}${suffix}`
    return result
  }, '')
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
