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
  lineNumbersEl.innerHTML = '';
  
  for (let i = 1; i <= lines; i++) {
    const lineNum = document.createElement('div');
    lineNum.className = 'line-number';
    lineNum.textContent = i;
    lineNum.onclick = () => selectLine(editor, i - 1, lineNum, numbersId);
    lineNumbersEl.appendChild(lineNum);
  }
}

function selectLine(editor, lineIndex, lineNumElement, numbersId) {
  // Remove previous active states
  const allLineNums = document.querySelectorAll(`#${numbersId} .line-number`);
  allLineNums.forEach(ln => ln.classList.remove('active'));
  
  // Add active to clicked line number
  lineNumElement.classList.add('active');
  
  // Calculate line position in textarea
  const lines = editor.value.split('\n');
  let startPos = 0;
  for (let i = 0; i < lineIndex; i++) {
    startPos += lines[i].length + 1; // +1 for newline
  }
  const endPos = startPos + lines[lineIndex].length;
  
  // Select the line in the textarea
  editor.focus();
  editor.setSelectionRange(startPos, endPos);
  
  // Scroll to the line
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
  editor.scrollTop = lineIndex * lineHeight - editor.clientHeight / 2;
}
