import type { Plugin } from 'unified';

const MACRO_PATTERN = /%([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function remarkMacroDetection(): Plugin {
  return () => {
    return (tree) => {
      // This plugin now does nothing - we'll use client-side JavaScript instead
      // to avoid MDX parsing issues
    };
  };
}
