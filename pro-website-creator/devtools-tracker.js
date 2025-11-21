/**
 * DevTools Element Tracker Module
 * Centralized reactive tracking system for DOM elements
 * Automatically detects and reports element inspection to parent window
 * @module devtools-tracker
 */

/**
 * Generate the DevTools tracking script to inject into iframes
 * This creates a reactive tracking system that monitors ALL DOM elements
 * @returns {string} JavaScript code to inject into iframe
 */
export function generateDevToolsTracker() {
  return `
    // Click-based Element Tracking System
    (function() {
      /**
       * Extract element data for transmission
       */
      function extractElementData(element) {
        if (!element || element === document.body || element === document.documentElement) {
          return null;
        }
        
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? '#' + element.id : '';
        const classArray = element.className ? element.className.split(' ').filter(c => c && !c.includes('copilot')) : [];
        const classes = classArray.length > 0 ? '.' + classArray.join('.') : '';
        const selector = tagName + id + classes;
        const textContent = element.textContent ? element.textContent.trim().substring(0, 50) : '';
        
        const outerHTML = element.outerHTML;
        const openTagMatch = outerHTML.match(/<[^>]+>/);
        const openTag = openTagMatch ? openTagMatch[0] : '';
        
        const attributes = {};
        if (element.attributes) {
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            if (!attr.name.includes('copilot')) {
              attributes[attr.name] = attr.value;
            }
          }
        }
        
        const parentTag = element.parentElement ? element.parentElement.tagName.toLowerCase() : '';
        const parentClass = element.parentElement && element.parentElement.className ? 
          element.parentElement.className.split(' ').filter(c => c && !c.includes('copilot'))[0] : '';
        
        return {
          tagName,
          selector,
          textContent,
          outerHTML,
          openTag,
          classList: Array.from(element.classList).filter(c => !c.includes('copilot')),
          attributes,
          parentTag,
          parentClass
        };
      }
      
      /**
       * Send inspection data to parent window
       */
      function sendInspectionData(element) {
        if (!element) return;
        
        const data = extractElementData(element);
        if (data) {
          // Calculate the index of this element among all elements with the same tag
          const tagName = element.tagName;
          const allOfSameTag = document.getElementsByTagName(tagName);
          let elementIndex = 0;
          for (let i = 0; i < allOfSameTag.length; i++) {
            if (allOfSameTag[i] === element) {
              elementIndex = i;
              break;
            }
          }
          
          window.parent.postMessage({
            type: 'devtoolsInspect',
            ...data,
            index: elementIndex
          }, '*');
        }
      }
      
      /**
       * Click-based element tracking
       */
      function setupClickTracking() {
        let isProcessing = false;
        
        // Single click handler on document using event delegation
        document.addEventListener('click', (e) => {
          // Prevent re-entry
          if (isProcessing) return;
          isProcessing = true;
          
          e.stopPropagation(); // Prevent event bubbling
          
          // Get the actual element - if it's a text node or inline element, get the block-level parent
          let targetElement = e.target;
          
          // If it's a text node, get the parent element
          if (targetElement.nodeType === 3) {
            targetElement = targetElement.parentElement;
          }
          
          // For contenteditable elements or if clicked directly on text content,
          // make sure we're getting the actual HTML element (p, div, footer, etc.)
          // not just span or other inline elements that might wrap the text
          while (targetElement && 
                 targetElement !== document.body && 
                 targetElement !== document.documentElement &&
                 (targetElement.tagName === 'SPAN' || 
                  targetElement.tagName === 'STRONG' || 
                  targetElement.tagName === 'EM' ||
                  targetElement.tagName === 'B' ||
                  targetElement.tagName === 'I')) {
            // Move up to parent if we're on an inline element
            if (targetElement.parentElement) {
              targetElement = targetElement.parentElement;
            } else {
              break;
            }
          }
          
          console.log('[CLICK] Element clicked:', targetElement.tagName, targetElement.className);
          
          // Toggle highlight
          if (targetElement.style.outline) {
            targetElement.style.outline = '';
            console.log('[CLICK] Highlight OFF');
          } else {
            targetElement.style.outline = '2px solid #00ff00';
            console.log('[CLICK] Highlight ON');
          }
          
          // Send inspection data to sync with code editor
          sendInspectionData(targetElement);
          
          // Release lock after a brief delay
          setTimeout(() => {
            isProcessing = false;
          }, 100);
        }, true);
        
        console.log('[DevTools] Click handler set up on document');
      }
      
      /**
       * Initialize tracking system
       */
      function init() {
        setupClickTracking();
      }
      
      // Auto-initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  `;
}
