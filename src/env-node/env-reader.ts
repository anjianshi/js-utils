import * as dotenv from 'dotenv'

/**
 * 读取 .env 文件，并获取格式化后的数据
 * 注意：依赖 dotenv 包
 */
export class EnvReader {
  envsFromFile: Record<string, string> = {}

  constructor(readonly envFile: string) {
    dotenv.config({
      path: this.envFile,
      processEnv: this.envsFromFile, // 把从 .env 文件读到的内容写入到此实例的属性，而不是 process.env
    })
  }

  get(key: string, defaults: string): string
  get(key: string, defaults: number): number
  get(key: string, defaults: boolean): boolean
  get(key: string, defaults: string | number | boolean) {
    const value = this.envsFromFile[key] ?? process.env[key]
    if (value === undefined) return defaults

    if (typeof defaults === 'number') {
      const numValue = parseInt(value, 10)
      return isFinite(numValue) ? numValue : defaults
    } else if (typeof defaults === 'boolean') {
      return ['1', 'true'].includes(value.toLowerCase().trim())
    } else {
      return value
    }
  }
}
