import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import plist from "plist";

enum Extension {
    TmLanguage = "tmLanguage",
    YamlTmLanguage = "YAML-tmLanguage",
}

function file(language: string, extension: Extension): string {
    return path.join(
        import.meta.dirname,
        "..",
        "Syntaxes",
        `${language}.${extension}`,
    );
}

function writePlistFile(grammar: TmGrammar, fileName: string) {
    const text = plist.build(grammar);
    fs.writeFileSync(fileName, text);
}

function readYaml(fileName: string) {
    const text = fs.readFileSync(fileName, "utf8");
    return yaml.load(text);
}


function transformGrammarRule(
    rule: TmGrammarRepositoryRule,
    propertyNames: string[],
    transformProperty: (ruleProperty: string) => string,
) {
    for (const propertyName of propertyNames) {
        const value = rule[propertyName];
        if (typeof value === "string") {
            rule[propertyName] = transformProperty(value);
        }
    }

    for (const propertyName in rule) {
        const value = rule[propertyName];
        if (typeof value === "object") {
            transformGrammarRule(value, propertyNames, transformProperty);
        }
    }
}

function transformGrammarRepository(
    grammar: TmGrammar,
    propertyNames: string[],
    transformProperty: (ruleProperty: string) => string,
) {
    const repository = grammar.repository;
    for (const key in repository) {
        transformGrammarRule(repository[key], propertyNames, transformProperty);
    }
}

function getGrammar(
    file: string,
    getVariables: (GrammarVariables: MapLike<string>) => MapLike<string>,
) {
    const grammarBeforeTransformation = readYaml(file) as TmGrammar;
    return updateGrammarVariables(
        grammarBeforeTransformation,
        getVariables(grammarBeforeTransformation.variables as MapLike<string>),
    );
}

function replacePatternVariables(
    pattern: string,
    variableReplacers: VariableReplacer[],
) {
    let result = pattern;
    for (const [variableName, value] of variableReplacers) {
        result = result.replace(variableName, value);
    }
    return result;
}

type VariableReplacer = [RegExp, string];
function updateGrammarVariables(
    grammar: TmGrammar,
    variables: MapLike<string>,
) {
    // biome-ignore lint/performance/noDelete: We don't want the variables in the final grammar
    delete grammar.variables;

    const variableReplacers: VariableReplacer[] = [];
    for (const variableName in variables) {
        // Replace the pattern with earlier variables
        const pattern = replacePatternVariables(
            variables[variableName],
            variableReplacers,
        );
        variableReplacers.push([new RegExp(`{{${variableName}}}`, "gim"), pattern]);
    }
    transformGrammarRepository(grammar, ["begin", "end", "match"], (pattern) =>
        replacePatternVariables(pattern, variableReplacers),
    );
    return grammar;
}

function buildGrammar() {
    // get all YAML-tmLanguage files and create an array of their names without the extension
    const languages = fs
        .readdirSync(path.join(import.meta.dirname, "..", "Syntaxes"))
        .filter((file) => file.endsWith(Extension.YamlTmLanguage))
        .map((file) => path.basename(file, `.${Extension.YamlTmLanguage}`));

    for (const lang of languages) {
        const f = file(lang, Extension.YamlTmLanguage);
        const grammar = getGrammar(f, (grammarVariables) => grammarVariables);
        writePlistFile(grammar, file(lang, Extension.TmLanguage));
    }
}

buildGrammar();
