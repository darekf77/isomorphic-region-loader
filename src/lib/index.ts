//#region @backend
import { RegionRemover } from "./region-remover.backend";
//#endregion

function StripBrowserCode(content) {
  //#region @backend

  // @ts-ignore
  content = RegionRemover.from(this.resourcePath, content, ['@browser']).output + '\n';

  if (this.cacheable) {
    this.cacheable(true);
  }

  return content;
  //#endregion
}

export { StripBrowserCode as StripBlockLoader };
//#region @backend
export * from './region-remover.backend';
export * from './region.backend';
//#endregion
export default StripBrowserCode;
