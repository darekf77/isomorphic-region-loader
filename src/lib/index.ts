
import { RegionRemover } from "./region-remover";

export * from './models';

function StripBrowserCode(content) {


  // @ts-ignore
  content = RegionRemover.from(this.resourcePath, content, ['@browser']).output + '\n';

  if (this.cacheable) {
    this.cacheable(true);
  }

  return content;
}

export { StripBrowserCode as StripBlockLoader };

export * from './region-remover';
export * from './region';

export default StripBrowserCode;
