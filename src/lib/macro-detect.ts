import macrosData from '../data/macros/macros.json';

export interface MacroMatch {
  fullMatch: string;
  name: string;
  hasBraces: boolean;
  hasColon: boolean;
  args?: string;
  start: number;
  end: number;
}

export function detectMacros(text: string): MacroMatch[] {
  const matches: MacroMatch[] = [];
  const macroPattern = /%(\??!?)(?!_$)([a-zA-Z_][a-zA-Z0-9_]*)(?:(?:\{([^}]*)\})|())(?::([^}\s]+))?(\s|$)/g;

  let match;
  while ((match = macroPattern.exec(text)) !== null) {
    const [, prefixes, name, braceContent, empty, colonArg, trailing] = match;

    const hasBraces = !!braceContent;
    const hasColon = !!colonArg;
    const args = colonArg || braceContent;

    const macroKey = name.toLowerCase();
    const macro = macrosData.macros[macroKey];

    if (macro) {
      matches.push({
        fullMatch: match[0],
        name: macroKey,
        hasBraces,
        hasColon,
        args,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  return matches;
}

export function getMacroByName(name: string) {
  const key = name.toLowerCase().replace(/^%/, '');
  return macrosData.macros[key] || null;
}

export function getAllMacros() {
  return macrosData.macros;
}

export function getMacroCategories() {
  return macrosData.categories;
}

export function getMacroTags() {
  return macrosData.tags;
}

export function searchMacros(query: string): Array<{name: string; macro: typeof macrosData.macros[string]}> {
  const results: Array<{name: string; macro: typeof macrosData.macros[string]}> = [];
  const lowerQuery = query.toLowerCase();

  for (const [name, macro] of Object.entries(macrosData.macros)) {
    if (
      name.includes(lowerQuery) ||
      macro.fullName.toLowerCase().includes(lowerQuery) ||
      macro.description.toLowerCase().includes(lowerQuery) ||
      macro.category.toLowerCase().includes(lowerQuery)
    ) {
      results.push({ name, macro });
    }
  }

  return results;
}

export function getMacrosByCategory(category: string) {
  const results: Array<{name: string; macro: typeof macrosData.macros[string]}> = [];

  for (const [name, macro] of Object.entries(macrosData.macros)) {
    if (macro.category === category) {
      results.push({ name, macro });
    }
  }

  return results;
}

export function getMacrosByTag(tag: string) {
  const results: Array<{name: string; macro: typeof macrosData.macros[string]}> = [];

  for (const [name, macro] of Object.entries(macrosData.macros)) {
    if (macro.tags && macro.tags.includes(tag)) {
      results.push({ name, macro });
    }
  }

  return results;
}
