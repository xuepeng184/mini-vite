import { pathExists, readFile } from "fs-extra";
import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import { cleanUrl, normalizePath, getShortName, removeImportQuery } from "../utils";

export function assetPlugin(): Plugin {
  let serverContext: ServerContext;
  return {
    name: "m-vite:asset",
    configureServer(s) {
      serverContext = s;
    },
    async load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id));
      const resolvedId = `/${getShortName(normalizePath(id), serverContext.root)}`;

      //仅处理svg
      if (cleanedId.endsWith(".svg")) {
        console.log(resolvedId);
        return {
          code: `export default "${resolvedId}"`,
        };
      }
    },
  };
}
