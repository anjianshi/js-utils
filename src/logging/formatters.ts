/**
 * 日志常用数据的格式化函数
 */
import { type LogInfo, LogLevel } from './index.js'

const formatters = {
  time(info: LogInfo) {
    return info.time.format('HH:mm:ss.SSS')
  },
  datetime(info: LogInfo) {
    return info.time.format('YY-MM-DD HH:mm:ss.SSS')
  },
  level(info: LogInfo) {
    const map = {
      [LogLevel.Debug]: 'debug',
      [LogLevel.Info]: 'info',
      [LogLevel.Warning]: 'warn',
      [LogLevel.Error]: 'error',
    }
    return map[info.level]
  },
}
export default formatters
