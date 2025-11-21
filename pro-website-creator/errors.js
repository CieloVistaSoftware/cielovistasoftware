import { getElements } from './dom.js';
import { state } from './state.js';

let errorCheckInterval = null;

export function startErrorMonitoring() {
  // Check for errors every 2 seconds
  errorCheckInterval = setInterval(checkForErrors, 2000);
  
  // Also check immediately
  checkForErrors();
}

export function stopErrorMonitoring() {
  if (errorCheckInterval) {
    clearInterval(errorCheckInterval);
  }
}

function checkForErrors() {
  const elements = getElements();
  const errors = [];
  
  // Check HTML errors
  const htmlErrors = validateHTML(elements.htmlEditor.value);
  errors.push(...htmlErrors.map(e => ({ ...e, type: 'HTML' })));
  
  // Check CSS errors
  const cssErrors = validateCSS(elements.cssEditor.value);
  errors.push(...cssErrors.map(e => ({ ...e, type: 'CSS' })));
  
  // Check JavaScript errors
  const jsErrors = validateJS(elements.jsEditor.value);
  errors.push(...jsErrors.map(e => ({ ...e, type: 'JavaScript' })));
  
  // Check for preview iframe errors
  const iframeErrors = getIframeErrors();
  errors.push(...iframeErrors);
  
  updateErrorDisplay(errors);
}

function validateHTML(html) {
  const errors = [];
  
  // Check for unclosed tags
  const openTags = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match;
  let lineNum = 1;
  let lastIndex = 0;
  
  while ((match = tagRegex.exec(html)) !== null) {
    // Count line number
    const textBefore = html.substring(lastIndex, match.index);
    lineNum += (textBefore.match(/\n/g) || []).length;
    lastIndex = match.index;
    
    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'].includes(tag);
    
    if (isSelfClosing) continue;
    
    if (isClosing) {
      const lastOpen = openTags[openTags.length - 1];
      if (!lastOpen || lastOpen.tag !== tag) {
        errors.push({
          message: `Unexpected closing tag </${tag}>`,
          line: lineNum,
          severity: 'error'
        });
      } else {
        openTags.pop();
      }
    } else {
      openTags.push({ tag, line: lineNum });
    }
  }
  
  // Check for unclosed tags
  openTags.forEach(unclosed => {
    errors.push({
      message: `Unclosed tag <${unclosed.tag}>`,
      line: unclosed.line,
      severity: 'warning'
    });
  });
  
  return errors;
}

function validateCSS(css) {
  const errors = [];
  let braceCount = 0;
  let lineNum = 1;
  
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '\n') lineNum++;
    if (css[i] === '{') braceCount++;
    if (css[i] === '}') braceCount--;
    
    if (braceCount < 0) {
      errors.push({
        message: 'Unexpected closing brace }',
        line: lineNum,
        severity: 'error'
      });
      braceCount = 0; // Reset to continue checking
    }
  }
  
  if (braceCount > 0) {
    errors.push({
      message: `${braceCount} unclosed brace(s) {`,
      line: lineNum,
      severity: 'error'
    });
  }
  
  return errors;
}

function validateJS(js) {
  const errors = [];
  
  try {
    // Try to parse as JavaScript
    new Function(js);
  } catch (e) {
    // Extract line number from error message if available
    const lineMatch = e.message.match(/line (\d+)/i);
    const line = lineMatch ? parseInt(lineMatch[1]) : 1;
    
    errors.push({
      message: e.message,
      line: line,
      severity: 'error'
    });
  }
  
  // Check for common issues
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  let lineNum = 1;
  
  for (let i = 0; i < js.length; i++) {
    if (js[i] === '\n') lineNum++;
    if (js[i] === '{') braceCount++;
    if (js[i] === '}') braceCount--;
    if (js[i] === '(') parenCount++;
    if (js[i] === ')') parenCount--;
    if (js[i] === '[') bracketCount++;
    if (js[i] === ']') bracketCount--;
  }
  
  if (braceCount !== 0) {
    errors.push({
      message: `Unmatched braces: ${braceCount > 0 ? braceCount + ' unclosed' : Math.abs(braceCount) + ' extra closing'}`,
      line: lineNum,
      severity: 'warning'
    });
  }
  
  if (parenCount !== 0) {
    errors.push({
      message: `Unmatched parentheses: ${parenCount > 0 ? parenCount + ' unclosed' : Math.abs(parenCount) + ' extra closing'}`,
      line: lineNum,
      severity: 'warning'
    });
  }
  
  return errors;
}

function getIframeErrors() {
  const errors = [];
  
  // This would capture console errors from the preview iframe
  // For now, return empty array - this requires more advanced setup
  
  return errors;
}

function updateErrorDisplay(errors) {
  const errorConsoleBody = document.getElementById('errorConsoleBody');
  const errorCount = document.getElementById('errorCount');
  const errorBadge = document.querySelector('.error-badge');
  const errorToggleBtn = document.getElementById('errorToggleBtn');
  
  if (!errorConsoleBody) return;
  
  if (errors.length === 0) {
    errorConsoleBody.innerHTML = '<div style="color: #7ee787; text-align: center; padding: 2rem;">✅ No errors detected</div>';
    if (errorCount) errorCount.textContent = '0';
    if (errorBadge) errorBadge.style.display = 'none';
    if (errorToggleBtn) {
      errorToggleBtn.classList.add('no-errors');
      errorToggleBtn.innerHTML = '✅';
    }
  } else {
    errorConsoleBody.innerHTML = '';
    if (errorCount) errorCount.textContent = errors.length;
    if (errorBadge) {
      errorBadge.textContent = errors.length;
      errorBadge.style.display = 'flex';
    }
    if (errorToggleBtn) {
      errorToggleBtn.classList.remove('no-errors');
      errorToggleBtn.innerHTML = '⚠️<span class="error-badge" style="display: flex;">' + errors.length + '</span>';
    }
    
    errors.forEach(error => {
      const errorItem = document.createElement('div');
      errorItem.className = `error-item ${error.severity === 'warning' ? 'warning' : ''}`;
      
      errorItem.innerHTML = `
        <div class="error-message">${error.severity === 'warning' ? '⚠️' : '❌'} ${error.message}</div>
        <div class="error-location">${error.type || 'Code'} - Line ${error.line}</div>
      `;
      
      errorConsoleBody.appendChild(errorItem);
    });
  }
}

export function toggleErrorConsole() {
  const errorConsole = document.getElementById('errorConsole');
  if (errorConsole) {
    errorConsole.classList.toggle('active');
  }
}
