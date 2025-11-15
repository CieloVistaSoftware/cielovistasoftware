import { state } from './state.js';
import { getElements } from './dom.js';

export function switchTab(tab) {
  state.currentTab = tab;
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  
  tabs.forEach(t => {
    if (t.textContent.toLowerCase() === tab) {
      t.classList.add('active');
    }
  });

  // Hide all editor wrappers
  const htmlWrapper = document.getElementById('htmlWrapper');
  const cssWrapper = document.getElementById('cssWrapper');
  const jsWrapper = document.getElementById('jsWrapper');
  
  if (htmlWrapper) htmlWrapper.style.display = 'none';
  if (cssWrapper) cssWrapper.style.display = 'none';
  if (jsWrapper) jsWrapper.style.display = 'none';

  const elements = getElements();
  
  // Show the selected wrapper
  if (tab === 'html' && htmlWrapper) {
    htmlWrapper.style.display = 'flex';
    elements.htmlEditor.style.display = 'block';
    elements.cssEditor.style.display = 'none';
    elements.jsEditor.style.display = 'none';
    updateLineNumbers(elements.htmlEditor, 'lineNumbersHtml');
  } else if (tab === 'css' && cssWrapper) {
    cssWrapper.style.display = 'flex';
    elements.htmlEditor.style.display = 'none';
    elements.cssEditor.style.display = 'block';
    elements.jsEditor.style.display = 'none';
    updateLineNumbers(elements.cssEditor, 'lineNumbersCss');
  } else if (tab === 'js' && jsWrapper) {
    jsWrapper.style.display = 'flex';
    elements.htmlEditor.style.display = 'none';
    elements.cssEditor.style.display = 'none';
    elements.jsEditor.style.display = 'block';
    updateLineNumbers(elements.jsEditor, 'lineNumbersJs');
  }
}

export function updateLineNumbers(editor, numbersId) {
  const lineNumbersEl = document.getElementById(numbersId);
  if (!lineNumbersEl || !editor) return;
  
  const lines = editor.value.split('\n').length;
  const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  lineNumbersEl.textContent = numbers;
}
