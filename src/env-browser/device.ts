/**
 * 自动计算最合适的 rem 大小，应用到页面样式上。
 *
 * rem 的意义是对于大屏幕，适当地同步放大界面元素，以提供更饱满的显示效果。
 * 不过也不是所有地方都原封不动地大就好了，所以还要配合 media query 来实现最佳效果。
 */
export function autoRem() {
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'

  /**
   * 计算规则：
   * - 微信标准的 375px 宽度下，1rem 为 50px（这个比例的来由是这样的：移动端通常像素比 >= 2，这个 375px 的实际渲染像素是 750px，也就是实际渲染 750px 的情况下，1rem 为 100px）。
   * - 在平板等特大屏幕下，限制 rem 的最大值为 75px，再大就夸张了。
   * - 竖屏时取宽度来适配 rem，横屏时取高度来适配，以保证屏幕朝向不同时，界面元素的放大比例是一致的（这应该更符合人的认知：对于一个同样大小的屏幕，无论什么朝向，上面的文字应该是一样大的）。
   *   注意：此计算方式仅适合“不能任意调整浏览器大小的”移动设备，对于浏览器窗口可能任意尺寸、比例的桌面端，还是应该始终按照宽度来适配。
   *
   * 从 px 到 rem 的换算：
   * 原 px 单位的值换算成 rem，只要除以 50 即可。例如 12px 变成 0.24rem。
   */
  function updateRem() {
    const { clientWidth, clientHeight } = document.documentElement
    const refSize = Math.min(clientWidth, clientHeight)
    const rem = Math.min((refSize / 750) * 100, 75)
    document.documentElement.style.fontSize = `${rem}px`
  }

  window.addEventListener(resizeEvt, updateRem, false)
  document.addEventListener('DOMContentLoaded', updateRem, false)
}

/**
 * 当前设备是否是全面屏
 * 页面刚加载时可能取不到 offsetHeight，因此通过一个函数而不是常量来提供此值
 */
export function isFullScreen() {
  const rate = document.documentElement.offsetHeight / document.documentElement.offsetWidth
  const limit = window.screen.height === window.screen.availHeight ? 1.8 : 1.65 // 临界判断值
  return rate > limit
}

/**
 * 当前是否是 iOS 设备
 */
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

/**
 * 当前是否是移动设备
 */
export const isMobile =
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
    navigator.userAgent || navigator.vendor
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
    (navigator.userAgent || navigator.vendor).substr(0, 4)
  )

/**
 * 当前是否是微信内部浏览器
 */
export const isWechat = /micromessenger/i.test(navigator.userAgent)
