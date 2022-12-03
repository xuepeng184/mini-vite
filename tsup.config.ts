import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/node/cli.ts",
    client: "src/client/client.ts",
  },
  format: ["esm", "cjs"],
  //目标语法
  target: "es2020",
  sourcemap: true,
  splitting: false,
});
