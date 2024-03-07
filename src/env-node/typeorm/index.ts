/**
 * TypeORM 相关工具函数
 */
import { type FindOptionsWhere, type BaseEntity } from 'typeorm'
import { type ExcluceMethods } from '../../lang/index.js'

export * from './adapt-logging.js'

/**
 * 返回 Entity 对应的纯数据类型
 */
export type DataOnly<T extends BaseEntity> = Omit<ExcluceMethods<T>, 'hasId'>

/**
 * 转义字符串以安全地进行 SQL LIKE 匹配
 */
export function escapeLikeString(raw: string, escapeChar = '\\'): string {
  return raw.replace(/[\\%_]/g, match => escapeChar + match)
}

/**
 * 返回 instances 里没有出现的 id
 */
export function getNotExistIds<T extends { id: string }>(instances: T[], ids: string[]) {
  return ids.filter(id => !instances.find(inst => inst.id === id))
}

/**
 * TypeORM 的 find({ where: {} }) 里不支持 AND 和 OR 并列使用
 * 例如：is_disabled IS NULL AND (name LIKE '%ab%' OR nickname LIKE '%ab%')
 * 只能蹩脚地写成 `where: [{ name: LIKE('xx'), is_disabled: xx }, { nickname: LIKE('xx'), is_disabled: xx }]`
 *
 * 此函数简化了这一转换步骤，使得可以逻辑直观地并列书写 AND 和 OR。
 * 在 `where: {}` 里，`or_` 开头且值是数组的项被组织为一个 OR，其 key 会被忽略，内容转换为上面的形式。
 */
function smartWhere<Entity>(where: FindOptionsWhere<Entity>): FindOptionsWhere<Entity>
function smartWhere<Entity>(where: FindOptionsWhere<Entity>[]): FindOptionsWhere<Entity>[]
function smartWhere<Entity>(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
  if (Array.isArray(where)) return where.map(item => smartWhere(item))

  const orPrefix = 'or_'
  const orContent: Record<string, FindOptionsWhere<Entity>[]> = {}
  const andContent: FindOptionsWhere<Entity> = {}
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue
    if (key.startsWith(orPrefix) && Array.isArray(value)) {
      orContent[key] = value as FindOptionsWhere<Entity>[]
    } else {
      ;(andContent as Record<string, unknown>)[key] = value
    }
  }

  const nextWhere = { ...where }
  const currentOr = Object.entries(nextWhere).find(
    ([key, value]) => key.startsWith(orPrefix) && Array.isArray(value)
  ) as [string, FindOptionsWhere<Entity>[]] | undefined
  if (currentOr === undefined) return nextWhere
  delete (nextWhere as Record<string, unknown>)[currentOr[0]]
  const result = currentOr[1].map(subWhere => ({ ...subWhere, ...smartWhere(nextWhere) }))
  return result
}
export { smartWhere }
