/**
 * Line Highlighter Module
 * Centralized system for highlighting both line numbers and code lines
 * @module line-highlighter
 */

/**
 * Highlight a specific line in both the line numbers and the editor
 * @param {HTMLTextAreaElement} editor - The editor textarea element
 * @param {string} lineNumbersId - The ID of the line numbers container
 * @param {number} lineIndex - Zero-based line index to highlight
 * @param {boolean} scrollToLine - Whether to scroll the line into view (default: true)
 */
export function highlightLine(editor, lineNumbersId, lineIndex, scrollToLine = true) {
  if (!editor || !lineNumbersId || lineIndex < 0) return;
  
  // Update line numbers
  const lineNumbers = document.querySelectorAll(`#${lineNumbersId} .line-number`);
  lineNumbers.forEach((ln, idx) => {
    if (idx === lineIndex) {
      ln.classList.add('active');
      if (scrollToLine) {
        ln.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      ln.classList.remove('active');
    }
  });
  
  // Highlight the line in the editor
  editor.classList.add('line-highlighted');
  editor.style.setProperty('--highlight-line', lineIndex);
  
  // Scroll the textarea to the highlighted line
  if (scrollToLine) {
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
    const targetScrollTop = (lineIndex * lineHeight) - (editor.clientHeight / 2) + (lineHeight / 2);
    editor.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  }
  
  return lineIndex;
}

/**
 * Select and highlight a line in the editor
 * @param {HTMLTextAreaElement} editor - The editor textarea element
 * @param {string} lineNumbersId - The ID of the line numbers container
 * @param {number} lineIndex - Zero-based line index to select
 * @param {boolean} focusEditor - Whether to focus the editor (default: true)
 * @returns {Object} Object with startPos and endPos of the selection
 */
export function selectLine(editor, lineNumbersId, lineIndex, focusEditor = true) {
  highlightLine(editor, lineNumbersId, lineIndex, true);
  
  // Calculate line position in textarea
  const lines = editor.value.split('\n');
  let startPos = 0;
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    startPos += lines[i].length + 1; // +1 for newline
  }
  const endPos = startPos + (lines[lineIndex]?.length || 0);
  
  // Select the line in the textarea
  if (focusEditor) {
    editor.focus();
  }
  editor.setSelectionRange(startPos, endPos);
  
  // Scroll to the line
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
  editor.scrollTop = lineIndex * lineHeight - editor.clientHeight / 2;
  
  return { startPos, endPos };
}

/**
 * Clear all line highlights from an editor
 * @param {HTMLTextAreaElement} editor - The editor textarea element
 * @param {string} lineNumbersId - The ID of the line numbers container
 */
export function clearHighlights(editor, lineNumbersId) {
  if (!editor || !lineNumbersId) return;
  
  const lineNumbers = document.querySelectorAll(`#${lineNumbersId} .line-number`);
  lineNumbers.forEach(ln => ln.classList.remove('active'));
  
  editor.classList.remove('line-highlighted');
  editor.style.removeProperty('--highlight-line');
}
