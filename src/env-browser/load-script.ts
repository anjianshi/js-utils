/**
 * 加载脚本文件
 * 返回 Promise，成功则 resolve，失败 reject
 */
export default async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve()
    script.onerror = err => reject(err)
    window.document.head.appendChild(script)
  })
}
