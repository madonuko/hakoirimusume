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
 * 1. Builds popup DOM from JSON data stored in script tag
 * 2. Portals all popups to <body> immediately on page load
 * 3. Sets up mouseenter/mouseleave/focus/blur handlers
 * 4. Handles Astro page navigation (View Transitions)
 * 
 * @returns Transformer function for the AST
 */
export function remarkMacroHover() {
  return (tree) => {
    const hoverScript = `<script>
(function() {
  function buildPopup(data) {
    var popup = document.createElement('div');
    popup.className = 'macro-popup-clone';
    popup.style.cssText = 'position:absolute;display:none;visibility:hidden;z-index:9999;background-color:#1e1e2e!important;border:1px solid #45475a;border-radius:0.5rem;padding:0.75rem;min-width:280px;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.5);text-align:left;flex-direction:column;gap:0.5rem';
    
    var header = document.createElement('div');
    header.className = 'popup-header-clone';
    header.style.cssText = 'display:none;padding-bottom:0.5rem;border-bottom:1px solid #45475a';
    
    var title = document.createElement('code');
    title.className = 'popup-title-clone';
    title.style.cssText = 'display:none;color:#cba6f7;font-weight:700;font-size:0.9rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace';
    title.textContent = data.name;
    header.appendChild(title);
    
    if (data.tags && data.tags.length > 0) {
      var tags = document.createElement('span');
      tags.className = 'popup-tags-clone';
      tags.style.cssText = 'display:none;flex-wrap:wrap;gap:0.25rem;margin-left:0.5rem';
      data.tags.forEach(function(tag) {
        var t = document.createElement('span');
        t.className = 'tag-clone';
        t.style.cssText = 'font-size:0.7rem;padding:0.125rem 0.375rem;border-radius:9999px;background:#313244;color:#a6adc8';
        t.textContent = tag;
        tags.appendChild(t);
      });
      header.appendChild(tags);
    }
    popup.appendChild(header);
    
    var desc = document.createElement('div');
    desc.className = 'popup-description-clone';
    desc.style.cssText = 'display:none;color:#cdd6f4;font-size:0.85rem;line-height:1.5';
    desc.textContent = data.description;
    popup.appendChild(desc);
    
    if (data.expansion) {
      var expansion = document.createElement('div');
      expansion.className = 'popup-expansion-clone';
      expansion.style.cssText = 'display:none;background-color:#181825;padding:0.5rem;border-radius:0.25rem';
      
      var expLabel = document.createElement('span');
      expLabel.style.cssText = 'display:block;font-size:0.7rem;color:#6c7086;margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.05em';
      expLabel.textContent = 'Expands to:';
      expansion.appendChild(expLabel);
      
      var expCode = document.createElement('span');
      expCode.className = 'expansion-code';
      expCode.style.cssText = 'display:block;color:#a6e3a1;font-size:0.8rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;word-break:break-all';
      expCode.textContent = data.expansion;
      expansion.appendChild(expCode);
      
      popup.appendChild(expansion);
    }
    
    var link = document.createElement('a');
    link.className = 'popup-link-clone';
    link.style.cssText = 'display:none;color:#89b4fa;text-decoration:none;font-size:0.85rem;font-weight:500';
    link.href = data.link;
    link.textContent = 'View full documentation →';
    popup.appendChild(link);
    
    return popup;
  }
  
  function portalAllPopups() {
    var popupDataScript = document.getElementById('macro-popup-data');
    if (!popupDataScript) return;
    
    var popupData;
    try {
      popupData = JSON.parse(popupDataScript.textContent);
    } catch (e) {
      console.error('[macro-hover] Failed to parse popup data:', e);
      return;
    }
    
    Object.keys(popupData).forEach(function(popupId) {
      if (document.querySelector('[data-original-popup-id="' + popupId + '"]')) return;
      
      var popup = buildPopup(popupData[popupId]);
      popup.setAttribute('data-original-popup-id', popupId);
      document.body.appendChild(popup);
    });
  }
  
  function initMacroPopups() {
    portalAllPopups();
    
    document.querySelectorAll('.macro-hover-wrapper').forEach(function(wrapper) {
      var trigger = wrapper.querySelector('.macro-trigger');
      var popupId = wrapper.getAttribute('data-popup-id');
      if (!popupId || !trigger) return;
      
      var portalledPopup = document.querySelector('[data-original-popup-id="' + popupId + '"]');
      if (!portalledPopup) return;
      
      var hideTimeout;
      
      function showPopup() {
        clearTimeout(hideTimeout);
        var rect = trigger.getBoundingClientRect();
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        portalledPopup.style.left = (rect.left + rect.width / 2 + scrollLeft) + 'px';
        portalledPopup.style.top = (rect.top + scrollTop - 10) + 'px';
        portalledPopup.style.transform = 'translateX(-50%) translateY(-100%)';
        portalledPopup.style.display = 'flex';
        portalledPopup.style.visibility = 'visible';
        
        var items = portalledPopup.querySelectorAll('[class$="-clone"]');
        for (var i = 0; i < items.length; i++) {
          items[i].style.display = '';
        }
      }
      
      function hidePopup() {
        hideTimeout = setTimeout(function() {
          portalledPopup.style.display = 'none';
          portalledPopup.style.visibility = 'hidden';
          
          var items = portalledPopup.querySelectorAll('[class$="-clone"]');
          for (var i = 0; i < items.length; i++) {
            items[i].style.display = 'none';
          }
        }, 300);
      }
      
      trigger.addEventListener('mouseenter', showPopup);
      trigger.addEventListener('mouseleave', hidePopup);
      trigger.addEventListener('focus', showPopup);
      trigger.addEventListener('blur', hidePopup);
      
      portalledPopup.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
      });
      portalledPopup.addEventListener('mouseleave', hidePopup);
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
