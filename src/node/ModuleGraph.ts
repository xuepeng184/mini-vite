//实现模块依赖图
//为了方便管理各个模块之间的依赖关系？
import { PartialResolvedId, TransformResult } from "rollup";

import { cleanUrl } from "./utils";

export class ModuleNode {
  //资源访问url
  url: string;
  //资源绝对路径
  id: string | null = null;
  importers = new Set<ModuleNode>();
  importedModules = new Set<ModuleNode>();
  transformResult: TransformResult | null = null;
  lastHMRTimestamp = 0;
  constructor(url: string) {
    this.url = url;
  }
}

export class ModuleGraph {
  //资源url到ModuleNode的映射表
  urlToModuleMap = new Map<string, ModuleNode>();
  //资源绝对路径到ModuleNode的映射表
  idToModuleMap = new Map<string, ModuleNode>();

  constructor(private resolveId: (url: string) => Promise<PartialResolvedId | null>) {}

  getModuleById(id:string):ModuleNode|undefined{
    return this.idToModuleMap.get(id)
  }

  async getModuleByUrl(rawUrl:string):Promise<ModuleNode|undefined>{
    // const {url}=await this._resolve(rawUrl);
    return this.urlToModuleMap.get(url)
  }


}
