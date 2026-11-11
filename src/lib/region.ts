//#region imports
import {
  CoreModels,
  Helpers,
  REGEX_REGION,
  _,
  path,
  Replacement,
  taonCutNextLineCut,
} from 'tnp-core/src';
import { TAGS } from 'tnp-core/src';
import { ReplacementString } from 'tnp-core/src'; // (at)backend , (at)frontend etc
import { UtilsTypescript } from 'tnp-helpers/src';
//#endregion

//#region constnats / label code replacement
/*
export type Replacement<EnvConfig = any> =
  | ReplacementString
  | [ReplacementString, string]
  | [ReplacementString, (expression: any, env: any) => () => boolean];
*/

export const labelReplacementCode = {
  browserCode: '/* */', // '/* browser code */',
  backendCode: '/* */', // '/* backend code */',
  nodejsCode: '/* */', // '/* nodejs backend code */',
  cjsRemove: '/* */', // '/* backend cjs code */',
  esmRemove: '/* */', // '/* backend esm code */',
  notForNpmCode: '/* */', //'/* not for npm lib code */',
  onlyForGithubDocs: '/* */', // '/* only for github docs */',
  flatenImportExportRequred: '/* */', // '/* only for github docs */',
};
//#endregion

//#region models / replace options extended
export interface ReplaceOptionsExtended<EnvConfig = any> {
  replacements: Replacement[];
  env?: EnvConfig;
}
//#endregion

export class Region {
  //#region constructor
  constructor(
    private context: RegionRemover,
    public replacementss: Replacement[],
    public parent: Region,
    public startIndex: number,
    public endIndex: number,
    public lineStart: string,
    public lineEnd: string,
    public contentLines: string[] = [],
  ) {}
  //#endregion

  //#region fields & getters
  private tmpOutput: string;

  private regionsOrStrings: (Region | string)[] = [];

  public get hasEnd() {
    return this.endIndex !== void 0;
  }

  public get lastRegionWithoutEnd() {
    const last = _.last(this.regionsOrStrings);
    if (last instanceof Region && !last.hasEnd) {
      return last;
    }
    return void 0;
  }

  get regions() {
    return this.regionsOrStrings.filter(f => f instanceof Region);
  }

  get isRoot() {
    return !this.parent;
  }

  private get titleString() {
    let line = this.lineStart;
    const regionWord = '#reg' + 'ion';
    const indexOfRegion = line.search(regionWord);
    line = line.replace(line.slice(0, indexOfRegion + regionWord.length), '');
    return line.replace('-->', '').replace('<!--', ''); // TODO not necessery ?
  }

  private get callbackForEnv() {
    return this.context.callbackForEnv;
  }

  private get realtiveOrAbsFilePAth() {
    return this.context.realtiveOrAbsFilePAth;
  }
  //#endregion

  //#region methods / set end
  private setEnd(endIndex: number, lineEnd: string) {
    this.endIndex = endIndex;
    this.lineEnd = lineEnd;
  }
  //#endregion

  //#region methods / add normal line
  addNormalLine(l: string, lineIndex: number) {
    this.contentLines[lineIndex] = void 0;
    this.regionsOrStrings.push(l);
  }
  //#endregion

  //#region methods / add normal line to last region
  addNormalLineToLastRegion(l: string, lineIndex: number) {
    this.contentLines[lineIndex] = void 0;
    this.lastRegionWithoutEnd.contentLines.push(l);
  }
  //#endregion

  //#region methods / add region
  addRegion(
    context: RegionRemover,
    parent: Region,
    startIndex: number,
    lineStart: string,
  ) {
    this.contentLines[startIndex] = void 0;
    const newReg = new Region(
      context,
      this.replacementss,
      parent,
      startIndex,
      void 0,
      lineStart,
      void 0,
      [lineStart],
    );
    this.regionsOrStrings.push(newReg);
  }
  //#endregion

  //#region methods / end last region
  endLastRegion(endIndex: number, lineEnd: string) {
    this.contentLines[endIndex] = void 0;
    const regionWithoutEnd = this.regionsOrStrings.find(
      r => r instanceof Region && !r.hasEnd,
    ) as Region;
    regionWithoutEnd.contentLines.push(lineEnd);
    regionWithoutEnd.setEnd(endIndex, lineEnd);
  }
  //#endregion

  //#region methods / contains title
  private containsTitle(s: ReplacementString) {
    const res = this.titleString.search(s) !== -1;
    // Helpers.log(`checking tag (${res}): "${s}" in line: "${this.titleString}"`)
    return res;
  }
  //#endregion

  //#region API / to string
  public toString() {
    if (this.tmpOutput !== void 0) {
      return this.tmpOutput;
    }
    let previous = '';
    this.tmpOutput = this.regionsOrStrings
      .map(regionOrString => {
        if (regionOrString instanceof Region) {
          //#region handle region
          const replacements = this.replacementss;
          for (let index = 0; index < replacements.length; index++) {
            const rep = replacements[index];
            const isArr = _.isArray(replacements[index]);

            const regionTag = (
              isArr ? _.first(rep as string[]) : rep
            ) as ReplacementString;

            let out = (isArr ? rep[1] : '') as string;

            const verticalLength =
              regionOrString.toString().split('\n').length - 1;

            if (regionOrString.containsTitle(regionTag)) {
              if (regionTag.toLowerCase() === TAGS.CJS_REMOVE.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.cjsRemove + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.ESM_REMOVE.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.esmRemove + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.WEBSQL.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.backendCode + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BACKEND.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.nodejsCode + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.NOT_FOR_NPM.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.notForNpmCode + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BROWSER.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.browserCode + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.WEBSQL_ONLY.toLowerCase()) {
                out = `${_.times(verticalLength)
                  .map(() => labelReplacementCode.backendCode + '\n')
                  .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BACKEND_FUNC.toLowerCase()) {
                let spacesPrevious = previous.search(/\S/);
                spacesPrevious = spacesPrevious < 0 ? 0 : spacesPrevious;
                out =
                  `${_.times(verticalLength)
                    .map(() => labelReplacementCode.nodejsCode + '\n')
                    .join('')}` +
                  `${_.times(spacesPrevious)
                    .map(n => ' ')
                    .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.WEBSQL_FUNC.toLowerCase()) {
                let spacesPrevious = previous.search(/\S/);
                spacesPrevious = spacesPrevious < 0 ? 0 : spacesPrevious;
                out =
                  `${_.times(verticalLength)
                    .map(() => labelReplacementCode.backendCode + '\n')
                    .join('')}` +
                  `${_.times(spacesPrevious)
                    .map(n => ' ')
                    .join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BROWSER_FUNC.toLowerCase()) {
                let spacesPrevious = previous.search(/\S/);
                spacesPrevious = spacesPrevious < 0 ? 0 : spacesPrevious;
                out =
                  `${_.times(verticalLength)
                    .map(() => labelReplacementCode.browserCode + '\n')
                    .join('')}` +
                  `${_.times(spacesPrevious)
                    .map(n => ' ')
                    .join('')}  ${out}`;
              }
              if (
                regionTag.toLowerCase() ===
                  TAGS.CUT_CODE_IF_TRUE.toLowerCase() ||
                regionTag.toLowerCase() === TAGS.CUT_CODE_IF_FALSE.toLowerCase()
              ) {
                const fn = out as any; // as ReturnType<typeof codeCuttFn>;
                let expressionToExecute = regionOrString.titleString;
                // Helpers.log(`LINE: "${regionOrString.lineStart}"`);
                expressionToExecute = expressionToExecute.replace(
                  regionTag,
                  '',
                );
                // Helpers.log(`Expresion to evaluate "${expressionToExecute}"`);
                // Helpers.log(`this.project "${this.project.name}"`);
                const configForProject = this.callbackForEnv();
                // Helpers.log(`configForProject "${configForProject}"`);
                const cutCode = fn(
                  expressionToExecute,
                  configForProject,
                  this.realtiveOrAbsFilePAth,
                );
                // Helpers.info(`Cut code: "${cutCode}"`);
                if (cutCode === null) {
                  continue;
                }
                if (
                  (cutCode &&
                    regionTag.toLowerCase() ===
                      TAGS.CUT_CODE_IF_TRUE.toLowerCase()) ||
                  (!cutCode &&
                    regionTag.toLowerCase() ===
                      TAGS.CUT_CODE_IF_FALSE.toLowerCase())
                ) {
                  out = '';
                } else {
                  continue;
                }
              }
              regionOrString.tmpOutput = out;
              break;
            }
          }
          //#endregion
        }
        const res = regionOrString.toString();
        previous = res;
        return res;
      })
      .join('\n');
    return this.tmpOutput;
  }
  //#endregion
}

export class RegionRemover {
  //#region fields & getters
  private root: Region;

  private readonly START_REGION: RegExp[] = [];

  private readonly END_REGION: RegExp[] = [];

  get output() {
    return this.root.toString();
  }
  //#endregion

  //#region cosntructor
  private constructor(
    public readonly realtiveOrAbsFilePAth: string,
    fileExtension: CoreModels.CutableFileExt,
    private content: string,
    replacementss?: Replacement[],
    public readonly callbackForEnv?: () => any, // Project
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
  //#endregion

  //#region API / from
  public static from(
    realtiveOrAbsFilePAth: string,
    content: string,
    replacementss?: Replacement[],
    callbackForEnv?: () => any, // return environment config for project,
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
      callbackForEnv,
      // debug,
    );
  }
  //#endregion

  //#region methods / match start region
  private matchStartRegion(l: string) {
    const res = !_.isUndefined(this.START_REGION.find(r => l.match(r)));
    return res;
  }
  //#endregion

  //#region methods / match end region
  private matchEndRegion(l: string) {
    const res = !_.isUndefined(this.END_REGION.find(r => l.match(r)));
    return res;
  }
  //#endregion

  //#region methods / is skip next line cut directive
  private isSkipNextLineCutDirective(line: string): boolean {
    return line.includes(taonCutNextLineCut);
  }
  //#endregion

  //#region methods / add ordinary line
  private addOrdinaryLine(node: Region, line: string, lineIndex: number): void {
    if (node.lastRegionWithoutEnd) {
      node.addNormalLineToLastRegion(line, lineIndex);
    } else {
      node.addNormalLine(line, lineIndex);
    }
  }
  //#endregion

  //#region methods / tree
  private tree(node: Region): void {
    const lines = node.contentLines;

    let nestedRegionDepth = 0;
    let skipNextLineCut = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!node.isRoot) {
        if (i === 0 || i === lines.length - 1) {
          node.addNormalLine(line, i);
          continue;
        }
      }

      if (skipNextLineCut) {
        this.addOrdinaryLine(node, line, i);

        // A skipped line cannot open/close a region,
        // but it MAY request that the following line
        // is skipped as well.
        skipNextLineCut = this.isSkipNextLineCutDirective(line);

        continue;
      }

      if (this.isSkipNextLineCutDirective(line)) {
        this.addOrdinaryLine(node, line, i);
        skipNextLineCut = true;
        continue;
      }

      const isRegionStart = this.matchStartRegion(line);
      const isRegionEnd = this.matchEndRegion(line);

      const openRegion = node.lastRegionWithoutEnd;

      if (openRegion) {
        if (isRegionStart) {
          node.addNormalLineToLastRegion(line, i);
          nestedRegionDepth++;
          continue;
        }

        if (isRegionEnd) {
          if (nestedRegionDepth > 0) {
            node.addNormalLineToLastRegion(line, i);
            nestedRegionDepth--;
          } else {
            node.endLastRegion(i, line);
          }

          continue;
        }

        node.addNormalLineToLastRegion(line, i);
        continue;
      }

      if (isRegionStart) {
        node.addRegion(this, node, i, line);
        nestedRegionDepth = 0;
        continue;
      }

      node.addNormalLine(line, i);
    }

    for (const child of node.regions) {
      this.tree(child);
    }
  }
  //#endregion
}
