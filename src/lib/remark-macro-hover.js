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
      
      function showPopup() {
        var rect = trigger.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.bottom = (window.innerHeight - rect.top) + 10 + 'px';
        popup.style.transform = 'translateX(-50%)';
        popup.setAttribute('aria-hidden', 'false');
      }
      
      function hidePopup() {
        popup.setAttribute('aria-hidden', 'true');
      }
      
      trigger.addEventListener('mouseenter', showPopup);
      trigger.addEventListener('mouseleave', hidePopup);
      trigger.addEventListener('focus', showPopup);
      trigger.addEventListener('blur', hidePopup);
      
      // Also hide when mouse leaves popup
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
