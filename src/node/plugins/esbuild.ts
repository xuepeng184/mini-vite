//将js，tsx等编译成可识别的js语法
import { readFile } from 'fs-extra';
import { Plugin } from '../plugin';
import { isJsRequest } from '../utils';
import esbuild from 'esbuild';
import path from 'path';

export function esbuildTransformPlugin(): Plugin {
  return {
    name: 'm-vite:esbuild-transform',
    async load(id) {
      if (isJsRequest(id)) {
        try {
          const code = await readFile(id, 'utf-8');
          return code;
        } catch (e) {
          return null;
        }
      }
    },
    async transform(code, id) {
      if (isJsRequest(id)) {
        const extname = path.extname(id).slice(1);
        const { code: transformedCode, map } = await esbuild.transform(code, {
          target: 'esnext',
          format: 'esm',
          sourcemap: true,
          loader: extname as 'js' | 'ts' | 'jsx' | 'tsx'
        });
        return {
          code: transformedCode,
          map
        };
      }
      return null;
    }
  };
}
