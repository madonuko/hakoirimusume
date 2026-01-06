/**
 * @fileoverview Macro detection utilities for runtime use
 * 
 * Provides functions for detecting macros in text and querying macro data.
 * Used by search components and runtime macro processing.
 */

import macrosData from '../data/macros/macros.json';

export interface MacroData {
  name: string;
  fullName: string;
  category: string;
  tags?: string[];
  description: string;
  details?: string;
  expansion?: string;
  examples?: Array<{ code: string; expansion: string }>;
}

export interface MacroDatabase {
  macros: Record<string, MacroData>;
  categories: string[];
  tags: string[];
}

const macrosDb = macrosData as unknown as MacroDatabase;

/**
 * Represents a detected macro match in text
 */
export interface MacroMatch {
  /** Full matched text including % prefix */
  fullMatch: string;
  /** Macro name (without %) */
  name: string;
  /** Whether macro uses braces %{name} */
  hasBraces: boolean;
  /** Whether macro has colon argument %{name:arg} */
  hasColon: boolean;
  /** Arguments if present */
  args?: string;
  /** Start position in source text */
  start: number;
  /** End position in source text */
  end: number;
}

/**
 * Detects all macros in the given text
 * @param text - Input text to search
 * @returns Array of MacroMatch objects for found macros
 */
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
    const macro = macrosDb.macros[macroKey];

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

/**
 * Gets a macro by name
 * @param name - Macro name (with or without % prefix)
 * @returns Macro data or null if not found
 */
export function getMacroByName(name: string) {
  const key = name.toLowerCase().replace(/^%/, '');
  return macrosDb.macros[key] || null;
}

/**
 * Gets all macro data
 * @returns Object mapping macro names to macro data
 */
export function getAllMacros() {
  return macrosDb.macros;
}

/**
 * Gets macro categories
 * @returns Array of category names
 */
export function getMacroCategories() {
  return macrosDb.categories;
}

/**
 * Gets available macro tags
 * @returns Array of tag strings
 */
export function getMacroTags() {
  return macrosDb.tags;
}

/**
 * Searches macros by name, fullName, description, or category
 * @param query - Search query
 * @returns Array of matching macros with metadata
 */
export function searchMacros(query: string): Array<{name: string; macro: MacroData}> {
  const results: Array<{name: string; macro: MacroData}> = [];
  const lowerQuery = query.toLowerCase();

  for (const [name, macro] of Object.entries(macrosDb.macros)) {
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

/**
 * Gets all macros in a category
 * @param category - Category name
 * @returns Array of macros in that category
 */
export function getMacrosByCategory(category: string) {
  const results: Array<{name: string; macro: MacroData}> = [];

  for (const [name, macro] of Object.entries(macrosDb.macros)) {
    if (macro.category === category) {
      results.push({ name, macro });
    }
  }

  return results;
}

/**
 * Gets all macros with a specific tag
 * @param tag - Tag string (e.g., "🔰")
 * @returns Array of macros with that tag
 */
export function getMacrosByTag(tag: string) {
  const results: Array<{name: string; macro: MacroData}> = [];

  for (const [name, macro] of Object.entries(macrosDb.macros)) {
    if (macro.tags && macro.tags.includes(tag)) {
      results.push({ name, macro });
    }
  }

  return results;
}
