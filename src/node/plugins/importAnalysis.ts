//解决文件中第三方依赖路径，重写预构建产物，改变路径
//import分析插件
import { init, parse } from "es-module-lexer";
import { BARE_IMPORT_RE, DEFAULT_EXTENSIONS, PRE_BUNDLE_DIR } from "../constants";
import { cleanUrl, isJsRequest, normalizePath } from "../utils";
import MagicString from "magic-string";
import path from "path";
import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import { pathExists } from "fs-extra";
import resolve from "resolve";
import type { PluginContext } from "rollup";

export function importAnalysisPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: "m-vite:import-analysis",
    configureServer(s) {
      //保存上下文
      serverContext = s;
    },
    async transform(this: PluginContext, code: string, id: string) {
      //只处理js相关的请求
      if (!isJsRequest(id)) {
        return null;
      }
      await init;
      //解析import语句
      const [imports] = parse(code);
      const ms = new MagicString(code);
      //对每一个import语句进行分析
      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modeSource } = importInfo;
        if (!modeSource) continue;
        //静态资源
        if (modeSource.endsWith(".svg")) {
          //加上一个？import后缀
          let resolveUrl = path.join(path.dirname(id), modeSource);
          const a = resolveUrl.split("\\");
          resolveUrl = a.join("/");
          resolveUrl = resolveUrl.slice(2);
          ms.overwrite(modStart, modEnd, `${resolveUrl}?import`);
          continue;
        }
        if (BARE_IMPORT_RE.test(modeSource)) {
          //第三方库，路径重写到预构建的路径
          const bundlePath = normalizePath(path.join("/", PRE_BUNDLE_DIR, `${modeSource}.js`));
          ms.overwrite(modStart, modEnd, bundlePath);
        } else if (modeSource.startsWith(".") || modeSource.startsWith("/")) {
          //直接调用上下文的resolve方法，会经过路劲解析插件的处理
          const resolved = await this.resolve(modeSource, id);
          if (resolved) {
            ms.overwrite(modStart, modEnd, resolved.id);
          }
        }
      }
      return {
        code: ms.toString(),
        map: ms.generateMap(),
      };
    },
  };
}
