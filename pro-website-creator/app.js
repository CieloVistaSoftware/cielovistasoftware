import { loadFromStorage } from './storage.js';
import { setupEventListeners, startAutoSave } from './events.js';
import { updatePreview } from './preview.js';
import { switchTab } from './tabs.js';
import { undo, redo } from './history.js';
import { 
  openModal, 
  closeModal, 
  switchView, 
  insertElement, 
  formatCode,
  loadTemplate,
  insertSnippet,
  setupEmojis,
  saveProject,
  loadProject,
  deleteProject,
  exportProject,
  importProject,
  downloadWebsite
} from './helpers.js';

export function init() {
  loadFromStorage();
  setupEventListeners();
  startAutoSave();
  updatePreview();
}

// Expose functions to window for onclick handlers
window.switchTab = switchTab;
window.undo = undo;
window.redo = redo;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchView = switchView;
window.insertElement = insertElement;
window.formatCode = formatCode;
window.loadTemplate = loadTemplate;
window.insertSnippet = insertSnippet;
window.saveProject = saveProject;
window.loadProject = loadProject;
window.deleteProject = deleteProject;
window.exportProject = exportProject;
window.importProject = importProject;
window.downloadWebsite = downloadWebsite;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
