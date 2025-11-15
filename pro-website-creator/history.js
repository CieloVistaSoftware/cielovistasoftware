import { state } from './state.js';
import { getElements } from './dom.js';

export function addToHistory(type) {
  const elements = getElements();
  const editor = type === 'html' ? elements.htmlEditor : type === 'css' ? elements.cssEditor : elements.jsEditor;
  const value = editor.value;
  
  state.history[type] = state.history[type].slice(0, state.historyIndex[type] + 1);
  state.history[type].push(value);
  state.historyIndex[type] = state.history[type].length - 1;
  
  if (state.history[type].length > 50) {
    state.history[type].shift();
    state.historyIndex[type]--;
  }
}

export function undo() {
  const elements = getElements();
  if (state.historyIndex[state.currentTab] > 0) {
    state.historyIndex[state.currentTab]--;
    const editor = state.currentTab === 'html' ? elements.htmlEditor : state.currentTab === 'css' ? elements.cssEditor : elements.jsEditor;
    editor.value = state.history[state.currentTab][state.historyIndex[state.currentTab]];
  }
}

export function redo() {
  const elements = getElements();
  if (state.historyIndex[state.currentTab] < state.history[state.currentTab].length - 1) {
    state.historyIndex[state.currentTab]++;
    const editor = state.currentTab === 'html' ? elements.htmlEditor : state.currentTab === 'css' ? elements.cssEditor : elements.jsEditor;
    editor.value = state.history[state.currentTab][state.historyIndex[state.currentTab]];
  }
}
