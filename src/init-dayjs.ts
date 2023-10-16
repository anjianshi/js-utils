import { extend, locale } from 'dayjs'
import objectSupport from 'dayjs/plugin/objectSupport.js'
import 'dayjs/locale/zh-cn.js'

export function initDayJs() {
  extend(objectSupport)
  locale('zh-cn')
}
