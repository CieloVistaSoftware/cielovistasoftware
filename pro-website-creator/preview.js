/**
 * Preview Module
 * Handles preview iframe rendering, external file injection, and edit mode functionality
 * @module preview
 */

import { getElements } from './dom.js';
import { reapplyCurrentTheme } from './themes.js';
import { generateDevToolsTracker } from './devtools-tracker.js';

/** @type {Array<{name: string, content: string}>} Array of external CSS files */
let externalCSSFiles = [];

/** @type {Array<{name: string, content: string}>} Array of external JS files */
let externalJSFiles = [];

/** @type {boolean} Flag indicating if edit mode is enabled */
let isEditMode = false;

/**
 * Enable or disable edit mode for preview
 * When enabled, text elements in preview become contenteditable
 * @param {boolean} enabled - Whether to enable edit mode
 */
export function setEditMode(enabled) {
  isEditMode = enabled;
}

/**
 * Set external CSS and JS files to be injected into preview
 * @param {Array<{name: string, content: string}>} css - Array of CSS file objects
 * @param {Array<{name: string, content: string}>} js - Array of JS file objects
 */
export function setExternalFiles(css, js) {
  externalCSSFiles = css || [];
  externalJSFiles = js || [];
}

/**
 * Update the preview iframe with current HTML, CSS, and JS code
 * Injects external files, edit mode styles, and theme styles
 * @fires iframe#load - Triggers theme reapplication after iframe loads
 */
export function updatePreview() {
  const elements = getElements();
  const html = elements.htmlEditor.value;
  const css = elements.cssEditor.value;
  const js = elements.jsEditor.value;
  
  // Get external files content
  const externalCSSContent = externalCSSFiles.map(file => `/* ${file.name} */\n${file.content}`).join('\n\n');
  const externalJSContent = externalJSFiles.map(file => `/* ${file.name} */\n${file.content}`).join('\n\n');

  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
          
          ${externalCSSContent}
          
          /* Edit Mode Styles */
          ${isEditMode ? `
            [contenteditable="true"] {
              outline: 2px dashed #7ee787 !important;
              outline-offset: 2px;
              cursor: text !important;
              min-height: 20px;
              min-width: 20px;
              padding: 4px;
            }
            [contenteditable="true"]:hover {
              outline: 2px solid #7ee787 !important;
              background: rgba(126, 231, 135, 0.1) !important;
            }
            [contenteditable="true"]:focus {
              outline: 3px solid #7ee787 !important;
              background: rgba(126, 231, 135, 0.15) !important;
            }
          ` : ''}
        </style>
      </head>
      <body>
        ${html}
        <script>
          ${js}
          
          ${externalJSContent}
          
          // Reactive DevTools tracking for ALL elements (always active)
          ${generateDevToolsTracker()}
          
          // Make all elements editable in edit mode
          ${isEditMode ? `
            document.addEventListener('DOMContentLoaded', function() {
              const editableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, li, td, th, label');
              editableElements.forEach(el => {
                el.setAttribute('contenteditable', 'true');
                el.addEventListener('input', function(e) {
                  // Notify parent of changes
                  window.parent.postMessage({
                    type: 'contentChanged',
                    element: e.target.tagName,
                    content: e.target.innerHTML
                  }, '*');
                });
              });
            });
          ` : ''}
        <\/script>
      </body>
    </html>
  `;

  const iframe = elements.preview;
  iframe.srcdoc = fullHTML;
  
  // Reapply theme after iframe loads
  iframe.onload = () => {
    setTimeout(() => {
      reapplyCurrentTheme();
    }, 100);
  };
}
