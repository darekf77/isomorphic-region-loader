// @taonSkipCut
import { TAGS, taonSkipCut, taonCutNextLineCut } from 'tnp-core/src';

import { RegionRemover } from './region';

const TAON_SKIP_NEXT_LINE_CUT = taonCutNextLineCut;

const process = (
  source: string,
  replacements: any[] = [TAGS.BACKEND],
): string => {
  return RegionRemover.from('test.ts', source, replacements).output;
};

describe('RegionRemover', () => {
  it('should remove matching region', () => {
    const source = `
const before = true;

//#region ${TAGS.BACKEND}
const removeMe = true;
//#endregion

const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain('const before = true;');
    expect(result).toContain('const after = true;');

    expect(result).not.toContain('const removeMe = true;');
  });

  it('should support nested regions', () => {
    const source = `
const before = true;

//#region ${TAGS.BACKEND}

const remove1 = true;

//#region somethingElse
const remove2 = true;
//#endregion

const remove3 = true;

//#endregion

const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain('const before = true;');
    expect(result).toContain('const after = true;');

    expect(result).not.toContain('const remove1 = true;');
    expect(result).not.toContain('const remove2 = true;');
    expect(result).not.toContain('const remove3 = true;');
  });

  it('should ignore region start on line after @taonSkipNextLineCut', () => {
    const source = `
const before = true;

// ${TAON_SKIP_NEXT_LINE_CUT}
const generated = '//#region ${TAGS.BACKEND}';

const shouldStay = true;
`.trim();

    const result = process(source);

    expect(result).toContain(`const generated = '//#region ${TAGS.BACKEND}';`);

    expect(result).toContain('const shouldStay = true;');
  });

  it('should ignore region end on line after @taonSkipNextLineCut', () => {
    const source = `
//#region ${TAGS.BACKEND}

const remove1 = true;

// ${TAON_SKIP_NEXT_LINE_CUT}
const generated = '//#endregion';

const remove2 = true;

//#endregion

const after = true;
`.trim();

    const result = process(source);

    expect(result).not.toContain('const remove1 = true;');
    expect(result).not.toContain('const remove2 = true;');

    expect(result).toContain('const after = true;');
  });

  it('should ignore a line containing both region start and end', () => {
    const source = `
const before = true;

// ${TAON_SKIP_NEXT_LINE_CUT}
const generated = '//#region ${TAGS.BACKEND} //#endregion';

const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain(
      `const generated = '//#region ${TAGS.BACKEND} //#endregion';`,
    );

    expect(result).toContain('const after = true;');
  });

  it('should skip exactly one line', () => {
    const source = `
const before = true;

// ${TAON_SKIP_NEXT_LINE_CUT}
const fake = '//#region ${TAGS.BACKEND}';

//#region ${TAGS.BACKEND}
const removeMe = true;
//#endregion

const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain(`const fake = '//#region ${TAGS.BACKEND}';`);

    expect(result).not.toContain('const removeMe = true;');
    expect(result).toContain('const after = true;');
  });

  it('should allow consecutive skip directives', () => {
    const source = `
// ${TAON_SKIP_NEXT_LINE_CUT}
// ${TAON_SKIP_NEXT_LINE_CUT}
const fake = '//#region ${TAGS.BACKEND}';

const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain(`const fake = '//#region ${TAGS.BACKEND}';`);

    expect(result).toContain('const after = true;');
  });

  it('should treat stray endregion as normal text', () => {
    const source = `
const before = true;
//#endregion
const after = true;
`.trim();

    const result = process(source);

    expect(result).toContain('const before = true;');
    expect(result).toContain('//#endregion');
    expect(result).toContain('const after = true;');
  });
});
