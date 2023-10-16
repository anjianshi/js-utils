import { type default as VConsole } from 'vconsole'

/**
 * 注册 VConsole 代码
 * 此类库自己并不加载 VConsole，需使用者自行通过依赖或者 CDN 加载 VConsole 然后传给此类库
 */
let VConsoleLib: (new () => VConsole) | undefined

export function registerVConsoleLib(lib: new () => VConsole) {
  VConsoleLib = lib
}

/**
 * 管理 VConsole 实例
 */
declare global {
  interface Window {
    VConsole: VConsole | null
  }
}

window.VConsole = null

export function isVConsoleEnabled() {
  return localStorage.getItem('vconsole') === '1'
}

export function detectVConsole() {
  if (isVConsoleEnabled()) {
    runVConsole()
  }
}

export function enableVConsole() {
  localStorage.setItem('vconsole', '1')
  runVConsole()
}

export function disableVConsole() {
  localStorage.setItem('vconsole', '0')
  destoryVConsole()
}

export function runVConsole() {
  if (window.VConsole !== null) return
  if (VConsoleLib === undefined) return void console.warn('尚未传入 VConsole 对象，无法启动')
  window.VConsole = new VConsoleLib()
}

export function destoryVConsole() {
  if (!window.VConsole) return
  window.VConsole.destroy()
  window.VConsole = null
}
