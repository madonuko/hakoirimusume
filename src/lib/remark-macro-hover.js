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
 * Adds a self-executing script that:
 * 1. Finds all .macro-hover-wrapper elements
 * 2. Sets up mouseenter/mouseleave/focus/blur handlers
 * 3. Portals popups to <body> for proper fixed positioning
 * 4. Handles Astro page navigation (View Transitions)
 * 
 * @returns Transformer function for the AST
 */
export function remarkMacroHover() {
  return (tree) => {
    const hoverScript = `<script>
(function() {
  function initMacroPopups() {
    document.querySelectorAll('.macro-hover-wrapper').forEach(function(wrapper) {
      var trigger = wrapper.querySelector('.macro-trigger');
      var popupId = wrapper.getAttribute('data-popup-id');
      var popup = popupId ? document.querySelector('[data-popup-id="' + popupId + '"].macro-popup') : wrapper.querySelector('.macro-popup');
      
      if (!popup || !trigger) return;
      
      // Move popup to body end for fixed positioning
      if (popupId && !popup.hasAttribute('data-portalled')) {
        popup.setAttribute('data-portalled', 'true');
        document.body.appendChild(popup);
      }
      
      var hideTimeout;
      
      function showPopup() {
        clearTimeout(hideTimeout);
        var rect = trigger.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.bottom = (window.innerHeight - rect.top) + 10 + 'px';
        popup.style.transform = 'translateX(-50%)';
        popup.setAttribute('aria-hidden', 'false');
      }
      
      function hidePopup() {
        hideTimeout = setTimeout(function() {
          popup.setAttribute('aria-hidden', 'true');
        }, 300);
      }
      
      trigger.addEventListener('mouseenter', showPopup);
      trigger.addEventListener('mouseleave', hidePopup);
      trigger.addEventListener('focus', showPopup);
      trigger.addEventListener('blur', hidePopup);
      
      // Keep popup open when mouse enters it
      popup.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
      });
      popup.addEventListener('mouseleave', hidePopup);
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMacroPopups);
  } else {
    initMacroPopups();
  }
  document.addEventListener('astro:page-load', initMacroPopups);
})();
</script>`;
    
    tree.children.unshift({
      type: 'html',
      value: hoverScript
    });
  };
}
