# Changelog

## 0.0.3

- Added this changelog.
- Converted `yaml-tmlanguage` grammar to be injected into `source.yaml` instead of being standalone, so any YAML features (like symbols) will work.
- Renamed `ore` to `oniregexp` for consistency.
- Added a `scripts` directory to allow for converting the `yaml-tmlanguage` grammars to XML. The `build.ts` script is adapted from the `@microsoft/TypeScript-TmLanguage` repository.

## initial release

- Ported `yaml-tmlanguage` grammar from Sublime Text to Visual Studio Code.
