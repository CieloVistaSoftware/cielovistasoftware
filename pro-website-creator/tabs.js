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

  // Show/hide context-aware UI elements
  updateContextUI(tab);
  
  // Ensure Edit button is active when switching tabs (we're in edit mode)
  ensureEditModeActive();

  // Hide all editor wrappers
  const htmlWrapper = document.getElementById('htmlWrapper');
  const cssWrapper = document.getElementById('cssWrapper');
  const jsWrapper = document.getElementById('jsWrapper');
  
  if (htmlWrapper) htmlWrapper.style.display = 'none';
  if (cssWrapper) cssWrapper.style.display = 'none';
  if (jsWrapper) jsWrapper.style.display = 'none';

  const elements = getElements();
  
  // Format code before switching
  formatCurrentTab(tab, elements);
  
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

function formatCurrentTab(tab, elements) {
  let editor, code;
  
  if (tab === 'html') {
    editor = elements.htmlEditor;
    code = editor.value.trim();
    if (!code) return;
    
    if (typeof prettier !== 'undefined') {
      try {
        editor.value = prettier.format(code, {
          parser: 'html',
          plugins: prettierPlugins,
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          htmlWhitespaceSensitivity: 'css'
        });
      } catch (e) {
        // Silent fail - keep original code
      }
    }
  } else if (tab === 'css') {
    editor = elements.cssEditor;
    code = editor.value.trim();
    if (!code) return;
    
    if (typeof prettier !== 'undefined') {
      try {
        editor.value = prettier.format(code, {
          parser: 'css',
          plugins: prettierPlugins,
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          singleQuote: false
        });
      } catch (e) {
        // Silent fail - keep original code
      }
    }
  } else if (tab === 'js') {
    editor = elements.jsEditor;
    code = editor.value.trim();
    if (!code) return;
    
    if (typeof prettier !== 'undefined') {
      try {
        editor.value = prettier.format(code, {
          parser: 'babel',
          plugins: prettierPlugins,
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true
        });
      } catch (e) {
        // Silent fail - keep original code
      }
    }
  }
}

function ensureEditModeActive() {
  // Only activate edit button if we're not in preview or split view
  const editorSection = document.getElementById('editorSection');
  const previewSection = document.getElementById('previewSection');
  const splitView = document.getElementById('splitView');
  
  const isPreviewActive = previewSection && previewSection.classList.contains('active');
  const isSplitActive = splitView && splitView.classList.contains('active');
  
  if (!isPreviewActive && !isSplitActive) {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('edit-mode');
      if (btn.textContent.includes('Edit')) {
        btn.classList.add('active');
        btn.classList.add('edit-mode');
      }
    });
  }
}

function updateContextUI(tab) {
  // Show/hide HTML toolbar based on active tab
  const htmlToolbar = document.getElementById('htmlToolbar');
  if (htmlToolbar) {
    htmlToolbar.style.display = tab === 'html' ? 'flex' : 'none';
  }

  // Show/hide snippets button based on tab
  const snippetsBtn = document.getElementById('snippetsBtn');
  if (snippetsBtn) {
    snippetsBtn.style.display = tab === 'html' ? 'inline-block' : 'none';
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

export function selectLine(editor, lineIndex, lineNumElement, numbersId) {
  // Update current line in state
  if (numbersId === 'lineNumbersHtml') {
    state.currentLine.html = lineIndex;
  } else if (numbersId === 'lineNumbersCss') {
    state.currentLine.css = lineIndex;
  } else if (numbersId === 'lineNumbersJs') {
    state.currentLine.js = lineIndex;
  }
  
  // Remove previous active states
  const allLineNums = document.querySelectorAll(`#${numbersId} .line-number`);
  allLineNums.forEach(ln => ln.classList.remove('active'));
  
  // Add active to clicked line number and highlight the line
  selectLine(editor, numbersId, lineIndex, true);
}
