import { LoadResult, PartialResolvedId, SourceDescription } from 'rollup';
import { ServerContext } from './server';

//赞不明白什么意思
export type ServerHook = (
  server: ServerContext
) => (() => void) | void | Promise<(() => void) | void>;

//暂时只实现这几个钩子
//这里是对应的类型声明
export interface Plugin {
  name: string;
  configureServer?: ServerHook;
  resolveId?: (
    id: string,
    importer?: string
  ) => Promise<PartialResolvedId | null> | PartialResolvedId | null;
  load?: (id: string) => Promise<LoadResult | null> | LoadResult | null;
  transform?: (
    code: string,
    id: string
  ) => Promise<SourceDescription | null> | SourceDescription | null;
  transformIndexHtml?: (raw: string) => Promise<string> | string;
}
