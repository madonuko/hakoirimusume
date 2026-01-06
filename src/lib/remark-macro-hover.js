/**
 * @fileoverview Remark plugin for injecting popup interaction JavaScript
 * 
 * This plugin injects client-side JavaScript that handles popup show/hide
 * behavior for macro hover elements. It runs at build time and adds
 * the script to each MDX page.
 * 
 * @see ../README.md for architecture documentation
 */

/**
 * Remark plugin that injects popup interaction JavaScript
 * 
 * Injects an inline script that loads the external macro-hover.js module.
 * Uses raw HTML injection to ensure the script tag is properly rendered.
 * 
 * @returns Transformer function for the AST
 */
export function remarkMacroHover() {
  return (tree) => {
    const loadScript = `<script>
(function() {
  if (window._macroHoverLoaded) return;
  window._macroHoverLoaded = true;
  var s = document.createElement('script');
  s.type = 'module';
  s.src = '/macro-hover.js';
  document.head.appendChild(s);
})();
</script>`;

    tree.children.unshift({
      type: 'html',
      value: loadScript
    });
  };
}
