/**
 * Settings Module
 * Manages application settings including editor appearance, behavior, and theme customization
 * @module settings
 */

import { getElements } from './dom.js';
import { state } from './state.js';

/**
 * Default settings configuration
 * @typedef {Object} Settings
 * @property {number} fontSize - Editor font size in pixels (10-24)
 * @property {number} tabSize - Tab indentation size in spaces (2-8)
 * @property {boolean} lineWrap - Word wrap for CSS/JS editors
 * @property {boolean} htmlWordWrap - Word wrap for HTML editor
 * @property {number} autoSaveInterval - Auto-save interval in seconds (1-60)
 * @property {boolean} autoSaveEnabled - Whether auto-save is enabled
 * @property {string} accentColor - UI accent color (hex)
 * @property {boolean} livePreview - Enable live preview updates
 * @property {boolean} elementHighlight - Enable element highlighting on hover
 * @property {number} lineHighlightBrightness - Active line brightness percentage (10-80)
 * @property {boolean} darkModeButtons - Use dark mode for buttons
 * @property {string} editorTextColor - Editor text color (hex)
 */
const defaultSettings = {
  fontSize: 14,
  tabSize: 2,
  lineWrap: true,
  htmlWordWrap: true,
  autoSaveInterval: 5,
  autoSaveEnabled: true,
  accentColor: '#7ee787',
  livePreview: true,
  elementHighlight: true,
  lineHighlightBrightness: 30,
  darkModeButtons: true,
  editorTextColor: '#ffeb3b'
};

/**
 * Load settings from localStorage or return defaults
 * @returns {Settings} The loaded or default settings object
 */
export function loadSettings() {
  const saved = localStorage.getItem('editorSettings');
  if (saved) {
    return { ...defaultSettings, ...JSON.parse(saved) };
  }
  return defaultSettings;
}

/**
 * Save settings to localStorage
 * @param {Settings} settings - The settings object to save
 */
export function saveSettings(settings) {
  localStorage.setItem('editorSettings', JSON.stringify(settings));
}

/**
 * Apply current form settings immediately
 * Reads values from settings modal and applies to all editors
 * Updates auto-save interval and displays confirmation message
 */
export function applySettings() {
  const settings = {
    fontSize: parseInt(document.getElementById('fontSizeSetting').value),
    tabSize: parseInt(document.getElementById('tabSizeSetting').value),
    lineWrap: document.getElementById('lineWrapSetting').checked,
    htmlWordWrap: document.getElementById('htmlWordWrapSetting').checked,
    autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
    autoSaveEnabled: document.getElementById('autoSaveEnabled').checked,
    accentColor: document.getElementById('accentColorSetting').value,
    livePreview: document.getElementById('livePreview').checked,
    elementHighlight: document.getElementById('elementHighlight').checked,
    lineHighlightBrightness: parseInt(document.getElementById('lineHighlightBrightness').value),
    darkModeButtons: document.getElementById('darkModeButtons').checked,
    editorTextColor: document.getElementById('editorTextColor').value
  };
  
  saveSettings(settings);
  applyEditorSettings(settings);
  
  // Update auto-save interval
  if (state.autoSaveInterval) {
    clearInterval(state.autoSaveInterval);
  }
  
  if (settings.autoSaveEnabled) {
    import('./events.js').then(module => {
      state.autoSaveInterval = setInterval(() => {
        import('./storage.js').then(storage => {
          storage.saveToStorage();
          const statusEl = document.getElementById('autoSaveStatus');
          if (statusEl) statusEl.textContent = '✅ Auto-saved';
        });
      }, settings.autoSaveInterval * 1000);
    });
  }
  
  const statusEl = document.getElementById('autoSaveStatus');
  if (statusEl) {
    statusEl.textContent = '✅ Settings applied!';
    setTimeout(() => {
      statusEl.textContent = '✅ Auto-saved';
    }, 2000);
  }
}

/**
 * Apply settings to editor elements and UI
 * Sets font size, colors, word wrap, accent colors, and button themes
 * Injects dynamic CSS for active states and theme colors
 * @param {Settings} settings - Settings object to apply
 * @private
 */
function applyEditorSettings(settings) {
  const elements = getElements();
  const editors = [elements.htmlEditor, elements.cssEditor, elements.jsEditor];
  
  editors.forEach((editor, index) => {
    if (editor) {
      editor.style.fontSize = settings.fontSize + 'px';
      editor.style.color = settings.editorTextColor || '#ffeb3b';
      // HTML editor has separate word wrap setting
      if (index === 0) {
        editor.style.whiteSpace = settings.htmlWordWrap ? 'pre-wrap' : 'pre';
      } else {
        editor.style.whiteSpace = settings.lineWrap ? 'pre-wrap' : 'pre';
      }
      editor.style.tabSize = settings.tabSize;
    }
  });
  
  // Apply accent color to CSS variables
  document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  
  // Apply dark mode buttons
  const buttonMode = settings.darkModeButtons ? 'dark' : 'light';
  document.body.setAttribute('data-button-mode', buttonMode);
  
  // Update accent color throughout the app
  const style = document.createElement('style');
  style.id = 'dynamic-accent-style';
  const existingStyle = document.getElementById('dynamic-accent-style');
  if (existingStyle) existingStyle.remove();
  
  // Convert brightness percentage to hex opacity
  const brightnessHex = Math.round((settings.lineHighlightBrightness / 100) * 255).toString(16).padStart(2, '0');
  
  style.textContent = `
    .tab.active, .split-tab.active, .view-btn.active {
      background: ${settings.accentColor} !important;
      border-color: ${settings.accentColor} !important;
      color: #0d1117 !important;
      font-weight: 600 !important;
    }
    .modal-header {
      border-bottom-color: ${settings.accentColor} !important;
    }
    .line-number.active {
      color: #0d1117 !important;
      background: ${settings.accentColor}${brightnessHex} !important;
    }
    textarea::-webkit-scrollbar-thumb:hover {
      background: ${settings.accentColor} !important;
    }
    
    /* Dark mode buttons */
    body[data-button-mode="dark"] .btn-primary,
    body[data-button-mode="dark"] .btn-success,
    body[data-button-mode="dark"] .btn-purple,
    body[data-button-mode="dark"] .btn-orange,
    body[data-button-mode="dark"] .tool-btn,
    body[data-button-mode="dark"] .view-btn {
      background: #21262d !important;
      color: #c9d1d9 !important;
      border: 1px solid #30363d !important;
    }
    
    body[data-button-mode="dark"] .btn-primary:hover,
    body[data-button-mode="dark"] .btn-success:hover,
    body[data-button-mode="dark"] .btn-purple:hover,
    body[data-button-mode="dark"] .btn-orange:hover,
    body[data-button-mode="dark"] .tool-btn:hover,
    body[data-button-mode="dark"] .view-btn:hover {
      background: #30363d !important;
      border-color: ${settings.accentColor} !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Reset all settings to default values
 * Prompts user for confirmation before resetting
 */
export function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    saveSettings(defaultSettings);
    populateSettingsForm(defaultSettings);
    applyEditorSettings(defaultSettings);
    alert('✅ Settings reset to defaults!');
  }
}

/**
 * Populate settings form with current values
 * Updates all input fields in settings modal with provided settings
 * @param {Settings} settings - Settings object to populate form with
 */
export function populateSettingsForm(settings) {
  document.getElementById('fontSizeSetting').value = settings.fontSize;
  document.getElementById('tabSizeSetting').value = settings.tabSize;
  document.getElementById('lineWrapSetting').checked = settings.lineWrap;
  document.getElementById('htmlWordWrapSetting').checked = settings.htmlWordWrap || false;
  document.getElementById('autoSaveInterval').value = settings.autoSaveInterval;
  document.getElementById('autoSaveEnabled').checked = settings.autoSaveEnabled;
  document.getElementById('accentColorSetting').value = settings.accentColor;
  document.getElementById('livePreview').checked = settings.livePreview;
  document.getElementById('elementHighlight').checked = settings.elementHighlight;
  document.getElementById('lineHighlightBrightness').value = settings.lineHighlightBrightness || 30;
  document.getElementById('brightnessValue').textContent = (settings.lineHighlightBrightness || 30) + '%';
  document.getElementById('darkModeButtons').checked = settings.darkModeButtons !== false;
  document.getElementById('editorTextColor').value = settings.editorTextColor || '#ffeb3b';
}

/**
 * Initialize settings system
 * Loads and applies settings, sets up brightness slider live update,
 * and observes settings modal to populate form when opened
 */
export function initSettings() {
  const settings = loadSettings();
  applyEditorSettings(settings);
  
  // Add brightness slider live update
  const brightnessSlider = document.getElementById('lineHighlightBrightness');
  const brightnessValue = document.getElementById('brightnessValue');
  if (brightnessSlider && brightnessValue) {
    brightnessSlider.addEventListener('input', (e) => {
      brightnessValue.textContent = e.target.value + '%';
    });
  }
  
  // Populate form when settings modal is opened
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (settingsModal.classList.contains('active')) {
            populateSettingsForm(loadSettings());
          }
        }
      });
    });
    observer.observe(settingsModal, { attributes: true });
  }
}
