/**
 * 时间处理相关函数
 */

/**
 * 返回指定时间长度的 毫秒数
 */
export function daysMS(n: number) {
  return hoursMS(n * 24)
}
export function hoursMS(n: number) {
  return minutesMS(n * 60)
}
export function minutesMS(n: number) {
  return secondsMS(n * 60)
}
export function secondsMS(n: number) {
  return n * 1000
}
