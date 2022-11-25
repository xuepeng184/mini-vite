//处理非import的静态资源请求
//如img标签内的src请求
import { NextHandleFunction } from "connect";
import { isImportRequest } from "../../utils";

//一个用于加载静态资源的中间件
import sirv from "sirv";

export function staticMiddleware(root: string): NextHandleFunction {
  root = root.slice(0, 2) + "/" + root.slice(2);
  console.log("root", root);
  root = root.slice(4);
  const serveFromRoot = sirv(root, { dev: true });

  return async (req, res, next) => {
    console.log("req.url", req.url);

    if (!req.url) {
      return;
    }
    //不处理import请求
    if (isImportRequest(req.url)) {
      return;
    }
    serveFromRoot(req, res, next);
  };
}
