// 兼容windows系统

import os from "os";
import path from "path";
import { JS_TYPES_RE, HASH_RE, QUERY_RE } from "./constants";

//对window电脑进行适配
export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

//判断是否是window电脑
export const isWindows = os.platform() === "win32";

//对路径进行window适配
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

//顾名思义，清理url，去除hash等信息
export const cleanUrl = (url: string): string => url.replace(HASH_RE, "").replace(QUERY_RE, "");

//
export const isJsRequest = (id: string): boolean => {
  id = cleanUrl(id);
  if (JS_TYPES_RE.test(id)) {
    return true;
  }
  if (!path.extname(id) && id.endsWith("/")) {
    return true;
  }
  return false;
};

export const isCssRequest = (id: string): boolean => cleanUrl(id).endsWith(".css");

//静态资源请求
export function isImportRequest(url: string): boolean {
  return url.endsWith("?import");
}

//应该是返回相对路径
export function getShortName(file: string, root: string) {
  return file.startsWith(root + "/") ? path.posix.relative(root, file) : file;
}

//去除后面添加的import
export function removeImportQuery(url: string): string {
  return url.replace(/\?import$/, "");
}
