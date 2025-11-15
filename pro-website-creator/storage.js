import { state } from './state.js';
import { getElements } from './dom.js';
import { defaults } from './defaults.js';
import { addToHistory } from './history.js';

export function loadFromStorage() {
  const elements = getElements();
  const saved = localStorage.getItem('currentProject');
  
  // Get default project name from folder containing index.html
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // Remove index.html or any .html file from the end
  const cleanPath = pathParts.filter(part => !part.endsWith('.html'));
  const defaultName = cleanPath[cleanPath.length - 1] || 'pro-website-creator';
  
  if (saved) {
    const data = JSON.parse(saved);
    elements.htmlEditor.value = data.html || defaults.html;
    elements.cssEditor.value = data.css || defaults.css;
    elements.jsEditor.value = data.js || defaults.js;
    elements.projectName.textContent = data.name || defaultName;
  } else {
    elements.htmlEditor.value = defaults.html;
    elements.cssEditor.value = defaults.css;
    elements.jsEditor.value = defaults.js;
    elements.projectName.textContent = defaultName;
  }
  
  addToHistory('html');
  addToHistory('css');
  addToHistory('js');
}

export function saveToStorage() {
  const elements = getElements();
  const data = {
    name: elements.projectName.textContent,
    html: elements.htmlEditor.value,
    css: elements.cssEditor.value,
    js: elements.jsEditor.value
  };
  localStorage.setItem('currentProject', JSON.stringify(data));
}
