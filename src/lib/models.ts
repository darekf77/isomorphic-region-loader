export const labelReplacementCode = {
  browserCode: '/* */', // '/* browser code */',
  backendCode: '/* */', // '/* backend code */',
  notForNpmCode: '/* */', //'/* not for npm lib code */',
  onlyForGithubDocs: '/* */', // '/* only for github docs */',
  flatenImportExportRequred: '/* */', // '/* only for github docs */',
};

export type ReplacementString =
  | '@backend'
  | '@backendFunc'
  | '@cutCodeIfTrue'
  | '@cutCodeIfFalse'
  | '@notForNpm';
export const ReplacementStringArr = [
  '@bac' + 'kend',
  '@bac' + 'kendFunc',
  '@cut' + 'CodeIfTrue',
  '@cut' + 'CodeIfFalse',
  "@not'+'ForNpm",
] as ReplacementString[];

export type Replacement<EnvConfig = any> =
  | ReplacementString
  | [ReplacementString, string]
  | [ReplacementString, (expression: any, env: EnvConfig) => () => boolean];

export interface ReplaceOptionsExtended<EnvConfig = any> {
  replacements: Replacement[];
  env?: EnvConfig;
}
