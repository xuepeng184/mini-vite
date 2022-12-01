import connect from "connect";

import { blue, green } from "picocolors";
import { optimize } from "../optimizer/index";
import { resolvePlugins } from "../plugins/index";
import { PluginContainer, createPluginContainer } from "../pluginContainer";
import { Plugin } from "../plugin";
import { indexHtmlMiddleware } from "./middlewares/indexHtml";
import { transformMiddleware } from "./middlewares/transform";
import { staticMiddleware } from "./middlewares/static";
import { normalizePath } from "../utils";
import { ModuleGraph } from "../ModuleGraph";

export interface ServerContext {
  root: string;
  pluginContainer: PluginContainer;
  app: connect.Server;
  plugins: Plugin[];
  moduleGraph:ModuleGraph
}

export async function startDevServer() {
  const app = connect();
  const root = process.cwd();

  const startTime = Date.now();
  const plugins = resolvePlugins();
  //创建插件容器
  const moduleGraph=new ModuleGraph((url)=>pluginContainer.resolveId(url))
  const pluginContainer = createPluginContainer(plugins);

  //创建configureServer所需的server实例
  const serverContext: ServerContext = {
    root: normalizePath(process.cwd()),
    app,
    pluginContainer,
    plugins,
    moduleGraph
  };

  for (const plugin of plugins) {
    if (plugin.configureServer) {
      //vite的configureServer中间件，用来拓展vite的devServer
      //用来增加自定义中间件
      await plugin.configureServer(serverContext);
    }
  }
  app.use(transformMiddleware(serverContext));
  //处理html资源的中间件
  app.use(indexHtmlMiddleware(serverContext));
  app.use(staticMiddleware(serverContext.root));
  app.listen(3000, async () => {
    //等待依赖预构建
    await optimize(root);
    console.log(green("🚀 xp的No-Bundle服务已经启动啦!"), `耗时：${Date.now() - startTime}ms`);
    console.log(`>本地访问路径：${blue("http://localhost:3000")}`);
  });
}
