/**
 * Split View Module
 * Handles side-by-side editor and preview functionality with synchronized highlighting
 * @module split
 */

import { getElements } from './dom.js';
import { updatePreview } from './preview.js';
import { state } from './state.js';
import { reapplyCurrentTheme } from './themes.js';
import { generateDevToolsTracker } from './devtools-tracker.js';
import { highlightLine, selectLine } from './line-highlighter.js';

/** @type {string} Currently active tab in split view ('html', 'css', or 'js') */
let splitCurrentTab = 'html';

/** @type {boolean} Whether split editors are in edit mode */
let splitEditMode = false;

/**
 * Switch between HTML, CSS, and JS tabs in split view
 * @param {string} tab - The tab to switch to ('html', 'css', or 'js')
 */
export function switchSplitTab(tab) {
  splitCurrentTab = tab;
  const tabs = document.querySelectorAll('.split-tab');
  tabs.forEach(t => t.classList.remove('active'));
  
  tabs.forEach(t => {
    if (t.textContent.toLowerCase() === tab) {
      t.classList.add('active');
    }
  });

  // Hide all split editor wrappers
  const htmlWrapper = document.getElementById('splitHtmlWrapper');
  const cssWrapper = document.getElementById('splitCssWrapper');
  const jsWrapper = document.getElementById('splitJsWrapper');
  
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const splitCssEditor = document.getElementById('splitCssEditor');
  const splitJsEditor = document.getElementById('splitJsEditor');
  
  if (htmlWrapper) htmlWrapper.style.display = 'none';
  if (cssWrapper) cssWrapper.style.display = 'none';
  if (jsWrapper) jsWrapper.style.display = 'none';
  
  // Show the selected wrapper
  if (tab === 'html' && htmlWrapper) {
    htmlWrapper.style.display = 'flex';
    if (splitHtmlEditor) splitHtmlEditor.style.display = 'block';
    if (splitCssEditor) splitCssEditor.style.display = 'none';
    if (splitJsEditor) splitJsEditor.style.display = 'none';
    updateSplitLineNumbers('html');
  } else if (tab === 'css' && cssWrapper) {
    cssWrapper.style.display = 'flex';
    if (splitHtmlEditor) splitHtmlEditor.style.display = 'none';
    if (splitCssEditor) splitCssEditor.style.display = 'block';
    if (splitJsEditor) splitJsEditor.style.display = 'none';
    updateSplitLineNumbers('css');
  } else if (tab === 'js' && jsWrapper) {
    jsWrapper.style.display = 'flex';
    if (splitHtmlEditor) splitHtmlEditor.style.display = 'none';
    if (splitCssEditor) splitCssEditor.style.display = 'none';
    if (splitJsEditor) splitJsEditor.style.display = 'block';
    updateSplitLineNumbers('js');
  }
}

/**
 * Update split view editors with current code from main editors
 * Syncs all three editors and refreshes line numbers
 */
export function updateSplitView() {
  const elements = getElements();
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const splitCssEditor = document.getElementById('splitCssEditor');
  const splitJsEditor = document.getElementById('splitJsEditor');
  
  if (splitHtmlEditor) {
    splitHtmlEditor.value = elements.htmlEditor.value;
    updateSplitLineNumbers('html');
  }
  if (splitCssEditor) {
    splitCssEditor.value = elements.cssEditor.value;
    updateSplitLineNumbers('css');
  }
  if (splitJsEditor) {
    splitJsEditor.value = elements.jsEditor.value;
    updateSplitLineNumbers('js');
  }
  
  // Update the split preview
  updateSplitPreview();
}

/**
 * Update the split preview iframe with current code
 * Injects HTML, CSS, JS and adds message listener for element highlighting
 * @private
 */
function updateSplitPreview() {
  const elements = getElements();
  const splitPreview = document.getElementById('splitPreviewFrame');
  if (!splitPreview) return;
  
  const html = elements.htmlEditor.value;
  const css = elements.cssEditor.value;
  const js = elements.jsEditor.value;
  
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
          
          /* Injected highlighting styles */
          .copilot-highlight-element {
            outline: 3px solid #7ee787 !important;
            outline-offset: 2px;
            background: rgba(126, 231, 135, 0.1) !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 0 20px rgba(126, 231, 135, 0.3) !important;
          }
          
          /* Contenteditable styles */
          [contenteditable="true"] {
            outline: 1px dashed rgba(126, 231, 135, 0.3);
            outline-offset: 2px;
          }
          [contenteditable="true"]:focus {
            outline: 2px solid #7ee787;
          }
        </style>
      </head>
      <body contenteditable="true">
        ${html}
        <script>
          ${js}
          
          // Track current hover outline element
          let currentHoverOutline = null;
          
          // Listen for messages to highlight elements
          window.addEventListener('message', function(e) {
            if (e.data.type === 'highlight') {
              // Remove previous highlights
              document.querySelectorAll('.copilot-highlight-element').forEach(el => {
                el.classList.remove('copilot-highlight-element');
              });
              
              // Add highlight to target element
              if (e.data.selector) {
                try {
                  const elements = document.querySelectorAll(e.data.selector);
                  if (elements.length > 0) {
                    elements[e.data.index || 0].classList.add('copilot-highlight-element');
                    elements[e.data.index || 0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                } catch (err) {
                  console.log('Highlight error:', err);
                }
              }
            } else if (e.data.type === 'showHover') {
              // Show hover outline for mouseover tracking (uses inline styles, not class)
              
              if (currentHoverOutline) {
                currentHoverOutline.style.outline = '';
                currentHoverOutline.style.outlineOffset = '';
                currentHoverOutline = null;
              }
              
              // Only use tag name and index - never use selector as it causes incorrect element targeting
              if (e.data.tagName !== undefined && e.data.index !== undefined) {
                try {
                  const elements = document.getElementsByTagName(e.data.tagName);
                  if (elements.length > e.data.index) {
                    currentHoverOutline = elements[e.data.index];
                    currentHoverOutline.style.outline = '3px dashed #7ee787';
                    currentHoverOutline.style.outlineOffset = '2px';
                    console.log('[Preview] Hover outline applied to:', e.data.tagName, 'index:', e.data.index, 'element:', currentHoverOutline);
                  } else {
                    console.log('[Preview] Index out of bounds:', e.data.index, 'for', elements.length, e.data.tagName, 'elements');
                  }
                } catch (err) {
                  console.log('[Preview] Hover outline error:', err);
                }
              } else {
                console.log('[Preview] Missing tagName or index in showHover message');
              }
            } else if (e.data.type === 'clearHover') {
              // Clear hover outline
              if (currentHoverOutline) {
                currentHoverOutline.style.outline = '';
                currentHoverOutline.style.outlineOffset = '';
                currentHoverOutline = null;
                console.log('[Preview] Hover outline cleared');
              }
            } else if (e.data.type === 'highlightCSS') {
              // Remove previous highlights
              document.querySelectorAll('.copilot-highlight-element').forEach(el => {
                el.classList.remove('copilot-highlight-element');
              });
              
              // Highlight all elements matching CSS selectors
              if (e.data.selectors && Array.isArray(e.data.selectors)) {
                e.data.selectors.forEach(selector => {
                  try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                      el.classList.add('copilot-highlight-element');
                    });
                    // Scroll to first matched element
                    if (elements.length > 0) {
                      elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  } catch (err) {
                    console.log('CSS selector error:', err);
                  }
                });
              }
            }
          });
          
          // Sync changes back to main editor
          let debounceTimer;
          document.body.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              window.parent.postMessage({
                type: 'updateHTML',
                html: document.body.innerHTML
              }, '*');
            }, 300);
          });
          
          // Reactive DevTools tracking for ALL elements
          ${generateDevToolsTracker()}
        <\/script>
      </body>
    </html>
  `;
  
  splitPreview.srcdoc = content;
  
  // Reapply theme after iframe loads
  splitPreview.onload = () => {
    setTimeout(() => {
      reapplyCurrentTheme();
    }, 100);
  };
}

/** @type {boolean} Flag to track if message listener is initialized */
// Track element-to-line mapping reactively
let elementLineMap = new Map();
let lastParsedHTML = '';
let lastHighlightedData = null; // Track last highlighted element to prevent flashing

/**
 * Reactively parse HTML and build element-to-line mapping
 * @param {string} html - HTML code to parse
 * @private
 */
function buildElementLineMap(html) {
  if (html === lastParsedHTML) return; // Skip if HTML hasn't changed
  
  lastParsedHTML = html;
  elementLineMap.clear();
  
  const lines = html.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('<') || line.startsWith('</')) continue;
    
    // Extract tag and attributes
    const match = line.match(/<(\w+)([^>]*)>/);
    if (!match) continue;
    
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    
    // Create unique key based on tag + attributes
    let key = tag;
    
    // Add href for anchor tags
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      key += `[href="${hrefMatch[1]}"]`;
    }
    
    // Add src for images/scripts
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      key += `[src="${srcMatch[1]}"]`;
    }
    
    // Add id
    const idMatch = attrs.match(/id=["']([^"']+)["']/);
    if (idMatch) {
      key += `#${idMatch[1]}`;
    }
    
    // Add classes
    const classMatch = attrs.match(/class=["']([^"']+)["']/);
    if (classMatch) {
      const classes = classMatch[1].split(' ').filter(c => c && !c.includes('copilot'));
      if (classes.length > 0) {
        key += '.' + classes.join('.');
      }
    }
    
    // Store the mapping
    elementLineMap.set(key, i);
  }
}

/**
 * Reactively find line number for an element
 * @param {Object} data - Element data
 * @returns {number} Line index or -1 if not found
 * @private
 */
function findLineReactively(data) {
  const tag = data.tagName.toLowerCase();
  
  // Try with href (for anchor tags)
  if (data.attributes && data.attributes.href) {
    const key = `${tag}[href="${data.attributes.href}"]`;
    if (elementLineMap.has(key)) return elementLineMap.get(key);
  }
  
  // Try with src
  if (data.attributes && data.attributes.src) {
    const key = `${tag}[src="${data.attributes.src}"]`;
    if (elementLineMap.has(key)) return elementLineMap.get(key);
  }
  
  // Try with id
  if (data.selector.includes('#')) {
    const idMatch = data.selector.match(/#([^.]+)/);
    if (idMatch) {
      const key = `${tag}#${idMatch[1]}`;
      if (elementLineMap.has(key)) return elementLineMap.get(key);
    }
  }
  
  // Try with classes
  if (data.classList && data.classList.length > 0) {
    const key = `${tag}.${data.classList.join('.')}`;
    if (elementLineMap.has(key)) return elementLineMap.get(key);
  }
  
  // Try just tag (will match first occurrence)
  if (elementLineMap.has(tag)) return elementLineMap.get(tag);
  
  return -1;
}

let messageListenerInitialized = false;

/**
 * Enable contenteditable mode in split preview and sync changes
 * Allows users to directly edit HTML in the preview pane
 */
export function enableSplitEditMode() {
  // Only add listener once
  if (messageListenerInitialized) return;
  messageListenerInitialized = true;
  
  console.log('[Split] Setting up message listener');
  
  // Listen for messages from split preview iframe
  window.addEventListener('message', function(e) {
    if (e.data.type === 'updateHTML') {
      const elements = getElements();
      if (elements.htmlEditor && e.data.html) {
        elements.htmlEditor.value = e.data.html;
        // Update split editor to reflect changes
        const splitHtmlEditor = document.getElementById('splitHtmlEditor');
        if (splitHtmlEditor) {
          splitHtmlEditor.value = e.data.html;
          updateSplitLineNumbers('html');
        }
      }
    } else if (e.data.type === 'devtoolsInspect') {
      console.log('[Split] Main window received devtoolsInspect:', e.data.tagName, e.data.selector);
      console.log('[Split] Full data:', e.data);
      highlightInspectedElementInCode(e.data);
    } else if (e.data.type === 'devtoolsClearHighlight') {
      console.log('[Split] Main window received devtoolsClearHighlight');
      clearHighlights();
    }
  });
}

/**
 * Toggle edit mode for split view code editors
 * @param {boolean} enabled - Whether to enable or disable edit mode
 */
export function setSplitCodeEditMode(enabled) {
  splitEditMode = enabled;
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const splitCssEditor = document.getElementById('splitCssEditor');
  const splitJsEditor = document.getElementById('splitJsEditor');
  
  [splitHtmlEditor, splitCssEditor, splitJsEditor].forEach(editor => {
    if (!editor) return;
    if (enabled) {
      editor.removeAttribute('readonly');
      editor.style.cursor = 'text';
    } else {
      editor.setAttribute('readonly', 'readonly');
      editor.style.cursor = 'default';
    }
  });
}

/**
 * Clear all highlights in code editor and preview
 * @private
 */
function clearHighlights() {
  // Clear code editor line highlights
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const lineNumbers = document.getElementById('splitLineNumbersHtml');
  
  if (lineNumbers) {
    const allLineNums = lineNumbers.querySelectorAll('.line-number');
    allLineNums.forEach(ln => {
      ln.classList.remove('active');
      ln.style.background = '';
    });
  }
  
  if (splitHtmlEditor) {
    splitHtmlEditor.style.background = '';
  }
  
  // Clear preview outline
  const splitPreview = document.getElementById('splitPreviewFrame');
  if (splitPreview && splitPreview.contentWindow) {
    try {
      splitPreview.contentWindow.postMessage({
        type: 'clearHover'
      }, '*');
    } catch (err) {
      console.log('[Split] Error clearing hover:', err);
    }
  }
  
  // Reset tracking
  lastHighlightedData = null;
}

/**
 * Highlight the inspected element in the code editor
 * @param {Object} data - Element data from DevTools inspection
 * @private
 */
function highlightInspectedElementInCode(data) {
  console.log('[Highlight] ========== NEW SEARCH ==========');
  console.log('[Highlight] Tag:', data.tagName);
  console.log('[Highlight] Text content:', data.textContent);
  console.log('[Highlight] Selector:', data.selector);
  
  // Prevent re-highlighting the same element (stops flashing)
  // Compare tagName, index, AND text content to differentiate between similar elements
  if (lastHighlightedData && 
      lastHighlightedData.tagName === data.tagName &&
      lastHighlightedData.index === data.index &&
      lastHighlightedData.textContent === data.textContent) {
    console.log('[Highlight] Skipping - same element');
    return; // Same element, skip completely
  }
  
  lastHighlightedData = { tagName: data.tagName, index: data.index, textContent: data.textContent };
  
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const lineNumbers = document.getElementById('splitLineNumbersHtml');
  
  if (!splitHtmlEditor || !lineNumbers) {
    console.log('[Highlight] Missing editor or line numbers');
    return;
  }
  
  const code = splitHtmlEditor.value;
  const lines = code.split('\n');
  
  console.log('[Highlight] ========================================');
  console.log('[Highlight] CLICKED ELEMENT:');
  console.log('[Highlight]   tagName:', data.tagName);
  console.log('[Highlight]   textContent:', data.textContent);
  console.log('[Highlight] ========================================');
  
  const tagToFind = '<' + data.tagName.toLowerCase();
  const textToFind = data.textContent ? data.textContent.trim().toLowerCase() : '';
  
  console.log('[Highlight] SEARCHING CODE FOR:');
  console.log('[Highlight]   Tag:', tagToFind);
  console.log('[Highlight]   Text:', textToFind);
  console.log('[Highlight] ========================================');
  
  // Search line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Does this line have the tag?
    if (line.includes(tagToFind)) {
      console.log('[Highlight] Line', i, 'has tag:', lines[i].trim());
      
      // If we have text to match, check if it's on this line or nearby
      if (textToFind) {
        // Check this line and next 5 lines
        for (let j = 0; j <= 5 && i + j < lines.length; j++) {
          console.log('[Highlight]   Checking line', i + j, ':', lines[i + j].trim());
          console.log('[Highlight]   Does it contain "' + textToFind + '"?', lines[i + j].toLowerCase().includes(textToFind));
          
          if (lines[i + j].toLowerCase().includes(textToFind)) {
            console.log('[Highlight] ✓ MATCH! Highlighting line', i + j);
            highlightLine(splitHtmlEditor, 'splitLineNumbersHtml', i + j, true);
            return;
          }
        }
      } else {
        // No text to match, just highlight the tag
        console.log('[Highlight] ✓ MATCH! (no text) Highlighting line', i);
        highlightLine(splitHtmlEditor, 'splitLineNumbersHtml', i, true);
        return;
      }
    }
  }
  
  console.log('[Highlight] ✗ NOT FOUND');
  console.log('[Highlight] ========================================');
  
  const code2 = splitHtmlEditor.value;
  
  buildElementLineMap(code);
  
  let foundLineIndex = findLineReactively(data);
  
  // Fallback to procedural search if reactive lookup fails
  if (foundLineIndex === -1) {
    foundLineIndex = findLineProcedurally(data, code);
    console.log('[Highlight] Procedural found:', foundLineIndex);
  }
  
  // Highlight the found line in CODE and show outline in preview
  if (foundLineIndex !== -1) {
    highlightLine(splitHtmlEditor, 'splitLineNumbersHtml', foundLineIndex, true);
    
    // Show hover outline in preview
    const splitPreview = document.getElementById('splitPreviewFrame');
    if (splitPreview && splitPreview.contentWindow) {
      // Calculate which instance of this tag it is
      const lines = code.split('\n');
      let tagIndex = 0;
      const tagName = data.tagName.toLowerCase();
      
      for (let i = 0; i < foundLineIndex; i++) {
        if (lines[i].toLowerCase().includes('<' + tagName)) {
          tagIndex++;
        }
      }
      
      // Update tracking with calculated index
      lastHighlightedData.index = tagIndex;
      
      try {
        splitPreview.contentWindow.postMessage({
          type: 'showHover',
          tagName: tagName,
          index: tagIndex
        }, '*');
      } catch (err) {
        // Ignore
      }
    }
  } else {
    console.log('[Highlight] NO LINE FOUND for:', data.tagName, data.selector);
  }
}

/**
 * Fallback procedural search when reactive lookup fails
 * @param {Object} data - Element data
 * @param {string} code - HTML code
 * @returns {number} Line index or -1
 * @private
 */
function findLineProcedurally(data, code) {
  const lines = code.split('\n');
  let foundLineIndex = -1;
  let bestMatchScore = 0;
  
  // Strategy 1: Match by tag + href (critical for anchor tags)
  if (data.tagName.toLowerCase() === 'a' && data.attributes && data.attributes.href) {
    const href = data.attributes.href.toLowerCase();
    const tagPattern = '<a';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      // Must have both the tag AND the exact href on the SAME line
      if (line.includes(tagPattern)) {
        const hasExactHref = line.includes('href="' + href + '"') || 
                            line.includes("href='" + href + "'") ||
                            line.includes('href=' + href + '>') ||
                            line.includes('href="' + href + '>') ||
                            line.includes("href='" + href + ">");
        if (hasExactHref) {
          foundLineIndex = i;
          bestMatchScore = 150; // Very high score for exact href match
          break;
        }
      }
    }
  }
  
  // Strategy 2: Match opening tag exactly with all attributes
  if (bestMatchScore < 150 && data.openTag) {
    const normalizedOpenTag = data.openTag.toLowerCase().replace(/\s+/g, ' ').trim();
    // Extract just the tag part (first 50 chars to be safe)
    const openTagSignature = normalizedOpenTag.substring(0, Math.min(50, normalizedOpenTag.length));
    
    for (let i = 0; i < lines.length; i++) {
      const normalizedLine = lines[i].toLowerCase().replace(/\s+/g, ' ').trim();
      // Look for exact match of opening tag
      if (normalizedLine.includes(openTagSignature)) {
        foundLineIndex = i;
        bestMatchScore = 100;
        break;
      }
    }
  }
  
  // Strategy 3: Match by tag + specific attributes with scoring
  if (bestMatchScore < 100) {
    const tagPattern = '<' + data.tagName.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes(tagPattern)) {
        let score = 10;
        
        // High bonus for matching href (for anchor tags)
        if (data.attributes && data.attributes.href) {
          const href = data.attributes.href.toLowerCase();
          if (line.includes('href="' + href) || line.includes("href='" + href)) {
            score += 70;
          }
        }
        
        // High bonus for matching src (for images)
        if (data.attributes && data.attributes.src) {
          const src = data.attributes.src.toLowerCase();
          const srcFile = src.split('/').pop();
          if (line.includes('src="') && line.includes(srcFile)) {
            score += 70;
          }
        }
        
        // Bonus for matching id
        if (data.selector.includes('#')) {
          const idMatch = data.selector.match(/#([^.]+)/);
          if (idMatch && line.includes('id="' + idMatch[1].toLowerCase())) {
            score += 50;
          }
        }
        
        // Bonus for matching classes
        if (data.classList && data.classList.length > 0) {
          data.classList.forEach(cls => {
            if (line.includes(cls.toLowerCase())) {
              score += 20;
            }
          });
        }
        
        // Bonus for matching text content (especially important for anchor tags)
        if (data.textContent && data.textContent.length > 2) {
          const cleanText = data.textContent.substring(0, 50).toLowerCase().trim();
          // Check current line and next few lines for text
          for (let j = 0; j <= 3 && i + j < lines.length; j++) {
            const lineToCheck = lines[i + j].toLowerCase();
            // Look for the text content within the tags
            if (lineToCheck.includes(cleanText)) {
              score += 60; // Increased score for text match
              break;
            }
            // Also check if the whole line content matches
            const lineContent = lines[i + j].replace(/<[^>]*>/g, '').toLowerCase().trim();
            if (lineContent === cleanText || lineContent.includes(cleanText)) {
              score += 60;
              break;
            }
          }
        }
        
        // Bonus for parent context match (helps with nested elements)
        if (data.parentTag && i > 0) {
          const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ').toLowerCase();
          if (prevLines.includes('<' + data.parentTag)) {
            score += 15;
          }
        }
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          foundLineIndex = i;
        }
      }
    }
  }
  
  // Strategy 4: Fuzzy search by tag name only (fallback)
  if (foundLineIndex === -1) {
    const tagPattern = '<' + data.tagName.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(tagPattern)) {
        foundLineIndex = i;
        break;
      }
    }
  }
  
  return foundLineIndex;
}

/**
 * Update line numbers for split view editor
 * @param {string} type - Editor type ('html', 'css', or 'js')
 * @private
 */
function updateSplitLineNumbers(type) {
  const editorId = `split${type.charAt(0).toUpperCase() + type.slice(1)}Editor`;
  const numbersId = `splitLineNumbers${type.charAt(0).toUpperCase() + type.slice(1)}`;
  
  const editor = document.getElementById(editorId);
  const lineNumbersEl = document.getElementById(numbersId);
  
  if (!lineNumbersEl || !editor) return;
  
  const lines = editor.value.split('\n').length;
  lineNumbersEl.innerHTML = '';
  
  for (let i = 1; i <= lines; i++) {
    const lineNum = document.createElement('div');
    lineNum.className = 'line-number';
    lineNum.textContent = i;
    lineNum.onclick = () => selectSplitLine(editor, i - 1, lineNum, numbersId);
    lineNumbersEl.appendChild(lineNum);
  }
}

/**
 * Handle line number click in split view
 * Highlights line, syncs to main editor, and highlights corresponding element/ruleset in preview
 * @param {HTMLTextAreaElement} editor - The textarea editor element
 * @param {number} lineIndex - Zero-based line index
 * @param {HTMLElement} lineNumElement - The clicked line number element
 * @param {string} numbersId - ID of the line numbers container
 * @private
 */
function selectSplitLine(editor, lineIndex, lineNumElement, numbersId) {
  // Remove previous active states
  const allLineNums = document.querySelectorAll(`#${numbersId} .line-number`);
  allLineNums.forEach(ln => ln.classList.remove('active'));
  
  // Select and highlight the line
  selectLine(editor, numbersId, lineIndex, true);
  
  // Highlight in main editor too
  syncToMainEditor(lineIndex);
  
  // Highlight element in preview based on current tab
  const lines = editor.value.split('\n');
  if (splitCurrentTab === 'html') {
    highlightElementInPreview(lines[lineIndex], lineIndex, lines);
  } else if (splitCurrentTab === 'css') {
    highlightCSSRulesetInPreview(lines, lineIndex);
  }
}

/**
 * Synchronize line highlighting to main editor
 * Highlights the same line in main editor and selects it
 * @param {number} lineIndex - Zero-based line index to sync
 * @private
 */
function syncToMainEditor(lineIndex) {
  // Sync the line highlight to the main editor
  const elements = getElements();
  let mainEditor, mainNumbersId;
  
  if (splitCurrentTab === 'html') {
    mainEditor = elements.htmlEditor;
    mainNumbersId = 'lineNumbersHtml';
  } else if (splitCurrentTab === 'css') {
    mainEditor = elements.cssEditor;
    mainNumbersId = 'lineNumbersCss';
  } else {
    mainEditor = elements.jsEditor;
    mainNumbersId = 'lineNumbersJs';
  }
  
  // Highlight the corresponding line number in main editor
  const mainLineNums = document.querySelectorAll(`#${mainNumbersId} .line-number`);
  mainLineNums.forEach((ln, idx) => {
    if (idx === lineIndex) {
      ln.classList.add('active');
    } else {
      ln.classList.remove('active');
    }
  });
  
  // Highlight and select the line in main editor
  selectLine(mainEditor, mainNumbersId, lineIndex, false);
}

/**
 * Highlight HTML element in preview corresponding to clicked line
 * Extracts tag name and index, then sends message to iframe
 * @param {string} lineContent - Content of the clicked line
 * @param {number} lineIndex - Zero-based line index
 * @param {Array<string>} allLines - All lines in the editor
 * @private
 */
function highlightElementInPreview(lineContent, lineIndex, allLines) {
  const splitPreview = document.getElementById('splitPreviewFrame');
  if (!splitPreview || !splitPreview.contentWindow) return;
  
  // Extract tag name from the line
  const tagMatch = lineContent.match(/<(\w+)[\s>]/);
  if (!tagMatch) return;
  
  const tagName = tagMatch[1].toLowerCase();
  
  // Count how many times this tag appears before this line
  let tagIndex = 0;
  for (let i = 0; i < lineIndex; i++) {
    const match = allLines[i].match(new RegExp(`<${tagName}[\\s>]`, 'i'));
    if (match) tagIndex++;
  }
  
  // Send message to iframe to highlight the element
  try {
    splitPreview.contentWindow.postMessage({
      type: 'highlight',
      selector: tagName,
      index: tagIndex
    }, '*');
  } catch (err) {
    console.log('Preview highlight error:', err);
  }
}

/**
 * Highlight elements in preview that match CSS ruleset on clicked line
 * Parses CSS selector from current line or surrounding context
 * @param {Array<string>} lines - All CSS lines
 * @param {number} lineIndex - Zero-based line index of clicked line
 * @private
 */
function highlightCSSRulesetInPreview(lines, lineIndex) {
  const splitPreview = document.getElementById('splitPreviewFrame');
  if (!splitPreview || !splitPreview.contentWindow) return;
  
  // Find the CSS selector for this line
  // Look backwards from current line to find the selector
  let selector = null;
  let searchIndex = lineIndex;
  
  // If current line has opening brace, it's likely the selector line
  if (lines[lineIndex].includes('{')) {
    selector = lines[lineIndex].split('{')[0].trim();
  } else {
    // Search backwards for the selector (line with {)
    while (searchIndex >= 0) {
      const line = lines[searchIndex].trim();
      if (line.includes('{')) {
        selector = line.split('{')[0].trim();
        break;
      }
      // Stop if we hit another closing brace (different ruleset)
      if (line === '}') {
        break;
      }
      searchIndex--;
    }
  }
  
  if (!selector) return;
  
  // Clean up selector (remove comments, extra spaces)
  selector = selector.replace(/\/\*.*?\*\//g, '').trim();
  if (!selector) return;
  
  // Handle multiple selectors (comma-separated)
  const selectors = selector.split(',').map(s => s.trim());
  
  // Send message to iframe to highlight all matching elements
  try {
    splitPreview.contentWindow.postMessage({
      type: 'highlightCSS',
      selectors: selectors
    }, '*');
  } catch (err) {
    console.log('CSS highlight error:', err);
  }
}

/**
 * Setup click event listeners on split view editors
 * Syncs line highlighting with main editor and preview
 */
export function setupSplitSync() {
  const splitHtmlEditor = document.getElementById('splitHtmlEditor');
  const splitCssEditor = document.getElementById('splitCssEditor');
  const splitJsEditor = document.getElementById('splitJsEditor');
  
  [splitHtmlEditor, splitCssEditor, splitJsEditor].forEach(editor => {
    if (!editor) return;
    
    // Add input listener to sync changes back to main editor
    editor.addEventListener('input', () => {
      if (!splitEditMode) return;
      
      const elements = getElements();
      if (editor.id === 'splitHtmlEditor') {
        elements.htmlEditor.value = editor.value;
        updateSplitLineNumbers('html');
        updateSplitPreview();
      } else if (editor.id === 'splitCssEditor') {
        elements.cssEditor.value = editor.value;
        updateSplitLineNumbers('css');
        updateSplitPreview();
      } else if (editor.id === 'splitJsEditor') {
        elements.jsEditor.value = editor.value;
        updateSplitLineNumbers('js');
        updateSplitPreview();
      }
    });
    
    editor.addEventListener('click', () => {
      const cursorPos = editor.selectionStart;
      const textBeforeCursor = editor.value.substring(0, cursorPos);
      const lineIndex = textBeforeCursor.split('\n').length - 1;
      
      // Get the line numbers element for this editor
      let numbersId;
      if (editor.id === 'splitHtmlEditor') numbersId = 'splitLineNumbersHtml';
      else if (editor.id === 'splitCssEditor') numbersId = 'splitLineNumbersCss';
      else numbersId = 'splitLineNumbersJs';
      
      // Highlight the clicked line
      const lineNums = document.querySelectorAll(`#${numbersId} .line-number`);
      lineNums.forEach((ln, idx) => {
        if (idx === lineIndex) {
          ln.classList.add('active');
        } else {
          ln.classList.remove('active');
        }
      });
      
      // Sync to main editor
      syncToMainEditor(lineIndex);
      
      // Highlight element/ruleset in preview based on editor type
      if (editor.id === 'splitHtmlEditor') {
        const lines = editor.value.split('\n');
        highlightElementInPreview(lines[lineIndex], lineIndex, lines);
      } else if (editor.id === 'splitCssEditor') {
        const lines = editor.value.split('\n');
        highlightCSSRulesetInPreview(lines, lineIndex);
      }
    });
  });
}
