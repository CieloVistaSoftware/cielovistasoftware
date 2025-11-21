import { state } from './state.js';
import { getElements } from './dom.js';
import { defaults } from './defaults.js';
import { addToHistory } from './history.js';
import { highlightLine } from './line-highlighter.js';

export function loadFromStorage() {
  const elements = getElements();
  const saved = localStorage.getItem('currentProject');
  
  // Get default project name from the actual folder containing the HTML file
  // For local files: file:///C:/Users/jwpmi/Downloads/CieloVistaSoftware/pro-website-creator/index.html
  // For web: http://example.com/pro-website-creator/index.html
  let defaultName = 'pro-website-creator';
  
  try {
    const fullPath = window.location.href;
    // Extract path from file:// or http:// URL
    const pathMatch = fullPath.match(/[\/\\]([^\/\\]+)[\/\\][^\/\\]+\.html/i);
    if (pathMatch && pathMatch[1]) {
      defaultName = pathMatch[1];
    } else {
      // Fallback: use pathname
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const cleanPath = pathParts.filter(part => !part.endsWith('.html'));
      if (cleanPath.length > 0) {
        defaultName = cleanPath[cleanPath.length - 1];
      }
    }
  } catch (e) {
    console.log('Using default project name');
  }
  
  if (saved) {
    const data = JSON.parse(saved);
    elements.htmlEditor.value = data.html || defaults.html;
    elements.cssEditor.value = data.css || defaults.css;
    elements.jsEditor.value = data.js || defaults.js;
    // Only use saved name if it's not the old default
    if (data.name && data.name !== 'pro-website-creator' && data.name !== 'Untitled Project') {
      elements.projectName.textContent = data.name;
    } else {
      elements.projectName.textContent = defaultName;
    }
    
    // Restore current line positions
    if (data.currentLine) {
      state.currentLine = data.currentLine;
    }
    
    // Restore cursor position after a short delay to ensure editors are ready
    setTimeout(() => {
      restoreCursorPosition('html', data.currentLine?.html || 0);
      restoreCursorPosition('css', data.currentLine?.css || 0);
      restoreCursorPosition('js', data.currentLine?.js || 0);
    }, 100);
  } else {
    elements.htmlEditor.value = defaults.html;
    elements.cssEditor.value = defaults.css;
    elements.jsEditor.value = defaults.js;
    elements.projectName.textContent = defaultName;
    
    // Set to line 1 (index 0) by default
    state.currentLine = { html: 0, css: 0, js: 0 };
    
    // Highlight line 1 on initial load
    setTimeout(() => {
      restoreCursorPosition('html', 0);
      restoreCursorPosition('css', 0);
      restoreCursorPosition('js', 0);
    }, 100);
  }
  
  addToHistory('html');
  addToHistory('css');
  addToHistory('js');
}

function restoreCursorPosition(tab, lineIndex) {
  const elements = getElements();
  let editor, numbersId;
  
  if (tab === 'html') {
    editor = elements.htmlEditor;
    numbersId = 'lineNumbersHtml';
  } else if (tab === 'css') {
    editor = elements.cssEditor;
    numbersId = 'lineNumbersCss';
  } else {
    editor = elements.jsEditor;
    numbersId = 'lineNumbersJs';
  }
  
  if (!editor) return;
  
  // Calculate position for the line
  const lines = editor.value.split('\n');
  const safeLineIndex = Math.min(lineIndex, lines.length - 1);
  
  let startPos = 0;
  for (let i = 0; i < safeLineIndex; i++) {
    startPos += lines[i].length + 1;
  }
  const endPos = startPos + (lines[safeLineIndex]?.length || 0);
  
  // Set cursor position
  editor.setSelectionRange(startPos, endPos);
  
  // Highlight the line number and editor line
  highlightLine(editor, numbersId, safeLineIndex, false);
}

export function saveToStorage() {
  const elements = getElements();
  const data = {
    name: elements.projectName.textContent,
    html: elements.htmlEditor.value,
    css: elements.cssEditor.value,
    js: elements.jsEditor.value,
    currentLine: state.currentLine
  };
  localStorage.setItem('currentProject', JSON.stringify(data));
}
