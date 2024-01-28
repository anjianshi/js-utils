import dayjs from 'dayjs'
import objectSupport from 'dayjs/plugin/objectSupport.js'
import 'dayjs/locale/zh-cn.js'

export function initDayJs() {
  dayjs.extend(objectSupport)
  dayjs.locale('zh-cn')
}
