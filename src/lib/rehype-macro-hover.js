import { visit } from 'unist-util-visit';
import macrosData from '../data/macros/macros.json';

function createMacroElement(macroName, macroData) {
  const wrapper = {
    type: 'element',
    tagName: 'span',
    properties: {
      className: 'macro-hover-wrapper',
      'data-macro': macroName.toLowerCase()
    },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: {
          className: 'macro-trigger',
          tabIndex: '0',
          role: 'button',
          ariaLabel: 'View ' + macroData.fullName + ' documentation'
        },
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: { className: 'macro-code' },
            children: [{ type: 'text', value: macroData.fullName }]
          }
        ]
      },
      {
        type: 'element',
        tagName: 'span',
        properties: {
          className: 'macro-popup',
          role: 'tooltip',
          ariaHidden: 'true'
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: 'popup-header' },
            children: [
              {
                type: 'element',
                tagName: 'code',
                properties: { className: 'popup-title' },
                children: [{ type: 'text', value: macroData.fullName }]
              },
              ...(macroData.tags && macroData.tags.length > 0 ? [{
                type: 'element',
                tagName: 'span',
                properties: { className: 'popup-tags' },
                children: macroData.tags.map(tag => ({
                  type: 'element',
                  tagName: 'span',
                  properties: { className: 'tag' },
                  children: [{ type: 'text', value: tag }]
                }))
              }] : [])
            ]
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: 'popup-description' },
            children: [{ type: 'text', value: macroData.description }]
          },
          ...(macroData.expansion ? [{
            type: 'element',
            tagName: 'div',
            properties: { className: 'popup-expansion' },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: { className: 'expansion-label' },
                children: [{ type: 'text', value: 'Expands to:' }]
              },
              {
                type: 'element',
                tagName: 'code',
                properties: { className: 'expansion-code' },
                children: [{ type: 'text', value: macroData.expansion }]
              }
            ]
          }] : []),
          {
            type: 'element',
            tagName: 'a',
            properties: {
              className: 'popup-link',
              href: '/reference/macros/#' + macroName.toLowerCase()
            },
            children: [{ type: 'text', value: 'View full documentation →' }]
          }
        ]
      }
    ]
  };
  
  return wrapper;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function buildParentMap(node, parentMap = new Map(), currentParent = null) {
  parentMap.set(node, currentParent);
  if (node.children) {
    for (const child of node.children) {
      buildParentMap(child, parentMap, node);
    }
  }
  return parentMap;
}

const MACRO_PATTERN = /%([a-zA-Z_][a-zA-Z0-9_]*)(?:\{\/?([^}]*?)\/?\}|(?=\s|$|:))/g;

export function rehypeMacroHover() {
  return (tree) => {
    const parentMap = buildParentMap(tree);
    let textNodes = 0;
    let macrosFound = 0;
    
    visit(tree, 'text', (node, index, parent) => {
      textNodes++;
      if (!parent || parent.type === 'element') {
        // Check if inside heading by traversing parent chain
        let currentParent = parentMap.get(node);
        let insideHeading = false;
        let depth = 0;
        while (currentParent && currentParent.type === 'element' && depth < 10) {
          if (HEADING_TAGS.includes(currentParent.tagName)) {
            insideHeading = true;
            break;
          }
          currentParent = parentMap.get(currentParent);
          depth++;
        }
        
        if (insideHeading) {
          return;
        }
        
        const text = node.value;
        const matches = Array.from(text.matchAll(MACRO_PATTERN));
        
        if (matches.length > 0) {
          macrosFound += matches.length;
          const newChildren = [];
          let lastEnd = 0;
          
          for (const match of matches) {
            if (match.index > lastEnd) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastEnd, match.index)
              });
            }
            
            const macroName = match[1];
            const macroData = macrosData.macros?.[macroName.toLowerCase()];
            
            if (macroData) {
              newChildren.push(createMacroElement(macroName, macroData));
            } else {
              newChildren.push({ type: 'text', value: match[0] });
            }
            
            lastEnd = match.index + match[0].length;
          }
          
          if (lastEnd < text.length) {
            newChildren.push({
              type: 'text',
              value: text.slice(lastEnd)
            });
          }
          
          parent.children.splice(index, 1, ...newChildren);
        }
      }
    });
    
    console.log('[rehype-macro-hover] Text nodes:', textNodes, 'Macros found:', macrosFound);
  };
}
