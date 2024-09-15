declare module "plist" {
    export function build(json: JSON): string;
}

declare interface MapLike<T> {
    [s: string]: T;
}

declare interface TmGrammarRuleName {
    name: string;
}

declare interface TmGrammarRule {
    name?: string;
}
declare interface TmGrammarMatchRule extends TmGrammarRule {
    match: string;
    captures: MapLike<TmGrammarRuleName>;
}
declare interface TmGrammarBeginEndRule extends TmGrammarRule {
    contentName?: string;
    begin: string;
    end: string;
    beginCaptures?: MapLike<TmGrammarRuleName>;
    endCaptures?: MapLike<TmGrammarRuleName>;
    patterns: AnyTmGrammarRule[];
}
declare interface TmGrammarIncludeRule extends TmGrammarRule {
    include: string;
}
declare type AnyTmGrammarRule = TmGrammarMatchRule | TmGrammarBeginEndRule | TmGrammarIncludeRule;
declare interface TmGrammarRepositoryPatterns {
    patterns: AnyTmGrammarRule[];
}
declare type TmGrammarRepositoryRule = AnyTmGrammarRule | TmGrammarRepositoryPatterns;
declare interface TmGrammar extends JSON {
    name: string;
    scopeName: string;
    fileTypes: string[];
    uuid: string;
    variables?: MapLike<string>;
    patterns?: AnyTmGrammarRule[];
    repository: MapLike<TmGrammarRepositoryRule>;
}
