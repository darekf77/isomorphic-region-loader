import { _, path } from 'tnp-core';
// import { Models } from 'tnp-models';
import { Helpers } from 'tnp-core';
import { Region } from './region.backend';
// import type { Project } from '../../../abstract/project';
import { ConfigModels } from 'tnp-config';


const REGEX_REGION = {
  TS_JS_SCSS_SASS: {
    START: new RegExp('\\/\\/\\s*\\#region'),
    END: new RegExp('\\/\\/\\s*\\#endregion'),
  },
  HTML: {
    START: new RegExp('\\<\\!\\-\\-\\s*\\#region'),
    END: new RegExp('\\<\\!\\-\\-\\s*\\#endregion'),
  },
  CSS: {
    START: new RegExp('\\/\\*\\s*\\#region'),
    END: new RegExp('\\/\\*\\s*\\#endregion'),
  },
};

export class RegionRemover {
  private root: Region;
  private readonly START_REGION: RegExp[] = [];
  private readonly END_REGION: RegExp[] = [];
  public static from(
    absoluteFilePath: string,
    content: string,
    replacementss?: any, // Models.dev.Replacement[],
    project?: any, // Project,
  ) {
    if (!path.isAbsolute(absoluteFilePath)) {
      Helpers.error(`[region-remover][from] path is not absolute:
      "${absoluteFilePath}"
      `, false, true);
    }
    let fileExtension = path.extname(absoluteFilePath);
    if (fileExtension.startsWith('.')) {
      fileExtension = fileExtension.replace('.', '') as any;
    }
    if (!replacementss) {
      replacementss = [
        ['@back' + 'endFunc', `return (void 0);`],
        '@bac' + 'kend' as any,
      ];
    }
    return new RegionRemover(absoluteFilePath, fileExtension as any, content, replacementss, project);
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
    public readonly fileAbsolutePath: string,
    fileExtension: ConfigModels.CutableFileExt,
    private content: string,
    replacementss?: any, // Models.dev.Replacement[],
    public readonly project?: any, // Project

  ) {
    if ((['js', 'ts', 'scss', 'sass'] as ConfigModels.CutableFileExt[]).includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.TS_JS_SCSS_SASS.START);
      this.END_REGION.push(REGEX_REGION.TS_JS_SCSS_SASS.END);
    }
    if ((['html'] as ConfigModels.CutableFileExt[]).includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.HTML.START);
      this.END_REGION.push(REGEX_REGION.HTML.END);
    }
    if ((['scss', 'sass', 'css'] as ConfigModels.CutableFileExt[]).includes(fileExtension)) {
      this.START_REGION.push(REGEX_REGION.CSS.START);
      this.END_REGION.push(REGEX_REGION.CSS.END);
    }

    const lines = this.content.split('\n');
    this.root = new Region(
      this,
      replacementss,
      void 0,
      0, (lines.length - 1),
      _.first(lines), _.last(lines),
      lines);
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
        if (i === (node.contentLines.length - 1)) {
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
          if (i === (node.contentLines.length - (node.isRoot ? 1 : 2))) {
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
    return this.root.toString().trimLeft();
  }

}
