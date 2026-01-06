/**
 * @fileoverview Deprecated remark plugin for macro detection
 * 
 * This module was originally intended for MDX-based macro detection,
 * but the client-side approach proved more reliable. The plugin
 * is kept for reference and potential future use.
 * 
 * @deprecated Use client-side JavaScript or rehype-macro-hover.js instead
 */

import type { Plugin } from 'unified';

const MACRO_PATTERN = /%([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * Remark plugin for macro detection (deprecated)
 * 
 * This plugin was intended to add metadata about macros during MDX parsing.
 * Currently does nothing - client-side JavaScript handles detection.
 * 
 * @returns Empty plugin transformer
 * @deprecated
 */
export function remarkMacroDetection(): Plugin {
  return () => {
    return (tree) => {
      // This plugin now does nothing - we'll use client-side JavaScript instead
      // to avoid MDX parsing issues
    };
  };
}
