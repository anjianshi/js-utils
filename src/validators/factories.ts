/**
 * 创建 validator 的快捷方式
 */
import { ArrayValidator, type ArrayOptions } from './array.js'
import { Validator, type BaseOptions } from './base.js'
import { BooleanValidator } from './boolean.js'
import { NumberValidator } from './number.js'
import { ObjectValidator, type RecordOptions } from './object.js'
import { StringValidator } from './string.js'

/** 仅进行基本检查（如检查空值），不检查具体格式 */
export function any(options?: Partial<BaseOptions>) {
  return new Validator(options ?? {})
}

export function string(...args: ConstructorParameters<typeof StringValidator>) {
  return new StringValidator(...args)
}

export function number(...args: ConstructorParameters<typeof NumberValidator>) {
  return new NumberValidator(...args)
}

export function boolean(options: Partial<BaseOptions> = {}) {
  return new BooleanValidator(options)
}

export function array(options: Validator | (ArrayOptions & Partial<BaseOptions>)) {
  if (options instanceof Validator) options = { item: options }
  return new ArrayValidator(options)
}

export function tuple(validators: Validator[], baseOptions?: Partial<BaseOptions>) {
  return new ArrayValidator({
    ...(baseOptions ?? {}),
    tuple: validators,
  })
}

export function struct(validators: Record<string, Validator>, options: Partial<BaseOptions> = {}) {
  return new ObjectValidator({ ...options, struct: validators })
}

export function record(options: Validator | (RecordOptions & Partial<BaseOptions>)) {
  if (options instanceof Validator) options = { record: options }
  return new ObjectValidator(options)
}
