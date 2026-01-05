import { visit } from 'unist-util-visit';
import macrosData from '../data/macros/macros.json';

export function remarkMacroHover() {
  return (tree) => {
    const hoverScript = `<script>
document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.macro-hover-wrapper').forEach(function(w){var t=w.querySelector('.macro-trigger'),p=w.querySelector('.macro-popup');if(t&&p){t.addEventListener('mouseenter',function(){p.setAttribute('aria-hidden','false')});t.addEventListener('mouseleave',function(){p.setAttribute('aria-hidden','true')});t.addEventListener('focus',function(){p.setAttribute('aria-hidden','false')});t.addEventListener('blur',function(){p.setAttribute('aria-hidden','true')})}})});
document.addEventListener('astro:page-load',function(){document.querySelectorAll('.macro-hover-wrapper').forEach(function(w){var t=w.querySelector('.macro-trigger'),p=w.querySelector('.macro-popup');if(t&&p){t.addEventListener('mouseenter',function(){p.setAttribute('aria-hidden','false')});t.addEventListener('mouseleave',function(){p.setAttribute('aria-hidden','true')});t.addEventListener('focus',function(){p.setAttribute('aria-hidden','false')});t.addEventListener('blur',function(){p.setAttribute('aria-hidden','true')})}})});
</script>`;
    
    tree.children.unshift({
      type: 'html',
      value: hoverScript
    });
  };
}
