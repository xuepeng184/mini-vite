import { Plugin } from './plugin';
//插件容器

import type {
  LoadResult,
  PartialResolvedId,
  SourceDescription,
  PluginContext as RollupPluginContext,
  ResolvedId
} from 'rollup';

//防止没有实现rollupPlugin全部方法会报错
type myRollupPluginContext = Pick<RollupPluginContext, 'resolve'>;

//新增的类型定义
export interface PluginContainer {
  resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>;
  load(id: string): Promise<LoadResult | null>;
  transform(code: string, id: string): Promise<LoadResult | null>;
}

// 模拟rollup的插件机制
export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  //插件上下文对象，这里只实现resolve方法，例如在resolveId钩子中被用到过
  class Context implements myRollupPluginContext {
    // resolve会执行所有插件（除当前插件外）的resolveId钩子
    async resolve(id: string, importer?: string) {
      let out = await pluginContainer.resolveId(id, importer);
      if (typeof out === 'string') out = { id: out };
      return out as ResolvedId | null;
    }
  }

  //插件容器
  const pluginContainer: PluginContainer = {
    async resolveId(id: string, importer?: string) {
      const ctx = new Context() as any;
      //遍历插件
      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const newId = await plugin.resolveId.call(ctx as any, id, importer);
          if (newId) {
            id = typeof newId === 'string' ? newId : newId.id;
            return { id };
          }
        }
      }
      return null;
    },
    async load(id) {
      const ctx = new Context() as any;
      for (const plugin of plugins) {
        if (plugin.load) {
          const result = await plugin.load.call(ctx, id);
          if (result) {
            return result;
          }
        }
      }
      return null;
    },
    async transform(code, id) {
      const ctx = new Context() as any;
      for (const plugin of plugins) {
        const result = await plugin.transform?.call(ctx, code, id);
        if (!result) continue;
        if (typeof result === 'string') {
          code = result;
        } else if (result.code) {
          code = result.code;
        }
      }
      return { code };
    }
  };
  return pluginContainer;
};
