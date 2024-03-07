import isPlainObject from 'lodash/isPlainObject.js'
import { success, failed } from '../lang/index.js'
import { Validator } from './base.js'

/** 验证有明确键值对结构的对象 */
export type StructOptions = {
  /** 定义对象结构，及各个值的验证规则 */
  struct: Record<string, Validator>
}

/**
 * 验证有任意多个 key，但值的类型固定的对象
 */
export type RecordOptions = {
  /** 验证单个值  */
  record: Validator
  /** 对象至少要有几项 */
  min?: number
  /** 对象最多有几项 */
  max?: number
}

export class ObjectValidator extends Validator<StructOptions | RecordOptions> {
  validate(field: string, value: unknown) {
    const superResult = super.validate(field, value)
    if (!superResult.success) return superResult

    value = superResult.data
    if (value === null || value === undefined) return superResult
    const opt = this.options

    if (!isPlainObject(value)) return failed(`${field} should be a plain object`)

    const formatted: Record<string, unknown> = {}
    if ('struct' in opt) {
      for (const [key, itemValidator] of Object.entries(opt.struct)) {
        const itemResult = itemValidator.validate(
          `${field}["${key}"]`,
          (value as Record<string, unknown>)[key]
        )
        if (itemResult.success) {
          if (itemResult.data !== undefined) formatted[key] = itemResult.data
        } else {
          return itemResult
        }
      }
    } else {
      for (const [key, itemValue] of Object.entries(value as Record<string, unknown>)) {
        // record 场景下，值为 undefined 的项目视为不存在，不保留在验证结果里，
        // 不然一些因为不想赋值而填充了 undefined 值的项目可能意外触发验证失败，或意外得到了默认值。
        // （因此 validator 的 required 选项和 defaults 选项也没有意义了）
        if (itemValue === undefined) continue

        const itemResult = opt.record.validate(`${field}["${key}"]`, itemValue)
        if (itemResult.success) {
          if (itemResult.data !== undefined) formatted[key] = itemResult.data
        } else {
          return itemResult
        }
      }

      const length = Object.keys(formatted).length
      if (typeof opt.min === 'number' && length < opt.min)
        return failed(`size of ${field} should >= ${opt.min}`)
      if (typeof opt.max === 'number' && length > opt.max)
        return failed(`size of ${field} should <= ${opt.max}`)
    }
    return success(formatted)
  }
}
