/**
 * @fileoverview Build-time rehype plugin for macro hover transformation
 * 
 * This plugin transforms macro text patterns into hoverable HTML elements
 * during the Astro build process. It operates on the AST level.
 * 
 * Supported patterns:
 * - %name - Simple macro (e.g., %define)
 * - %{name} - Macro with braces (e.g., %{dnl})
 * - %{name:arg} - Macro with argument (e.g., %{expr:1+2})
 * 
 * @see ../README.md for architecture documentation
 */

import { visit } from 'unist-util-visit';
import macrosData from '../data/macros/macros.json';

/**
 * Creates an AST element for a macro hover wrapper
 * @param macroName - Name of the macro (without % prefix)
 * @param macroData - Macro metadata from macros.json
 * @param id - Unique popup ID
 * @param originalText - Original text from source (preserves format)
 * @returns AST element for the hover wrapper
 */
function createMacroElement(macroName, macroData, id, originalText) {
  // Check if we should show expansion
  const showExpansion = macroData.expansion && 
                        macroData.expansion !== 'value' && 
                        macroData.expansion !== 'undefined' &&
                        macroData.expansion !== 'nothing' &&
                        !macroData.parameterized;
  
  const wrapper = {
    type: 'element',
    tagName: 'span',
    properties: {
      className: 'macro-hover-wrapper',
      'data-macro': macroName.toLowerCase(),
      'data-popup-id': id
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
          { type: 'text', value: originalText }
        ]
      },
      {
        type: 'element',
        tagName: 'span',
        properties: {
          className: 'macro-popup',
          role: 'tooltip',
          ariaHidden: 'true',
          'data-popup-id': id
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
                children: [{ type: 'text', value: originalText }]
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
          ...(showExpansion ? [{
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

/**
 * Builds a parent map for AST traversal
 * @param node - Current AST node
 * @param parentMap - Map to populate with parent references
 * @param currentParent - Current parent node
 * @returns The populated parent map
 */
function buildParentMap(node, parentMap = new Map(), currentParent = null) {
  parentMap.set(node, currentParent);
  if (node.children) {
    for (const child of node.children) {
      buildParentMap(child, parentMap, node);
    }
  }
  return parentMap;
}

/**
 * Regex pattern for matching macros:
 * - %{name:arg} - macro with colon argument
 * - %{name} - macro with braces, no argument
 * - %name - macro without braces
 */
const MACRO_PATTERN = /%\{([a-zA-Z_][a-zA-Z0-9_]*)(?::([^}]*))?\}|%([a-zA-Z_][a-zA-Z0-9_]*)(?=\s|$|:)/g;

/**
 * Rehype plugin function
 * Transforms macro text into hoverable HTML elements
 * @returns Transformer function for the AST
 */
export function rehypeMacroHover() {
  return (tree) => {
    const parentMap = buildParentMap(tree);
    let textNodes = 0;
    let macrosFound = 0;
    let popupId = 0;
    
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
            
            // match[1] = name from %{name:param}
            // match[3] = name from %name
            const macroName = match[1] || match[3];
            const macroData = macrosData.macros?.[macroName.toLowerCase()];
            
            if (macroData) {
              const id = 'macro-popup-' + (++popupId);
              newChildren.push(createMacroElement(macroName, macroData, id, match[0]));
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
