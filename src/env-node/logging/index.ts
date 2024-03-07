/**
 * 针对 Node.js 环境定制 logging
 * 注意：使用此模块需要 chalk 依赖
 */
import { logger as defaultLogger, type Logger } from '../../logging/index.js'
import { ConsoleHandler } from './handlers.js'

export * from './handlers.js'
export * from '../../logging/index.js'

/**
 * 预设的初始化行为
 */
export function initLogger(logger: Logger = defaultLogger) {
  logger.addHandler(new ConsoleHandler())
}
