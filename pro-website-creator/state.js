export const state = {
  currentTab: 'html',
  history: { html: [], css: [], js: [] },
  historyIndex: { html: -1, css: -1, js: -1 },
  autoSaveInterval: null,
  currentLine: { html: 0, css: 0, js: 0 }
};
