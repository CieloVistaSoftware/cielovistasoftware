import { state } from './state.js';
import { getElements } from './dom.js';
import { addToHistory } from './history.js';
import { updatePreview } from './preview.js';
import { saveToStorage } from './storage.js';
import { updateLineNumbers } from './tabs.js';
import { highlightLine, selectLine } from './line-highlighter.js';
import { expandEmmet, wrapInTag, renameTagPair } from './html-shortcuts.js';

// Reactive element-to-line mapping for preview mode
let previewElementLineMap = new Map();
let previewLastParsedHTML = '';

function buildPreviewElementLineMap(html) {
  if (html === previewLastParsedHTML) return;
  previewLastParsedHTML = html;
  previewElementLineMap.clear();
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('<') || line.startsWith('</')) continue;
    const match = line.match(/<(\w+)([^>]*)>/);
    if (!match) continue;
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    let key = tag;
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
    if (hrefMatch) key += `[href="${hrefMatch[1]}"]`;
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (srcMatch) key += `[src="${srcMatch[1]}"]`;
    const idMatch = attrs.match(/id=["']([^"']+)["']/);
    if (idMatch) key += `#${idMatch[1]}`;
    const classMatch = attrs.match(/class=["']([^"']+)["']/);
    if (classMatch) {
      const classes = classMatch[1].split(' ').filter(c => c && !c.includes('copilot'));
      if (classes.length > 0) key += '.' + classes.join('.');
    }
    previewElementLineMap.set(key, i);
  }
}

function findPreviewLineReactively(data) {
  const tag = data.tagName.toLowerCase();
  
  if (data.attributes && data.attributes.href) {
    const key = `${tag}[href="${data.attributes.href}"]`;
    if (previewElementLineMap.has(key)) return previewElementLineMap.get(key);
  }
  if (data.attributes && data.attributes.src) {
    const key = `${tag}[src="${data.attributes.src}"]`;
    if (previewElementLineMap.has(key)) return previewElementLineMap.get(key);
  }
  if (data.selector.includes('#')) {
    const idMatch = data.selector.match(/#([^.]+)/);
    if (idMatch) {
      const key = `${tag}#${idMatch[1]}`;
      if (previewElementLineMap.has(key)) return previewElementLineMap.get(key);
    }
  }
  if (data.classList && data.classList.length > 0) {
    const key = `${tag}.${data.classList.join('.')}`;
    if (previewElementLineMap.has(key)) return previewElementLineMap.get(key);
  }
  if (previewElementLineMap.has(tag)) return previewElementLineMap.get(tag);
  return -1;
}

export function setupEventListeners() {
  const elements = getElements();
  
  // Auto-close tags for HTML editor
  let lastValue = elements.htmlEditor.value;
  
  // Keydown handler for shortcuts
  elements.htmlEditor.addEventListener('keydown', (e) => {
    // Tab for Emmet expansion
    if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const cursorPos = elements.htmlEditor.selectionStart;
      const textBefore = elements.htmlEditor.value.substring(0, cursorPos);
      const lastLine = textBefore.split('\n').pop();
      const abbr = lastLine.trim();
      
      if (abbr) {
        const expanded = expandEmmet(abbr);
        if (expanded) {
          e.preventDefault();
          
          // Remove the abbreviation
          const lineStart = textBefore.lastIndexOf('\n') + 1;
          const beforeLine = elements.htmlEditor.value.substring(0, lineStart);
          const afterCursor = elements.htmlEditor.value.substring(cursorPos);
          
          // Insert expanded HTML
          elements.htmlEditor.value = beforeLine + expanded + afterCursor;
          
          // Position cursor (look for empty tag or between tags)
          const emptyTagMatch = expanded.match(/><\//);
          if (emptyTagMatch) {
            const newPos = beforeLine.length + expanded.indexOf('></') + 1;
            elements.htmlEditor.setSelectionRange(newPos, newPos);
          } else {
            elements.htmlEditor.setSelectionRange(beforeLine.length + expanded.length, beforeLine.length + expanded.length);
          }
          
          // Trigger input event manually
          elements.htmlEditor.dispatchEvent(new Event('input'));
          return;
        }
      }
    }
    
    // Ctrl+Shift+W for wrap selection
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      
      const start = elements.htmlEditor.selectionStart;
      const end = elements.htmlEditor.selectionEnd;
      
      if (start !== end) {
        const selectedText = elements.htmlEditor.value.substring(start, end);
        const tagName = prompt('Enter tag name to wrap selection:');
        
        if (tagName) {
          const wrapped = wrapInTag(selectedText, tagName);
          const beforeSelection = elements.htmlEditor.value.substring(0, start);
          const afterSelection = elements.htmlEditor.value.substring(end);
          
          elements.htmlEditor.value = beforeSelection + wrapped + afterSelection;
          
          // Select the wrapped content
          elements.htmlEditor.setSelectionRange(start, start + wrapped.length);
          elements.htmlEditor.dispatchEvent(new Event('input'));
        }
      }
    }
  });
  
  elements.htmlEditor.addEventListener('input', (e) => {
    const editor = elements.htmlEditor;
    const currentValue = editor.value;
    const cursorPos = editor.selectionStart;
    
    // Tag pair renaming detection
    // Check if cursor is inside an opening tag name (between < and space or >)
    const beforeCursor = currentValue.substring(0, cursorPos);
    const afterCursor = currentValue.substring(cursorPos);
    const tagEditMatch = beforeCursor.match(/<(\w+)$/);
    
    if (tagEditMatch && (afterCursor.match(/^[\s>]/) || afterCursor === '')) {
      // User is editing a tag name, try to rename the pair
      const result = renameTagPair(lastValue, cursorPos - 1, tagEditMatch[1]);
      if (result && result.code !== currentValue) {
        // Apply the rename
        editor.value = result.code;
        editor.setSelectionRange(cursorPos, cursorPos);
        lastValue = result.code;
        addToHistory('html');
        updatePreview();
        updateLineNumbers(elements.htmlEditor, 'lineNumbersHtml');
        updateSplitViewIfActive();
        return;
      }
    }
    
    // Check if user just typed '>'
    if (currentValue.length > lastValue.length && currentValue[cursorPos - 1] === '>') {
      // Look backwards to find the opening tag
      const textBefore = currentValue.substring(0, cursorPos);
      const tagMatch = textBefore.match(/<(\w+)(?:\s[^>]*)?$/);
      
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        
        // Self-closing tags that don't need closing tags
        const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        
        if (!selfClosing.includes(tagName)) {
          // Check if closing tag already exists
          const textAfter = currentValue.substring(cursorPos);
          const closingTag = `</${tagName}>`;
          
          if (!textAfter.startsWith(closingTag)) {
            // Insert closing tag
            const newValue = currentValue.substring(0, cursorPos) + closingTag + currentValue.substring(cursorPos);
            editor.value = newValue;
            editor.setSelectionRange(cursorPos, cursorPos);
          }
        }
      }
    }
    
    lastValue = editor.value;
    
    addToHistory('html');
    updatePreview();
    updateLineNumbers(elements.htmlEditor, 'lineNumbersHtml');
    updateSplitViewIfActive();
  });
  
  elements.cssEditor.addEventListener('input', () => {
    addToHistory('css');
    updatePreview();
    updateLineNumbers(elements.cssEditor, 'lineNumbersCss');
    updateSplitViewIfActive();
  });
  
  elements.jsEditor.addEventListener('input', () => {
    addToHistory('js');
    updatePreview();
    updateLineNumbers(elements.jsEditor, 'lineNumbersJs');
    updateSplitViewIfActive();
  });
  
  // Sync scrolling between line numbers and editor
  elements.htmlEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersHtml'));
  elements.cssEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersCss'));
  elements.jsEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersJs'));
  
  // Click on editor to select line
  elements.htmlEditor.addEventListener('click', (e) => handleEditorClick(e, elements.htmlEditor, 'lineNumbersHtml'));
  elements.cssEditor.addEventListener('click', (e) => handleEditorClick(e, elements.cssEditor, 'lineNumbersCss'));
  elements.jsEditor.addEventListener('click', (e) => handleEditorClick(e, elements.jsEditor, 'lineNumbersJs'));
  
  // Listen for DevTools inspection messages from preview iframe
  window.addEventListener('message', function(e) {
    if (e.data.type === 'devtoolsInspect') {
      highlightInspectedElementInPreview(e.data);
    } else if (e.data.type === 'contentChanged') {
      // Handle content changes from contenteditable elements
      console.log('Content changed:', e.data);
    }
  });
}

/**
 * Highlight the inspected element in the HTML editor (Preview mode)
 * @param {Object} data - Element data from DevTools inspection
 */
function highlightInspectedElementInPreview(data) {
  const elements = getElements();
  const htmlEditor = elements.htmlEditor;
  const lineNumbers = document.getElementById('lineNumbersHtml');
  
  if (!htmlEditor || !lineNumbers) return;
  
  const code = htmlEditor.value;
  buildPreviewElementLineMap(code);
  
  let foundLineIndex = findPreviewLineReactively(data);
  
  if (foundLineIndex !== -1) {
    selectLine(htmlEditor, 'lineNumbersHtml', foundLineIndex, true);
  }
}

function updateSplitViewIfActive() {
  const splitView = document.getElementById('splitView');
  if (splitView && splitView.classList.contains('active')) {
    import('./split.js').then(module => module.updateSplitView());
  }
}

function handleEditorClick(event, editor, numbersId) {
  const cursorPos = editor.selectionStart;
  const textBeforeCursor = editor.value.substring(0, cursorPos);
  const lineIndex = textBeforeCursor.split('\n').length - 1;
  
  // Update current line in state
  if (numbersId === 'lineNumbersHtml') {
    state.currentLine.html = lineIndex;
  } else if (numbersId === 'lineNumbersCss') {
    state.currentLine.css = lineIndex;
  } else if (numbersId === 'lineNumbersJs') {
    state.currentLine.js = lineIndex;
  }
  
  // Highlight the corresponding line number and editor line
  highlightLine(editor, numbersId, lineIndex, false);
  
  // Sync to split view if active
  syncToSplitView(lineIndex, numbersId);
}

function syncToSplitView(lineIndex, mainNumbersId) {
  const splitView = document.getElementById('splitView');
  if (!splitView || !splitView.classList.contains('active')) return;
  
  // Determine which split editor to sync
  let splitNumbersId, splitEditorId;
  if (mainNumbersId === 'lineNumbersHtml') {
    splitNumbersId = 'splitLineNumbersHtml';
    splitEditorId = 'splitHtmlEditor';
  } else if (mainNumbersId === 'lineNumbersCss') {
    splitNumbersId = 'splitLineNumbersCss';
    splitEditorId = 'splitCssEditor';
  } else {
    splitNumbersId = 'splitLineNumbersJs';
    splitEditorId = 'splitJsEditor';
  }
  
  // Highlight the corresponding line in split view
  const splitLineNums = document.querySelectorAll(`#${splitNumbersId} .line-number`);
  splitLineNums.forEach((ln, idx) => {
    if (idx === lineIndex) {
      ln.classList.add('active');
    } else {
      ln.classList.remove('active');
    }
  });
  
  // Highlight the line in the split editor
  const splitEditor = document.getElementById(splitEditorId);
  if (splitEditor) {
    highlightLine(splitEditor, splitNumbersId, lineIndex, false);
  }
}

function syncScroll(editor, numbersId) {
  const lineNumbers = document.getElementById(numbersId);
  if (lineNumbers) {
    lineNumbers.scrollTop = editor.scrollTop;
  }
}

export function startAutoSave() {
  const elements = getElements();
  state.autoSaveInterval = setInterval(() => {
    saveToStorage();
    elements.autoSaveStatus.textContent = '✅ Auto-saved';
  }, 5000);
}
