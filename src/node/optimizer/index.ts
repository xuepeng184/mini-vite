import path from "path";
import { build } from "esbuild";
import { green, red } from "picocolors";
import { scanPlugin } from "./scanPlugin";
import { PRE_BUNDLE_DIR } from "../constants";
import { preBundlePlugin } from "./preBundlePlugin";

export async function optimize(root: string) {
  //确定入口
  const entry = path.resolve(root, "src/main.tsx");

  //从入口处扫描依赖
  const deps = new Set<string>();
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)],
  });
  console.log(
    `${green("需要预构建的依赖")}:\n${[...deps]
      .map(red)
      .map((item) => `  ${item}`)
      .join("\n")}`
  );

  // 依赖预构建
  await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)],
  });
}
