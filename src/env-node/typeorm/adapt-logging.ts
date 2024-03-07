import {
  AbstractLogger,
  type LogLevel as TypeORMLogLevel,
  type LogMessage,
  type LoggerOptions,
} from 'typeorm'
import { type Logger as UtilsLogger } from '../logging/index.js'

/**
 * 把 TypeORM 的日志导入到 js-utils 的 logger 中
 * 用法参考 https://typeorm.io/logging
 */
export class AdaptedTypeORMLogger extends AbstractLogger {
  constructor(readonly utilsLogger: UtilsLogger, options?: LoggerOptions) {
    super(options)
  }

  protected writeLog(typeORMLevel: TypeORMLogLevel, logMessage: LogMessage | LogMessage[]) {
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: true,
    })

    for (const message of messages) {
      const args = message.prefix ?? '' ? [message.prefix, message.message] : [message.message]

      switch (message.type ?? typeORMLevel) {
        case 'log':
        case 'schema':
        case 'schema-build':
        case 'migration':
          this.utilsLogger.debug(...args)
          break

        case 'info':
        case 'query':
          this.utilsLogger.info(...args)
          break

        case 'warn':
        case 'query-slow':
          this.utilsLogger.warn(...args)
          break

        case 'error':
        case 'query-error':
          this.utilsLogger.error(...args)
          break

        default:
          this.utilsLogger.debug(...args)
      }
    }
  }
}
