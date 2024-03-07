import { success, failed } from '../lang/index.js'
import { Validator } from './base.js'

/** 验证元素数量任意、元素类型相同的数组 */
export type ArrayOptions = {
  /** 验证数组各元素 */
  item: Validator
  /** 数组最小长度 */
  min?: number
  /** 数组最大长度 */
  max?: number
  /** 是否对数组元素进行去重 @defaults false */
  unique?: boolean
}

/** 验证元素数量固定、类型可以不同的数组 */
export type TupleOptions = {
  /** 验证数组各元素（validator 与元素一一对应） */
  tuple: Validator[]
}

export class ArrayValidator extends Validator<ArrayOptions | TupleOptions> {
  validate(field: string, value: unknown) {
    const superResult = super.validate(field, value)
    if (!superResult.success) return superResult

    value = superResult.data
    if (value === null || value === undefined) return superResult
    const opt = this.options

    if (!Array.isArray(value)) return failed(`${field} should be an array`)

    let formatted = []
    if ('item' in opt) {
      if (typeof opt.min === 'number' && value.length < opt.min)
        return failed(`array ${field}'s length should >= ${opt.min}`)

      if (typeof opt.max === 'number' && value.length > opt.max)
        return failed(`array ${field}'s length should <= ${opt.max}`)

      for (let i = 0; i < value.length; i++) {
        const itemResult = opt.item.validate(`${field}[${i}]`, value[i])
        if (itemResult.success) formatted.push(itemResult.data)
        else return itemResult
      }

      if (opt.unique === true) formatted = [...new Set(formatted)]
    } else {
      if (value.length > opt.tuple.length)
        return failed(`${field} should be a tuple with ${opt.tuple.length} items`)

      // 这种情况不能遍历 value，因为它的长度可能小于 opt.tuple
      for (let i = 0; i < opt.tuple.length; i++) {
        const itemResult = opt.tuple[i]!.validate(`${field}[${i}]`, value[i])
        if (itemResult.success) formatted.push(itemResult.data)
        else return itemResult
      }
    }

    return success(formatted)
  }
}
