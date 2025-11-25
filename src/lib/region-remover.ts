import { REGEX_REGION, TAGS } from 'tnp-core/src';
import { _, path } from 'tnp-core/src';
import { Helpers } from 'tnp-core/src';
import { CoreModels } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import { Region } from './region';

export class RegionRemover {
  private root: Region;
  private readonly START_REGION: RegExp[] = [];
  private readonly END_REGION: RegExp[] = [];
  public static from(
    realtiveOrAbsFilePAth: string,
    content: string,
    replacementss?: any, // Models.dev.Replacement[],
    project?: any, // Project,
    // debug = false,
  ) {
    let fileExtension = path.extname(realtiveOrAbsFilePAth);

    if (!replacementss) {
      replacementss = [
        [TAGS.BACKEND_FUNC, `return (void 0);`],
        TAGS.BACKEND as any,
      ];
    }
    return new RegionRemover(
      realtiveOrAbsFilePAth,
      fileExtension as any,
      content,
      replacementss,
      project,
      // debug,
    );
  }

  private matchStartRegion(l: string) {
    const res = !_.isUndefined(this.START_REGION.find(r => l.match(r)));
    return res;
  }
  private matchEndRegion(l: string) {
    const res = !_.isUndefined(this.END_REGION.find(r => l.match(r)));
    return res;
  }

  private constructor(
    public readonly realtiveOrAbsFilePAth: string,
    fileExtension: CoreModels.CutableFileExt,
    private content: string,
    replacementss?: any, // Models.dev.Replacement[],
    public readonly project?: any, // Project
    // public readonly debug = false,
  ) {
    if (REGEX_REGION.TS_JS_SCSS_SASS.EXT.includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.TS_JS_SCSS_SASS.START);
      this.END_REGION.push(REGEX_REGION.TS_JS_SCSS_SASS.END);
    }
    if (REGEX_REGION.HTML.EXT.includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.HTML.START);
      this.END_REGION.push(REGEX_REGION.HTML.END);
    }
    if (REGEX_REGION.CSS.EXT.includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.CSS.START);
      this.END_REGION.push(REGEX_REGION.CSS.END);
    }

    this.content =
      UtilsTypescript.removeTaggedImportExport(
        this.content,
        replacementss,
        // debug,
      ) || '';

    const lines = this.content.split('\n');
    this.root = new Region(
      this,
      replacementss,
      void 0,
      0,
      lines.length - 1,
      _.first(lines),
      _.last(lines),
      lines,
    );
    this.tree(this.root);
  }

  private tree(node: Region) {
    const contentLines = node.contentLines;
    // if (contentLines.length <= 3) {
    //   for (let i = 0; i < contentLines.length; i++) {
    //     const l = contentLines[i];
    //     node.addNormalLine(l, i);
    //   }
    // } else {
    let stack = 0;
    for (let i = 0; i < contentLines.length; i++) {
      const l = contentLines[i];
      if (!node.isRoot) {
        if (i === 0) {
          node.addNormalLine(l, 0);
          continue;
        }
        if (i === node.contentLines.length - 1) {
          node.addNormalLine(l, i);
          continue;
        }
      }
      if (node.lastRegionWithoutEnd) {
        if (this.matchStartRegion(l)) {
          node.addNormalLineToLastRegion(l, i);
          stack++;
        } else if (this.matchEndRegion(l)) {
          if (stack === 0) {
            node.endLastRegion(i, l);
          } else if (stack > 0) {
            node.addNormalLineToLastRegion(l, i);
            stack--;
          }
        } else {
          if (i === node.contentLines.length - (node.isRoot ? 1 : 2)) {
            stack = 0;
            node.endLastRegion(i, l);
          } else {
            node.addNormalLineToLastRegion(l, i);
          }
        }
      } else {
        if (this.matchStartRegion(l)) {
          node.addRegion(this, node, i, l);
        } else if (this.matchEndRegion(l)) {
          node.addNormalLine(l, i);
        } else {
          node.addNormalLine(l, i);
        }
      }
    }
    // }

    const children = node.regions;
    if (children.length > 0) {
      for (let index = 0; index < children.length; index++) {
        const child = children[index] as Region;
        this.tree(child);
      }
    }
  }

  get output() {
    return this.root.toString();
  }
}
