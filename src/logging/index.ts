export { default as formatters } from './formatters.js'
export * from './adapt.js'
import dayjs, { type Dayjs } from 'dayjs'
import { initDayJs } from '../init-dayjs.js'

// 引入 logging 库会自动初始化 dayjs
initDayJs()

export enum LogLevel {
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
}

export const logLevelMap: Record<string, LogLevel> = {
  debug: LogLevel.Debug,
  info: LogLevel.Info,
  warn: LogLevel.Warning,
  warning: LogLevel.Warning,
  err: LogLevel.Error,
  error: LogLevel.Error,
}

export interface LogInfo {
  logger: string // logger name；有多级 logger 的情况下，这是最初的 logger 名称
  level: LogLevel
  time: Dayjs
  args: unknown[] // log content
}

export class LogHandler {
  log(info: LogInfo) {} // eslint-disable-line @typescript-eslint/no-unused-vars
}

export class Logger {
  level = LogLevel.Info
  handlers = new Set<LogHandler>()

  constructor(
    public name: string = '',
    public base: Logger | null = null // 指定上级 logger，当前 logger 记录的日志也会传递给上级
  ) {}

  static getRealLevel(raw: LogLevel | string) {
    if (typeof raw === 'string') {
      raw = raw.toLowerCase()
      if (logLevelMap[raw] === undefined) throw new Error('Not supported log level: ' + raw)
      return logLevelMap[raw]!
    }
    return raw
  }

  setLevel(level: LogLevel | string) {
    this.level = Logger.getRealLevel(level)
  }

  addHandler(handler: LogHandler) {
    this.handlers.add(handler)
  }

  /**
   * 创建一个以当前 logger 为 base 的 child logger
   */
  getChild(name: string) {
    const fullname = this.name ? `${this.name}/${name}` : name
    type Constructor = new (...args: ConstructorParameters<typeof Logger>) => Logger
    // 这里加上 `as this` 才能让 TypeScript 判定，对继承了 Logger 的类调用此方法时，返回的是那个类而不是原始的 Logger 类的实例
    return new (this.constructor as Constructor)(fullname, this) as this
  }

  log(level: LogLevel | string, args: unknown[]) {
    level = Logger.getRealLevel(level)
    this.logByInfo({ logger: this.name, level, time: dayjs(), args })
  }
  protected logByInfo(info: LogInfo) {
    if (this.base) this.base.logByInfo(info)
    if (this.level > info.level) return
    for (const handler of this.handlers) {
      handler.log(info)
    }
  }

  debug(...args: any[]) {
    this.log(LogLevel.Debug, args)
  }
  info(...args: any[]) {
    this.log(LogLevel.Info, args)
  }
  warn(...args: any[]) {
    this.log(LogLevel.Warning, args)
  }
  error(...args: any[]) {
    this.log(LogLevel.Error, args)
  }
}

/**
 * 提供一套默认配置好的 logger
 */
const defaultLogger = new Logger()
export { defaultLogger as logger }

export function getLogger(name: string) {
  return defaultLogger.getChild(name)
}
