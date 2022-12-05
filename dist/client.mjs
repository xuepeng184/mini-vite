// src/client/client.ts
console.log("[xp vite] connecting");
var socket = new WebSocket(`ws://localhost:__HMR_PORT__`, "vite-hmr");
socket.addEventListener("message", async ({ data }) => {
  handleMessage(JSON.parse(data)).catch(console.error);
});
async function handleMessage(payload) {
  switch (payload.type) {
    case "connected":
      console.log(`[vite] connected`);
      setInterval(() => socket.send("ping"), 1e3);
      break;
    case "update":
      payload.updates.forEach((update) => {
        if (update.type === "js-update") {
        }
      });
      break;
  }
}
//# sourceMappingURL=client.mjs.map