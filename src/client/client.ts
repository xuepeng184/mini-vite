//hmr客户端的具体实现
console.log("[xp vite] connecting");

//创建websocket客户端实例
const socket = new WebSocket(`ws://localhost:__HMR_PORT__`, "vite-hmr");

//接收服务端的更新信息
socket.addEventListener("message", async ({ data }) => {
  handleMessage(JSON.parse(data)).catch(console.error);
});

async function handleMessage(payload: any) {
  switch (payload.type) {
    case "connected":
      console.log(`[vite] connected`);
      //心跳检测
      setInterval(() => socket.send("ping"), 1000);
      break;

    case "update":
      payload.updates.forEach((update: Update) => {
        if (update.type === "js-update") {
          //......
        }
      });
      break;
  }
}
