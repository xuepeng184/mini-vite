//路径解析插件，对请求路径进行解析
import resolve from 'resolve';
import { Plugin } from '../plugin';
import { ServerContext } from '../server';
import path from 'path';
import { pathExists } from 'fs-extra';
import { DEFAULT_EXTENSIONS } from '../constants';
import { cleanUrl, normalizePath } from '../utils';

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: 'm-vite:resolve',
    configureServer(s) {
      // 保存服务端上下文
      serverContext = s;
    },
    async resolveId(id: string, importer?: string) {
      //绝对路径
      if (path.isAbsolute(id)) {
        if (await pathExists(id)) {
          return { id };
        }
        //处理绝对路径中 ‘/src/main.tsx 的情况
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return { id };
        }
      }
      //相对路径的情况
      else if (id.startsWith('.')) {
        if (!importer) {
          throw new Error('"importer" should not be undefined');
        }
        // console.log('importer------->',importer);

        const hasExtension = path.extname(id).length > 1;
        let resolveId: string;
        //包含文件名后缀
        //如 ./App.tsx
        if (hasExtension) {
          resolveId = normalizePath(
            resolve.sync(id, { basedir: path.dirname(importer) })
          );
          // console.log('resolve,ts-------->',resolveId);

          if (await pathExists(resolveId)) {
            // return {id:resolveId}
            return { id };
          }
        }
        //不包含文件名后缀
        else {
          for (const extname of DEFAULT_EXTENSIONS) {
            try {
              const withExtension = `${id}${extname}`;
              resolveId = normalizePath(
                resolve.sync(withExtension, {
                  basedir: path.dirname(importer)
                })
              );
              // console.log(resolveId);

              if (await pathExists(resolveId)) {
                return { id: withExtension };
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
      return null;
    }
  };
}
