import type { Debug } from 'debug'
import { getLogger, type Logger } from './index.js'

/**
 * 适配 debug package
 */
export function adaptDebugLib(debugLib: Debug, enable = '', logger?: Logger) {
  // 不在 localStorage 里记录 debugLib enable 状态，
  // 以解决 web worker 里读不到 localStorage 而无法启用 debugLib 日志的问题
  const emulate = {
    storage: {
      data: {} as Record<string, string>,
      getItem(name: string) {
        return emulate.storage.data[name]
      },
      setItem(name: string, value: string) {
        emulate.storage.data[name] = value
      },
      removeItem(name: string) {
        delete emulate.storage.data[name]
      },
    },
    save(namespaces: string) {
      if (namespaces) emulate.storage.setItem('debug', namespaces)
      else emulate.storage.removeItem('debug')
    },
    load() {
      return emulate.storage.getItem('debug')
    },
  }
  Object.assign(debugLib, emulate)

  // 将 debugLib 日志转发给 logger
  if (!logger) logger = getLogger('3rd-library')
  debugLib.log = logger.debug.bind(logger)

  if (enable) {
    debugLib.enable(enable)
  }
}
