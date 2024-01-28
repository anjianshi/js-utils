/**
 * 字符串处理相关函数
 */
import escapeRegExp from 'lodash/escapeRegExp.js'
import padStart from 'lodash/padStart.js'

/**
 * 将数字字符串化，并在左侧填充 0 直到达到 length 参数指定的长度
 * 若数字本身达到或超过此长度，则不填充
 */
export function zfill(num: number, length = 2) {
  return padStart(String(num), length, '0')
}

/**
 * 执行关键词匹配
 * 成功返回 true；失败返回 false
 */
const kwCache: { [kw: string]: RegExp } = {} // 避免大量重复构建正则表达式影响性能
export function keywordCompare(keyword: string, target: string) {
  if (!keyword) return true
  if (!(keyword in kwCache)) {
    const regStr = keyword.split('').map(escapeRegExp).join('.*')
    kwCache[keyword] = new RegExp(regStr, 'i')
  }
  return kwCache[keyword]!.test(target)
}

/**
 * 对两个字符串进行排序，支持处理逻辑上的数字。
 * 两个字符串都完全由数字组成，且都不以 0 开头时，以数字大小排序；否则以字符串形式排序。
 *
 * 以 0 开头是特例，例如 019 和 12 两个字符串，按直觉还是应该 019 在前面，毕竟本质还是字符串排序。
 *
 * "123" "456"             数字排序
 * "123你好" "133我好"     字符串排序
 * "019" "12"              字符串排序
 */
const _pattern = /^[1-9][0-9]*$/
export function numericCompare(a: string, b: string) {
  if (_pattern.exec(a) && _pattern.exec(b)) return parseInt(a, 10) - parseInt(b, 10)
  return a.localeCompare(b)
}

/**
 * 字符串解析成整数，补充安全措施：
 * 1. 默认设置 radix 为 10，无需再手动指定
 * 2. 支持指定 fallback，当解析出来的数字是 NaN 时返回这个值
 */
export function safeParseInt(value: string | number, fallback?: number, redix = 10) {
  const raw = parseInt(String(value), redix)
  return isFinite(raw) ? raw : fallback ?? raw
}

/**
 * 字符串解析成浮点数；若解析结果是 NaN，返回 fallback
 */
export function safeParseFloat(value: string | number, fallback: number) {
  const raw = parseFloat(String(value))
  return isFinite(raw) ? raw : fallback
}

/**
 * 返回人类可读的文件尺寸
 * 来自：https://stackoverflow.com/a/14919494
 *
 * si: true 则使用 1000 进制，否则 1024 进制（默认 false）
 * dp: 保留几位小数
 */
export function readableSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) return bytes.toString() + ' B'
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp
  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
  return `${bytes.toFixed(dp)} ${units[u]!}`
}
