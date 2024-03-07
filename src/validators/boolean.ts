import { success, failed } from '../lang/index.js'
import { Validator } from './base.js'

export class BooleanValidator extends Validator {
  validate(field: string, value: unknown) {
    const superResult = super.validate(field, value)
    if (!superResult.success) return superResult

    value = superResult.data
    if (value === null || value === undefined) return superResult

    if (typeof value === 'string') {
      const str = value.trim().toLowerCase()
      if (['1', 'true', 'on', 'yes'].includes(str)) value = true
      else if (['0', 'false', 'off', 'no'].includes(str)) value = false
    } else if (typeof value === 'number') {
      if (value === 1) value = true
      else if (value === 0) value = false
    }

    if (typeof value !== 'boolean') return failed(`${field} must be true or false`)
    return success(value)
  }
}
