/**
 * 通过此模块注册全局变量以便于调试
 */

declare global {
  interface Window {
    app: { [key: string]: unknown }
  }
}

// web-worker 环境下不存在 window 变量，无法执行注册
let hasWindow = false
try {
  window.app = {}
  hasWindow = true
} catch (e) {} // eslint-disable-line no-empty

export default function registerGlobal(key: string, content: unknown) {
  if (hasWindow) window.app[key] = content
}
