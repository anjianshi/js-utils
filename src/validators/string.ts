import { success, failed } from '../lang/index.js'
import { type BaseOptions, Validator } from './base.js'

export interface StringOptions {
  /** 字符串最小长度。defaults='' 时默认为 0，否则默认为 1 */
  min: number
  /** 字符串最大长度。 */
  max?: number
  /** 字符串需匹配此正则 */
  pattern?: RegExp
  /** 指定一个数组或 TypeScript enum，字段值必须在此 enum 之中 */
  enum?: string[] | Record<string, string>
  /** 验证之前，是否先清除两侧空白字符（默认开启） */
  trim: boolean
}

export class StringValidator extends Validator<StringOptions> {
  constructor(options: Partial<BaseOptions & StringOptions> = {}) {
    super({
      min: options.defaults === '' ? 0 : 1,
      trim: true,
      ...options,
    })
  }

  validate(field: string, value: unknown) {
    const opt = this.options

    const superResult = super.validate(field, value)
    if (!superResult.success) return superResult

    value = superResult.data
    if (value === null || value === undefined) return superResult
    if (typeof value !== 'string') return failed(`${field} must be a string`)

    const formatted = opt.trim ? value.trim() : value

    if (typeof opt.min === 'number' && formatted.length < opt.min)
      return failed(`${field}'s length must >= ${opt.min}`)

    if (typeof opt.max === 'number' && formatted.length > opt.max)
      return failed(`${field}'s length must <= ${opt.max}`)

    if (opt.pattern && !opt.pattern.exec(formatted))
      return failed(`${field} does not match the pattern.`)

    if (opt.enum !== undefined) {
      const validValues = Array.isArray(opt.enum) ? opt.enum : Object.values(opt.enum)
      if (!validValues.includes(formatted))
        return failed(`${field} can only be one of ${validValues.join(', ')}.`)
    }

    return success(formatted)
  }
}
