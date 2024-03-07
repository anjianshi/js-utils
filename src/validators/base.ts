import { success, failed, type MaySuccess } from '../lang/index.js'

export interface BaseOptions {
  /**
   * 是否允许 null 值
   * @default false
   */
  null: boolean

  /**
   * 字段是否必须有值（不能是 undefined）
   * @default true
   */
  required: boolean

  /**
   * 默认值，字段无值（或值为 undefined）时生效，值为 null 不会生效。
   * 指定后 required 选项将失去作用。
   */
  defaults: unknown
}

export class Validator<ExtraOptions = unknown> {
  readonly options: BaseOptions & ExtraOptions

  constructor(options: Partial<BaseOptions> & ExtraOptions) {
    this.options = {
      null: false,
      required: true,
      defaults: undefined,
      ...options,
    }
  }

  /**
   * 各子类继承此方法补充验证逻辑
   */
  validate(field: string, value: unknown): MaySuccess<unknown> {
    if (typeof value === 'undefined') {
      if (typeof this.options.defaults !== 'undefined') {
        value = this.options.defaults
      } else if (this.options.required) {
        return failed(`${field} is required`)
      }
    }
    if (value === null && !this.options.null) return failed(`${field} cannot be null`)
    return success(value)
  }
}
