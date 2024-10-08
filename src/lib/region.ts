import { Helpers, _ } from 'tnp-core/src';
import { Replacement, ReplacementString, labelReplacementCode } from './models';
// import { codeCuttFn } from '../code-cut';
import type { RegionRemover } from './region-remover';
import { TAGS } from 'tnp-config/src';

export class Region {
  constructor(
    private context: RegionRemover,
    public replacementss: Replacement[],
    public parent: Region,
    public startIndex: number,
    public endIndex: number,
    public lineStart: string,
    public lineEnd: string,
    public contentLines: string[] = [],

  ) { }
  private tmpOutput: string;
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

  private regionsOrStrings: (Region | string)[] = [];

  get regions() {
    return this.regionsOrStrings.filter(f => f instanceof Region);
  }

  private setEnd(endIndex: number, lineEnd: string) {
    this.endIndex = endIndex;
    this.lineEnd = lineEnd;
  }

  get isRoot() {
    return !this.parent;
  }

  addNormalLine(l: string, lineIndex: number) {
    this.contentLines[lineIndex] = void 0;
    this.regionsOrStrings.push(l);
  }

  addNormalLineToLastRegion(l: string, lineIndex: number) {
    this.contentLines[lineIndex] = void 0;
    this.lastRegionWithoutEnd.contentLines.push(l);
  }

  addRegion(context: RegionRemover, parent: Region, startIndex: number, lineStart: string) {
    this.contentLines[startIndex] = void 0;
    const newReg = new Region(
      context,
      this.replacementss,
      parent,
      startIndex, void 0,
      lineStart, void 0,
      [lineStart]
    );
    this.regionsOrStrings.push(newReg);
  }

  endLastRegion(endIndex: number, lineEnd: string) {
    this.contentLines[endIndex] = void 0;
    const regionWithoutEnd = this.regionsOrStrings.find(r => r instanceof Region && !r.hasEnd) as Region;
    regionWithoutEnd.contentLines.push(lineEnd);
    regionWithoutEnd.setEnd(endIndex, lineEnd);
  }

  private containsTitle(s: ReplacementString) {
    const res = (this.titleString.search(s) !== -1);
    // Helpers.log(`checking tag (${res}): "${s}" in line: "${this.titleString}"`)
    return res;
  }

  private get titleString() {
    let line = this.lineStart;
    const regionWord = '#region';
    const indexOfRegion = line.search(regionWord);
    line = line.replace(
      line.slice(0, indexOfRegion + regionWord.length),
      ''
    );
    return line
      .replace('-->', '')
      .replace('<!--', ''); // TODO not necessery ?
  }

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

            const regionTag = (isArr ? _.first(rep as string[]) : rep) as ReplacementString;

            let out = (isArr ? rep[1] : '') as string;

            const verticalLength = regionOrString.toString().split('\n').length - 1;

            if (regionOrString.containsTitle(regionTag)) {
              if (regionTag.toLowerCase() === TAGS.WEBSQL.toLowerCase()) {
                out = `${_.times(verticalLength).map(() => labelReplacementCode.backendCode + '\n').join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BACKEND.toLowerCase()) {
                out = `${_.times(verticalLength).map(() => labelReplacementCode.backendCode + '\n').join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.NOT_FOR_NPM.toLowerCase()) {
                out = `${_.times(verticalLength).map(() => labelReplacementCode.notForNpmCode + '\n').join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.BROWSER.toLowerCase()) {
                out = `${_.times(verticalLength).map(() => labelReplacementCode.browserCode + '\n').join('')}  ${out}`;
              }
              if (regionTag.toLowerCase() === TAGS.WEBSQL_ONLY.toLowerCase()) {
                out = `${_.times(verticalLength).map(() => labelReplacementCode.backendCode + '\n').join('')}  ${out}`;
              }
              if (
                regionTag.toLowerCase() === TAGS.BACKEND_FUNC.toLowerCase()
              ) {
                let spacesPrevious = previous.search(/\S/);
                spacesPrevious = (spacesPrevious < 0 ? 0 : spacesPrevious);
                out = `${_.times(verticalLength).map(() => labelReplacementCode.backendCode + '\n').join('')}`
                  + `${_.times(spacesPrevious).map(n => ' ').join('')}  ${out}`;
              }
              if (
                regionTag.toLowerCase() === TAGS.WEBSQL_FUNC.toLowerCase()
              ) {
                let spacesPrevious = previous.search(/\S/);
                spacesPrevious = (spacesPrevious < 0 ? 0 : spacesPrevious);
                out = `${_.times(verticalLength).map(() => labelReplacementCode.backendCode + '\n').join('')}`
                  + `${_.times(spacesPrevious).map(n => ' ').join('')}  ${out}`;
              }
              if (
                regionTag.toLowerCase() === TAGS.CUT_CODE_IF_TRUE.toLowerCase()
                ||
                regionTag.toLowerCase() === TAGS.CUT_CODE_IF_FALSE.toLowerCase()
              ) {
                const fn = out as any; // as ReturnType<typeof codeCuttFn>;
                let expressionToExecute = regionOrString.titleString;
                // Helpers.log(`LINE: "${regionOrString.lineStart}"`);
                expressionToExecute = expressionToExecute.replace(regionTag, '');
                // Helpers.log(`Expresion to evaluate "${expressionToExecute}"`);
                // Helpers.log(`this.project "${this.project.name}"`);
                const configForProject = this.project && this.project.env.config;
                // Helpers.log(`configForProject "${configForProject}"`);
                const cutCode = fn(expressionToExecute, configForProject, this.realtiveOrAbsFilePAth);
                // Helpers.info(`Cut code: "${cutCode}"`);
                if (cutCode === null) {
                  continue;
                }
                if (
                  (cutCode && (
                    regionTag.toLowerCase() === TAGS.CUT_CODE_IF_TRUE.toLowerCase()
                  ))
                  ||
                  (!cutCode && (
                    regionTag.toLowerCase() === TAGS.CUT_CODE_IF_FALSE.toLowerCase()
                  ))
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
      }).join('\n');
    return this.tmpOutput;
  }

  private get project() {
    return this.context.project;
  }

  private get realtiveOrAbsFilePAth() {
    return this.context.realtiveOrAbsFilePAth;
  }

}

