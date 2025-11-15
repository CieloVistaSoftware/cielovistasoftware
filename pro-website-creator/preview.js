import { getElements } from './dom.js';

export function updatePreview() {
  const elements = getElements();
  const html = elements.htmlEditor.value;
  const css = elements.cssEditor.value;
  const js = elements.jsEditor.value;

  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
    </html>
  `;

  const iframe = elements.preview;
  iframe.srcdoc = fullHTML;
}
