//入口Html编译和加载的能力
// 通过一个服务中间件来实现

import { NextHandleFunction } from 'connect';
import { ServerContext } from '../index';
import path from 'path';
import { pathExists, readFile } from 'fs-extra';

export function indexHtmlMiddleware(
  serverContext: ServerContext
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.url === '/') {
      const { root } = serverContext;
      //默认使用根目录下的index.html
      const indexHtmlPath = path.join(root, 'index.html');
      if (await pathExists(indexHtmlPath)) {
        const rawHtml = await readFile(indexHtmlPath, 'utf-8');
        let html = rawHtml;
        // 一次小尝试，将vite App替换为xpppp
        html = html.replace('Vite App', 'xpppp');
        // console.log('-------html',html);

        //通过执行插件的transformindexhtml方法来进行自定义修改
        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html);
          }
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        return res.end(html);
      }
      return next();
    }
  };
}
