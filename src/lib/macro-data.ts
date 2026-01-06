/**
 * @fileoverview Macro data as inline script tag for client-side access
 * 
 * Exports `macroDataScript` which wraps the macro JSON data in a `<script>` tag.
 * Makes macro data available via `window.macroData` in the browser.
 */

import macrosData from '../data/macros/macros.json';

/**
 * Inline script tag containing macro JSON data
 * Usage: Insert this into HTML to make macro data available client-side
 */
export const macroDataScript = `
<script>
  window.macroData = ${JSON.stringify(macrosData)};
</script>
`;
