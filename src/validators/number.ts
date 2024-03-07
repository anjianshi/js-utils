import { success, failed } from '../lang/index.js'
import { type BaseOptions, Validator } from './base.js'

export interface NumberOptions {
  /** 数值最小值 */
  min?: number
  /** 数值最大值 */
  max?: number
  /** 是否允许小数 @default false */
  float: boolean
  /** 指定可选值 */
  enum?: number[]
}

export class NumberValidator extends Validator<NumberOptions> {
  constructor(options: Partial<BaseOptions & NumberOptions> = {}) {
    super({
      float: false,
      ...options,
    })
  }

  validate(field: string, value: unknown) {
    const superResult = super.validate(field, value)
    if (!superResult.success) return superResult

    value = superResult.data
    if (value === null || value === undefined) return superResult
    const opt = this.options

    if (typeof value === 'string') value = parseFloat(value)

    if (typeof value !== 'number' || !isFinite(value))
      return failed(`${field} must be a valid number`)
    if (opt.enum !== undefined && !opt.enum.includes(value))
      return failed(`${field} can only be one of ${opt.enum.join(', ')}.`)
    if (!opt.float && value % 1 !== 0) return failed(`${field} must be a integer`)
    if (typeof opt.min === 'number' && value < opt.min) return failed(`${field} must >= ${opt.min}`)
    if (typeof opt.max === 'number' && value > opt.max) return failed(`${field} must <= ${opt.max}`)

    return success(value)
  }
}
