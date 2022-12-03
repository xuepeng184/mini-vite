import { ServerContext } from "./server";
import { blue, green } from "picocolors";
import { getShortName } from "./utils";

export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, ws, root } = serverContext;

  watcher.on("change", async (file) => {
    console.log(`${blue("[hmr]")} ${green(file)} change`);
    const { moduleGraph } = serverContext;
    //清除模块依赖图中的相关缓存
    await moduleGraph.invalidateModule(file);
    //向客户端发送给更新信息
    ws.send({
      type: "update",
      updates: [
        {
          type: "js-update",
          timestamp: Date.now(),
          path: "/" + getShortName(file, root),
          acceptedPath: "/" + getShortName(file, root),
        },
      ],
    });
  });
}
