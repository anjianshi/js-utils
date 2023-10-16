/**
 * 针对浏览器环境定制 logging
 */
import {
  logger as defaultLogger,
  type Logger,
  type LogInfo,
  LogLevel,
  LogHandler,
  formatters,
} from '../logging/index.js'

export * from '../logging/index.js'

/**
 * 实现向浏览器 console 输出日志
 */
export class ConsoleHandler extends LogHandler {
  log(info: LogInfo) {
    const color = (value = 'black') => `color: ${value};`
    const prefix =
      '%c' + [formatters.time(info), info.logger].map((v: string) => (v ? `[${v}]` : '')).join('')
    const prefixColor = info.logger ? color(ConsoleHandler.getColor(info.logger)) : color()

    const values = [prefix, prefixColor, ...info.args]
    if (info.level === LogLevel.Debug) console.debug(...values)
    else if (info.level === LogLevel.Info) console.log(...values)
    else if (info.level === LogLevel.Warning) console.warn(...values)
    else console.error(...values)
  }

  // 按顺序给各主题分配颜色（取自 http://chriskempson.com/projects/base16/）
  private static readonly colors = [
    '#dc9656',
    '#7cafc2',
    '#ba8baf',
    '#a16946',
    '#ab4642',
    '#86c1b9',
    '#a1b56c',
    '#f7ca88',
  ]
  private static readonly colorMap = new Map<string, string>()
  static getColor(name: string) {
    if (!ConsoleHandler.colorMap.has(name)) {
      const nextIndex = ConsoleHandler.colorMap.size % ConsoleHandler.colors.length
      ConsoleHandler.colorMap.set(name, ConsoleHandler.colors[nextIndex]!)
    }
    return ConsoleHandler.colorMap.get(name)!
  }
}

/**
 * 预设的初始化行为
 */
export function initLogger(logger: Logger = defaultLogger) {
  logger.addHandler(new ConsoleHandler())
}
