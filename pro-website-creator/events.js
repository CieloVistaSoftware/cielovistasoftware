import { state } from './state.js';
import { getElements } from './dom.js';
import { addToHistory } from './history.js';
import { updatePreview } from './preview.js';
import { saveToStorage } from './storage.js';
import { updateLineNumbers } from './tabs.js';

export function setupEventListeners() {
  const elements = getElements();
  
  elements.htmlEditor.addEventListener('input', () => {
    addToHistory('html');
    updatePreview();
    updateLineNumbers(elements.htmlEditor, 'lineNumbersHtml');
  });
  
  elements.cssEditor.addEventListener('input', () => {
    addToHistory('css');
    updatePreview();
    updateLineNumbers(elements.cssEditor, 'lineNumbersCss');
  });
  
  elements.jsEditor.addEventListener('input', () => {
    addToHistory('js');
    updatePreview();
    updateLineNumbers(elements.jsEditor, 'lineNumbersJs');
  });
  
  // Sync scrolling between line numbers and editor
  elements.htmlEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersHtml'));
  elements.cssEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersCss'));
  elements.jsEditor.addEventListener('scroll', (e) => syncScroll(e.target, 'lineNumbersJs'));
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
