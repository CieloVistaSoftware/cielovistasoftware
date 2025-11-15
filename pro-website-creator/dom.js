export function getElements() {
  return {
    htmlEditor: document.getElementById('htmlEditor'),
    cssEditor: document.getElementById('cssEditor'),
    jsEditor: document.getElementById('jsEditor'),
    preview: document.getElementById('preview'),
    projectName: document.getElementById('projectName'),
    autoSaveStatus: document.getElementById('autoSaveStatus')
  };
}
