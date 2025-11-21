/**
 * Main Application Module
 * Initializes the Pro Website Creator and exposes global functions
 * @module app
 */

import { loadFromStorage } from './storage.js';
import { setupEventListeners, startAutoSave } from './events.js';
import { updatePreview } from './preview.js';
import { switchTab, updateLineNumbers } from './tabs.js';
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
  setupProjectNameEditing,
  saveProject,
  loadProject,
  deleteProject,
  exportProject,
  importProject,
  downloadWebsite,
  loadExternalCSS,
  loadExternalJS
} from './helpers.js';
import { getElements } from './dom.js';
import { startErrorMonitoring, toggleErrorConsole } from './errors.js';
import { initSettings, applySettings, resetSettings, loadSettings } from './settings.js';
import { initThemes, applyPreviewTheme } from './themes.js';

/**
 * Initialize the application
 * Loads data, sets up event listeners, initializes subsystems,
 * and prepares the UI for user interaction
 */
export function init() {
  loadFromStorage();
  setupEventListeners();
  setupProjectNameEditing();
  initSettings();
  initThemes();
  startAutoSave();
  updatePreview();
  
  // Initialize line numbers for all editors
  const elements = getElements();
  updateLineNumbers(elements.htmlEditor, 'lineNumbersHtml');
  updateLineNumbers(elements.cssEditor, 'lineNumbersCss');
  updateLineNumbers(elements.jsEditor, 'lineNumbersJs');
  
  // Start error monitoring
  startErrorMonitoring();
  
  // Initialize draggable modal
  setTimeout(() => {
    makeDraggable();
    renderSpecs();
    loadTabSettings();
    applyTabSettings('html');
    applyTabSettings('css');
    applyTabSettings('js');
    
    // Set initial view state to editor mode (green button)
    switchView('editor');
    
    // Add right-click context menu to editors
    const htmlWrapper = document.getElementById('htmlWrapper');
    const cssWrapper = document.getElementById('cssWrapper');
    const jsWrapper = document.getElementById('jsWrapper');
    
    if (htmlWrapper) htmlWrapper.addEventListener('contextmenu', (e) => showTabContextMenu(e, 'html'));
    if (cssWrapper) cssWrapper.addEventListener('contextmenu', (e) => showTabContextMenu(e, 'css'));
    if (jsWrapper) jsWrapper.addEventListener('contextmenu', (e) => showTabContextMenu(e, 'js'));
  }, 100);
}

// Expose functions to window for onclick handlers
window.switchTab = switchTab;
window.switchSplitTab = function(tab) {
  import('./split.js').then(module => module.switchSplitTab(tab));
};
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
window.toggleErrorConsole = toggleErrorConsole;
window.applySettings = applySettings;
window.resetSettings = resetSettings;
window.applyPreviewTheme = applyPreviewTheme;
window.loadExternalCSS = loadExternalCSS;
window.loadExternalJS = loadExternalJS;

/**
 * Switch between Settings and Specifications tabs
 * @param {string} tab - Tab to switch to ('settings' or 'specs')
 */
window.switchSettingsTab = function(tab) {
  const settingsTabs = document.querySelectorAll('.settings-tab');
  const settingsContent = document.getElementById('settingsContent');
  const specsContent = document.getElementById('specsContent');
  
  settingsTabs.forEach(t => t.classList.remove('active'));
  
  if (tab === 'settings') {
    settingsTabs[0].classList.add('active');
    settingsContent.style.display = 'block';
    specsContent.style.display = 'none';
  } else if (tab === 'specs') {
    settingsTabs[1].classList.add('active');
    settingsContent.style.display = 'none';
    specsContent.style.display = 'block';
  }
};

/**
 * Toggle fullscreen mode for configuration modal
 * Switches between 80% screen and 100% screen sizes
 */
window.toggleConfigFullscreen = function() {
  const modalContent = document.querySelector('#settingsModal .modal-content');
  const btn = document.getElementById('toggleFullscreenBtn');
  
  if (modalContent.classList.contains('fullscreen')) {
    modalContent.classList.remove('fullscreen');
    btn.textContent = '⛶';
    btn.title = 'Fullscreen';
  } else {
    modalContent.classList.add('fullscreen');
    btn.textContent = '⛶';
    btn.title = 'Exit Fullscreen';
  }
};

/**
 * Specification object structure
 * @typedef {Object} Specification
 * @property {number} id - Unique specification ID
 * @property {string} date - Date specification was implemented (YYYY-MM-DD)
 * @property {string} title - Brief specification title
 * @property {string} category - Category ('editor', 'ui', 'preview', 'storage', 'formatting', 'theme', 'modal')
 * @property {string} description - Detailed description of the feature
 * @property {string} solution - Technical implementation details
 */

/**
 * Complete database of all specifications
 * @type {Array<Specification>}
 */
const specifications = [
  {
    id: 1,
    date: '2025-11-15',
    title: 'Immediate Settings Application',
    category: 'ui',
    description: 'All settings in configuration modal now apply immediately on change. Removed Apply button, keeping only Reset to Defaults.',
    solution: 'Added onchange/oninput events to all input elements. Removed applySettingsBtn from HTML. Updated settings-actions to center single button.'
  },
  {
    id: 2,
    date: '2025-11-15',
    title: 'Draggable Configuration Modal',
    category: 'modal',
    description: 'Settings modal can be dragged by clicking and holding the header. Allows repositioning anywhere on screen.',
    solution: 'Added draggable-handle class to modal header. Implemented makeDraggable() with mousedown/mousemove/mouseup events. CSS cursor: grab/grabbing.'
  },
  {
    id: 3,
    date: '2025-11-15',
    title: 'Settings Tooltips',
    category: 'ui',
    description: 'All settings inputs now have hover tooltips explaining their purpose and acceptable values.',
    solution: 'Added title attributes to all label and input elements with descriptive text explaining functionality and value ranges.'
  },
  {
    id: 4,
    date: '2025-11-15',
    title: 'Comprehensive Specifications Viewer',
    category: 'modal',
    description: 'Specifications tab now shows all features ever implemented with category filtering and sorting (newest/oldest/category).',
    solution: 'Created specifications array with 40+ entries. Built renderSpecs(), filterSpecs(), sortSpecs() functions. Added dropdown controls for category and sort order.'
  },
  {
    id: 5,
    date: '2025-11-15',
    title: 'Fullscreen Configuration Toggle',
    category: 'modal',
    description: 'Configuration modal has two sizes: 80% screen (default) and fullscreen. Toggle button (⛶) in header switches between modes.',
    solution: 'Added toggleConfigFullscreen() function. CSS .fullscreen class sets 100vw × 100vh. 0.3s transition between sizes.'
  },
  {
    id: 6,
    date: '2025-11-15',
    title: 'Settings Impact Badges',
    category: 'ui',
    description: 'Each settings card shows impact badges (HTML/CSS/JS/UI Only) indicating which languages/areas are affected.',
    solution: 'Added .card-impact divs with .impact-badge spans. CSS classes for each badge type with language-specific colors.'
  },
  {
    id: 7,
    date: '2025-11-15',
    title: 'Card-Based Settings Layout',
    category: 'ui',
    description: 'Settings organized into 4 cards (Editor, Auto-Save, Theme, Preview) in 2-column grid for better categorization.',
    solution: 'Created .settings-grid with grid-template-columns: repeat(2, 1fr). Each card has .settings-card class with dark background.'
  },
  {
    id: 8,
    date: '2025-11-15',
    title: 'Modal Scrollbar Styling',
    category: 'ui',
    description: 'Settings and specifications tabs have custom dark scrollbars matching GitHub dark theme.',
    solution: 'Added ::-webkit-scrollbar styles to .settings-content and .specs-content with #30363d thumb color.'
  },
  {
    id: 9,
    date: '2025-11-15',
    title: 'Compact Tab Design',
    category: 'ui',
    description: 'Tab buttons use reduced padding (0.5rem vertical) and smaller font-size (0.95rem) for space efficiency.',
    solution: 'Updated .tab CSS with padding: 0.5rem 0.9rem and font-size: 0.95rem down from previous values.'
  },
  {
    id: 10,
    date: '2025-11-15',
    title: 'Settings Modal 80% Screen',
    category: 'modal',
    description: 'Configuration modal default size is 80vw × 80vh for optimal visibility without obscuring entire workspace.',
    solution: 'Set #settingsModal .modal-content with max-width: 80vw, max-height: 80vh, width: 80vw, height: 80vh.'
  },
  {
    id: 11,
    date: '2025-11-15',
    title: 'Default Active Line Highlighting',
    category: 'editor',
    description: 'Line 1 (index 0) is highlighted by default when app loads, providing immediate visual feedback of cursor position.',
    solution: 'Modified loadFromStorage() to call restoreCursorPosition(tab, 0) for all tabs, ensuring line 1 highlighted on init.'
  },
  {
    id: 12,
    date: '2025-11-15',
    title: 'Editor Text Color Picker',
    category: 'editor',
    description: 'Color picker in settings to customize editor text color. Default: Yellow (#ffeb3b) for high visibility.',
    solution: 'Added editorTextColor setting with color input. Applied via editor.style.color in applyEditorSettings().'
  },
  {
    id: 13,
    date: '2025-11-15',
    title: 'CSS DevTools-Style Formatting',
    category: 'formatting',
    description: 'CSS code formatted to 120 characters per line (like Chrome DevTools) instead of 80, better matching industry tools.',
    solution: 'Set Prettier printWidth: 120 for CSS parser in formatCode() and formatCurrentTab() functions.'
  },
  {
    id: 14,
    date: '2025-11-15',
    title: 'Auto-Format on Tab Switch',
    category: 'formatting',
    description: 'Code automatically formatted with Prettier when switching between HTML/CSS/JS tabs. Ensures consistent formatting.',
    solution: 'Added formatCurrentTab() call in switchTab() before showing new tab. Runs Prettier.format() automatically.'
  },
  {
    id: 15,
    date: '2025-11-15',
    title: 'Contenteditable Preview Mode',
    category: 'preview',
    description: 'In Preview mode, text elements (h1-h6, p, div, span, a, button, li, td, th, label) become editable with green dashed outlines.',
    solution: 'Added setEditMode(true) in preview mode. Injects contenteditable attributes and CSS styles for green dashed outlines.'
  },
  {
    id: 16,
    date: '2025-11-15',
    title: 'Word Wrap Defaults',
    category: 'editor',
    description: 'All editors default to word wrap enabled (lineWrap: true, htmlWordWrap: true) for vertical/mobile-friendly formatting.',
    solution: 'Changed defaultSettings to lineWrap: true, htmlWordWrap: true. Applied via editor.style.whiteSpace = "pre-wrap".'
  },
  {
    id: 17,
    date: '2025-11-15',
    title: 'Dark Mode Buttons Setting',
    category: 'theme',
    description: 'Toggle to enable dark mode styling for all toolbar buttons (dark background with colored borders).',
    solution: 'Added darkModeButtons boolean setting. Applied via body[data-button-mode="dark"] CSS attribute selector with dynamic styles.'
  },
  {
    id: 18,
    date: '2025-11-15',
    title: 'Theme Organization by Color',
    category: 'theme',
    description: '40 themes reorganized into 8 color groups: Green, Blue, Purple/Pink, Red/Orange, Yellow/Cyan, Light, Dark, Minimal. Each shows ● color indicator.',
    solution: 'Reorganized theme selector with <optgroup> elements. Added data-color attributes and ● prefix to each option.'
  },
  {
    id: 19,
    date: '2025-11-15',
    title: 'Active Line Brightness Slider',
    category: 'editor',
    description: 'Adjustable brightness control (10-80%, default 30%) for active line highlighting with real-time preview.',
    solution: 'Added lineHighlightBrightness range input. Converted percentage to hex opacity: Math.round((brightness/100)*255).toString(16).'
  },
  {
    id: 20,
    date: '2025-11-15',
    title: 'Multiple CSS/JS File Upload',
    category: 'preview',
    description: 'File selectors in preview toolbar to load external CSS and JS files. Supports multiple files with file count badges.',
    solution: 'Added input[type="file"] multiple with FileReader API. loadExternalCSS/JS() functions read files and inject into preview via setExternalFiles().'
  },
  {
    id: 21,
    date: '2025-11-14',
    title: 'Live Preview Mode',
    category: 'preview',
    description: 'Real-time preview updates as you type in any editor. Toggle on/off in settings.',
    solution: 'Added livePreview boolean setting. Event listeners on textarea input trigger updatePreview() when enabled.'
  },
  {
    id: 22,
    date: '2025-11-14',
    title: 'Element Highlighting',
    category: 'preview',
    description: 'Hover over elements in preview to see visual outlines. Toggle on/off in settings.',
    solution: 'Added elementHighlight setting. CSS .highlight-element class with green outline applied on mouseover events in preview iframe.'
  },
  {
    id: 23,
    date: '2025-11-14',
    title: 'Auto-Save with Interval Control',
    category: 'storage',
    description: 'Automatically save work to localStorage at configurable interval (1-60 seconds). Shows save status in status bar.',
    solution: 'setInterval calling saveToStorage() every N seconds. Configurable via autoSaveInterval setting. Status updates in #autoSaveStatus.'
  },
  {
    id: 24,
    date: '2025-11-14',
    title: 'Project Management System',
    category: 'storage',
    description: 'Save, load, and delete multiple projects. Each project stores HTML, CSS, JS, and project name separately.',
    solution: 'localStorage.projects array storing project objects. saveProject(), loadProject(), deleteProject() functions with unique IDs.'
  },
  {
    id: 25,
    date: '2025-11-14',
    title: 'Undo/Redo History',
    category: 'editor',
    description: 'Full undo/redo support for all code changes. Navigate through editing history with toolbar buttons.',
    solution: 'state.history array storing snapshots. addToHistory() on changes. undo()/redo() navigate historyIndex and restore editor values.'
  },
  {
    id: 26,
    date: '2025-11-14',
    title: 'Template Library',
    category: 'editor',
    description: 'Pre-built templates: Basic, Portfolio, Landing Page, Blog. Load complete HTML/CSS structures with one click.',
    solution: 'templates object with html/css pairs. loadTemplate(name) sets editor values and calls addToHistory(). closeModal after load.'
  },
  {
    id: 27,
    date: '2025-11-14',
    title: 'Code Snippets',
    category: 'editor',
    description: 'Insert common HTML snippets: navbar, hero, footer, card, form, contact section. Speeds up development.',
    solution: 'snippets object with HTML strings. insertSnippet() inserts at cursor position using selectionStart/selectionEnd.'
  },
  {
    id: 28,
    date: '2025-11-14',
    title: 'Prettier Code Formatting',
    category: 'formatting',
    description: 'Professional code formatting using Prettier with Format button. Supports HTML, CSS, and JavaScript.',
    solution: 'Loaded Prettier CDN (standalone + parsers). formatCode() calls prettier.format() with parser-html/postcss/babel based on currentTab.'
  },
  {
    id: 29,
    date: '2025-11-14',
    title: 'Line Numbers',
    category: 'editor',
    description: 'Dynamic line numbers for all editors. Updates automatically as code grows/shrinks.',
    solution: 'updateLineNumbers() counts newlines and generates <div> elements. Called on input events and after formatting.'
  },
  {
    id: 30,
    date: '2025-11-14',
    title: 'Split View Mode',
    category: 'ui',
    description: 'Side-by-side editor and preview for simultaneous code editing and result viewing.',
    solution: 'Created #splitView with .split-editor and .split-preview sections. switchView(\"split\") shows both editor and preview simultaneously.'
  },
  {
    id: 31,
    date: '2025-11-14',
    title: 'HTML Element Insertion',
    category: 'editor',
    description: 'Quick insert buttons for common HTML elements: h1, h2, p, button, img, link. Inserts at cursor position.',
    solution: 'insertElement(type) function generates HTML strings. Uses editor.selectionStart to insert at cursor. Restores cursor position after insert.'
  },
  {
    id: 32,
    date: '2025-11-14',
    title: 'Emoji Picker',
    category: 'editor',
    description: 'Visual emoji picker with searchable grid. Insert emojis directly into HTML code.',
    solution: 'setupEmojis() populates grid with emoji array. Click handlers insert emoji at cursor position using selectionStart.'
  },
  {
    id: 33,
    date: '2025-11-14',
    title: 'Download Website',
    category: 'storage',
    description: 'Export complete website as single HTML file with embedded CSS and JS. Ready to deploy anywhere.',
    solution: 'downloadWebsite() creates HTML template with inline <style> and <script> tags. Blob + URL.createObjectURL for download link.'
  },
  {
    id: 34,
    date: '2025-11-14',
    title: 'Project Import/Export',
    category: 'storage',
    description: 'Export projects as JSON files. Import previously exported projects to restore work.',
    solution: 'exportProject() creates JSON blob with name/html/css/js. importProject() reads File via FileReader and sets editor values.'
  },
  {
    id: 35,
    date: '2025-11-14',
    title: 'Editable Project Names',
    category: 'ui',
    description: 'Click project name in status bar to edit. Changes persist with auto-save.',
    solution: 'contenteditable="true" on #projectName span. setupProjectNameEditing() adds blur/keydown event listeners to save changes.'
  },
  {
    id: 36,
    date: '2025-11-14',
    title: 'Error Console',
    category: 'editor',
    description: 'Real-time JavaScript error detection and display. Shows errors with line numbers and stack traces.',
    solution: 'window.addEventListener(\"error\") catches errors. startErrorMonitoring() checks preview iframe for JS errors. Displays in #errorConsole.'
  },
  {
    id: 37,
    date: '2025-11-14',
    title: 'Theme Preview System',
    category: 'theme',
    description: '40+ professional themes for preview mode. Instantly apply CSS frameworks and color schemes.',
    solution: 'themes object with color/background properties. applyPreviewTheme() generates CSS and injects into iframe via <style id=\"theme-style\">.'
  },
  {
    id: 38,
    date: '2025-11-14',
    title: 'Configurable Font Size',
    category: 'editor',
    description: 'Adjust editor font size (10-24px) for comfortable reading. Applies to all three editors.',
    solution: 'fontSize setting applied via editor.style.fontSize = settings.fontSize + \"px\" in applyEditorSettings().'
  },
  {
    id: 39,
    date: '2025-11-14',
    title: 'Configurable Tab Size',
    category: 'editor',
    description: 'Set indentation width (2-8 spaces) to match your coding style preferences.',
    solution: 'tabSize setting applied via editor.style.tabSize = settings.tabSize CSS property.'
  },
  {
    id: 40,
    date: '2025-11-14',
    title: 'Accent Color Themes',
    category: 'theme',
    description: 'Choose from 5 accent colors (Green, Blue, Pink, Orange, Purple) to customize UI highlights.',
    solution: 'accentColor setting injected via CSS custom property --accent-color and dynamic style element for active states.'
  }
];

/** @type {string} Current category filter ('all' or specific category) */
let currentSpecsFilter = 'all';

/** @type {string} Current sort order ('newest', 'oldest', or 'category') */
let currentSpecsSort = 'newest';

/**
 * Render specifications list with current filter and sort
 * Generates HTML for each specification with badges and solution details
 * @global
 */
window.renderSpecs = function() {
  const specsList = document.getElementById('specsList');
  if (!specsList) return;
  
  let filteredSpecs = specifications;
  
  // Apply filter
  if (currentSpecsFilter !== 'all') {
    filteredSpecs = filteredSpecs.filter(spec => spec.category === currentSpecsFilter);
  }
  
  // Apply sort
  filteredSpecs = [...filteredSpecs];
  if (currentSpecsSort === 'newest') {
    filteredSpecs.sort((a, b) => b.id - a.id);
  } else if (currentSpecsSort === 'oldest') {
    filteredSpecs.sort((a, b) => a.id - b.id);
  } else if (currentSpecsSort === 'category') {
    filteredSpecs.sort((a, b) => a.category.localeCompare(b.category) || b.id - a.id);
  }
  
  // Render
  specsList.innerHTML = filteredSpecs.map(spec => `
    <div class="spec-item" data-category="${spec.category}">
      <div class="spec-header">
        <h4>${spec.title}</h4>
        <span class="spec-badge ${spec.category}" onclick="filterSpecsByCategory('${spec.category}')" style="cursor: pointer;" title="Filter by ${spec.category} category">${spec.category}</span>
      </div>
      <p class="spec-description">${spec.description}</p>
      ${spec.solution ? `<p class="spec-solution"><strong>Solution:</strong> ${spec.solution}</p>` : ''}
      <div class="spec-meta">
        <span class="spec-date">${spec.date}</span>
        <span class="spec-id">#${spec.id}</span>
      </div>
    </div>
  `).join('');
};

/**
 * Filter specifications by category
 * Reads selected category from dropdown and re-renders list
 * @global
 */
window.filterSpecs = function() {
  const filter = document.getElementById('specCategoryFilter');
  if (filter) {
    currentSpecsFilter = filter.value;
    renderSpecs();
  }
};

/**
 * Filter specifications by clicking on a category badge
 * Updates dropdown and applies filter
 * @param {string} category - Category name to filter by
 * @global
 */
window.filterSpecsByCategory = function(category) {
  const filter = document.getElementById('specCategoryFilter');
  if (filter) {
    filter.value = category;
    currentSpecsFilter = category;
    renderSpecs();
  }
};

/**
 * Sort specifications by selected order
 * Reads sort order from dropdown and re-renders list
 * @global
 */
window.sortSpecs = function() {
  const sort = document.getElementById('specSortOrder');
  if (sort) {
    currentSpecsSort = sort.value;
    renderSpecs();
  }
};

/**
 * Make settings modal draggable by header
 * Implements drag functionality using mouse events
 * @global
 */
window.makeDraggable = function() {
  const modal = document.querySelector('#settingsModal .modal-content');
  const handle = document.getElementById('settingsModalHeader');
  
  if (!modal || !handle) return;
  
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  handle.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  function dragStart(e) {
    if (e.target.closest('button')) return; // Don't drag when clicking buttons
    
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === handle || handle.contains(e.target)) {
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      setTranslate(currentX, currentY, modal);
    }
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    
    isDragging = false;
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }
};

/**
 * Per-tab settings storage
 * Each tab can have custom settings or null to use global settings
 * @type {Object.<string, Settings|null>}
 */
const tabSettings = {
  html: null,  // null means use global settings
  css: null,
  js: null
};

/**
 * Load tab-specific settings from localStorage
 * @private
 */
function loadTabSettings() {
  const saved = localStorage.getItem('tabSettings');
  if (saved) {
    const parsed = JSON.parse(saved);
    tabSettings.html = parsed.html;
    tabSettings.css = parsed.css;
    tabSettings.js = parsed.js;
  }
}

/**
 * Save tab-specific settings to localStorage
 * @private
 */
function saveTabSettings() {
  localStorage.setItem('tabSettings', JSON.stringify(tabSettings));
}

/**
 * Apply settings to a specific tab editor
 * Uses tab-specific settings if available, otherwise uses global settings
 * @param {string} tab - Tab name ('html', 'css', or 'js')
 * @private
 */
function applyTabSettings(tab) {
  const elements = getElements();
  const editor = tab === 'html' ? elements.htmlEditor : 
                 tab === 'css' ? elements.cssEditor : elements.jsEditor;
  
  if (!editor) return;
  
  // Get settings (tab-specific or global)
  const settings = tabSettings[tab] || loadSettings();
  
  editor.style.fontSize = settings.fontSize + 'px';
  editor.style.color = settings.editorTextColor || '#ffeb3b';
  editor.style.tabSize = settings.tabSize;
  
  if (tab === 'html') {
    editor.style.whiteSpace = settings.htmlWordWrap ? 'pre-wrap' : 'pre';
  } else {
    editor.style.whiteSpace = settings.lineWrap ? 'pre-wrap' : 'pre';
  }
}

/**
 * Show context menu for tab-specific settings
 * Right-click menu with options to use global or custom settings
 * @param {MouseEvent} e - The right-click event
 * @param {string} tab - Tab name ('html', 'css', or 'js')
 * @global
 */
window.showTabContextMenu = function(e, tab) {
  e.preventDefault();
  
  // Remove any existing context menu
  const existing = document.getElementById('tabContextMenu');
  if (existing) existing.remove();
  
  const menu = document.createElement('div');
  menu.id = 'tabContextMenu';
  menu.className = 'context-menu';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  
  const isUsingGlobal = !tabSettings[tab];
  const currentSettings = tabSettings[tab] || loadSettings();
  
  menu.innerHTML = `
    <div class="context-menu-header">${tab.toUpperCase()} Tab Settings</div>
    <div class="context-menu-item ${isUsingGlobal ? 'active' : ''}" onclick="useGlobalSettings('${tab}')">
      <span>✓</span> Use Global Settings
    </div>
    <div class="context-menu-item ${!isUsingGlobal ? 'active' : ''}" onclick="openTabSettings('${tab}')">
      <span>⚙️</span> Custom Settings for ${tab.toUpperCase()}
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-info">
      Font: ${currentSettings.fontSize}px | Tab: ${currentSettings.tabSize} | Wrap: ${tab === 'html' ? currentSettings.htmlWordWrap : currentSettings.lineWrap ? 'ON' : 'OFF'}
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
};

/**
 * Set tab to use global settings
 * Removes tab-specific overrides and applies global settings
 * @param {string} tab - Tab name ('html', 'css', or 'js')
 * @global
 */
window.useGlobalSettings = function(tab) {
  tabSettings[tab] = null;
  saveTabSettings();
  applyTabSettings(tab);
  document.getElementById('tabContextMenu')?.remove();
};

/**
 * Open tab-specific settings modal
 * Creates custom settings copy if not exists and shows configuration dialog
 * @param {string} tab - Tab name ('html', 'css', or 'js')
 * @global
 */
window.openTabSettings = function(tab) {
  document.getElementById('tabContextMenu')?.remove();
  
  // Create or get current tab settings
  if (!tabSettings[tab]) {
    tabSettings[tab] = { ...loadSettings() };
  }
  
  // Open settings modal with tab-specific mode
  openModal('tabConfig');
  populateTabConfigForm(tab);
};

/**
 * Populate tab configuration modal with current tab settings
 * @param {string} tab - Tab name ('html', 'css', or 'js')
 * @private
 */
function populateTabConfigForm(tab) {
  const settings = tabSettings[tab];
  const modal = document.getElementById('tabConfigModal');
  if (!modal) return;
  
  modal.querySelector('.modal-header h2').textContent = `⚙️ ${tab.toUpperCase()} Tab Configuration`;
  document.getElementById('tabConfigTarget').value = tab;
  document.getElementById('tabFontSize').value = settings.fontSize;
  document.getElementById('tabTabSize').value = settings.tabSize;
  
  if (tab === 'html') {
    document.getElementById('tabWordWrap').checked = settings.htmlWordWrap;
    document.getElementById('tabWordWrapLabel').textContent = 'HTML Word Wrap';
  } else {
    document.getElementById('tabWordWrap').checked = settings.lineWrap;
    document.getElementById('tabWordWrapLabel').textContent = 'Word Wrap';
  }
  
  document.getElementById('tabTextColor').value = settings.editorTextColor || '#ffeb3b';
}

/**
 * Apply tab-specific configuration from modal
 * Saves custom settings and applies to the target tab editor
 * @global
 */
window.applyTabConfig = function() {
  const tab = document.getElementById('tabConfigTarget').value;
  
  tabSettings[tab] = tabSettings[tab] || {};
  tabSettings[tab].fontSize = parseInt(document.getElementById('tabFontSize').value);
  tabSettings[tab].tabSize = parseInt(document.getElementById('tabTabSize').value);
  
  if (tab === 'html') {
    tabSettings[tab].htmlWordWrap = document.getElementById('tabWordWrap').checked;
  } else {
    tabSettings[tab].lineWrap = document.getElementById('tabWordWrap').checked;
  }
  
  tabSettings[tab].editorTextColor = document.getElementById('tabTextColor').value;
  
  saveTabSettings();
  applyTabSettings(tab);
  
  closeModal('tabConfig');
};

/**
 * Reset tab to global settings
 * Prompts for confirmation before removing tab-specific overrides
 * @global
 */
window.resetTabConfig = function() {
  const tab = document.getElementById('tabConfigTarget').value;
  
  if (confirm(`Reset ${tab.toUpperCase()} tab to global settings?`)) {
    tabSettings[tab] = null;
    saveTabSettings();
    applyTabSettings(tab);
    closeModal('tabConfig');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
