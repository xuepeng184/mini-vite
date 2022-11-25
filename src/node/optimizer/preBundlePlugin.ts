//依赖构建的插件

import { Plugin, Loader } from 'esbuild';
import { BARE_IMPORT_RE } from '../constants';
// 用来分析es模块的 import/export 语句的库
import { init, parse } from 'es-module-lexer';
import path from 'path';
//一个实现了node路径解析算法的库
import resolve from 'resolve';
// 一个更加好用的文件操作库
import fs from 'fs-extra';
//用来开发打印 debug 日志的库
import createDebug from 'debug';
import { normalizePath } from '../utils';
import { ExportSpecifier } from 'es-module-lexer';

const debug = createDebug('dev');

export function preBundlePlugin(deps: Set<string>): Plugin {
  return {
    name: 'esbuild:pre-bundle',
    setup(build) {
      build.onResolve(
        {
          filter: BARE_IMPORT_RE
        },
        (resolveInfo) => {
          const { path: id, importer } = resolveInfo;
          const isEntry = !importer;
          //命中需要预构建的依赖
          if (deps.has(id)) {
            //如果为入口，则标记dep的namespace
            return isEntry
              ? {
                  path: id,
                  namespace: 'dep'
                }
              : {
                  //因为走到 onResolve 了，所以这里的path 就是绝对路径了
                  path: resolve.sync(id, { basedir: process.cwd() })
                };
          }
        }
      );
      //拿到标记后的模块，构造代理模块，交给esbuild打包
      build.onLoad(
        {
          filter: /.*/,
          namespace: 'dep'
        },
        async (loadInfo) => {
          //es-module-lexer的init初始化
          await init;
          const id = loadInfo.path;
          const root = process.cwd();
          //获得路径
          const entryPath = normalizePath(resolve.sync(id, { basedir: root }));
          // 读取文件内容
          const code = await fs.readFile(entryPath, 'utf-8');
          //es模块的解析，cjs解析不到
          const [imports, exports] = await parse(code);
          const proxyModule = [];

          let relativePath = normalizePath(path.relative(root, entryPath));
          if (
            !relativePath.startsWith('./') &&
            !relativePath.startsWith('../') &&
            relativePath !== '.'
          ) {
            relativePath = `./${relativePath}`;
          }

          //cjs
          // 所以这里为空代表cjs模块
          if (!imports.length && !exports.length) {
            //构造代理模块
            const res = require(entryPath);
            const specifiers = Object.keys(res);
            // console.log('res',res);

            // console.log("specifiers------->", specifiers);

            proxyModule.push(
              `export { ${specifiers.join(',')} } from "${relativePath}"`,
              `export default require("${relativePath}")`

              // `export {${specifiers.join(",")} } from "${entryPath}"`,
              // `export default require("${entryPath})`
            );
          } else {
            //esm格式的处理
            if (exports.includes('default' as any as ExportSpecifier)) {
              proxyModule.push(
                `import d from "${relativePath}";export default d`
              );
              // proxyModule.push(`import d from "${entryPath}";export default d`);
            }
            proxyModule.push(`export * from "${relativePath}"`);
            // proxyModule.push(`export * from "${entryPath}"`);
          }
          debug('代理模块内容：%o', proxyModule.join('\n'));
          const loader = path.extname(entryPath).slice(1);
          return {
            loader: loader as Loader,
            contents: proxyModule.join('\n'),
            resolveDir: root
          };
        }
      );
    }
  };
}
