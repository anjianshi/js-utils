/**
 * Node 环境下的工具函数
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 确认一个路径是否存在且是文件
 */
export async function isFileExists(filepath: string) {
  try {
    const res = await fs.promises.stat(filepath)
    return res.isFile()
  } catch (e) {
    return false
  }
}

/**
 * 确认一个路径是否存在且是文件夹
 */
export async function isDirectoryExists(dirpath: string) {
  try {
    const res = await fs.promises.stat(dirpath)
    return res.isDirectory()
  } catch (e) {
    return false
  }
}

/**
 * 返回当前文件的绝对路径
 * 需要传入当前文件的 ImportMeta 对象（可通过 import.meta 取得）
 */
export function getFilePath(fileUrl: string | ImportMeta) {
  if (typeof fileUrl !== 'string') fileUrl = fileUrl.url
  return fileURLToPath(new URL(fileUrl))
}

/**
 * 返回文件所处目录的绝对路径
 */
export function getFileDir(fileUrl: string | ImportMeta) {
  return path.dirname(getFilePath(fileUrl))
}
