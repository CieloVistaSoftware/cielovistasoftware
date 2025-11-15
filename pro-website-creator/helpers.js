import { getElements } from './dom.js';
import { defaults } from './defaults.js';
import { addToHistory } from './history.js';
import { updatePreview } from './preview.js';
import { state } from './state.js';

// Modal functions
export function openModal(id) {
  const modal = document.getElementById(id + 'Modal');
  if (modal) {
    modal.classList.add('active');
  }
  if (id === 'projects') {
    updateProjectsList();
  }
  if (id === 'emoji') {
    setupEmojis();
  }
}

export function closeModal(id) {
  const modal = document.getElementById(id + 'Modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// View switching
export function switchView(view) {
  const editorSection = document.getElementById('editorSection');
  const previewSection = document.getElementById('previewSection');
  const viewBtns = document.querySelectorAll('.view-btn');

  viewBtns.forEach(btn => btn.classList.remove('active'));

  if (view === 'editor') {
    editorSection.classList.remove('hidden');
    previewSection.classList.remove('active');
    // Set Edit button active
    viewBtns.forEach(btn => {
      if (btn.textContent.includes('Edit')) {
        btn.classList.add('active');
      }
    });
  } else {
    editorSection.classList.add('hidden');
    previewSection.classList.add('active');
    // Set Preview button active
    viewBtns.forEach(btn => {
      if (btn.textContent.includes('Preview')) {
        btn.classList.add('active');
      }
    });
    updatePreview();
  }
}

// Element insertion
export function insertElement(type) {
  const elements = getElements();
  const editor = elements.htmlEditor;
  const pos = editor.selectionStart;
  let text = '';
  
  switch(type) {
    case 'h1':
      text = '<h1>Heading 1</h1>\n';
      break;
    case 'h2':
      text = '<h2>Heading 2</h2>\n';
      break;
    case 'p':
      text = '<p>Your paragraph text here</p>\n';
      break;
    case 'button':
      text = '<button>Click Me</button>\n';
      break;
    case 'img':
      text = '<img src="https://placehold.co/400" alt="Description">\n';
      break;
    case 'link':
      text = '<a href="https://example.com">Link Text</a>\n';
      break;
  }
  
  editor.value = editor.value.substring(0, pos) + text + editor.value.substring(pos);
  editor.focus();
  addToHistory('html');
  updatePreview();
}

// Code formatting
export function formatCode() {
  const elements = getElements();
  const { currentTab } = state;
  const editor = currentTab === 'html' ? elements.htmlEditor : 
                 currentTab === 'css' ? elements.cssEditor : elements.jsEditor;
  
  let formatted = editor.value;
  
  // Basic formatting
  formatted = formatted.replace(/>\s*</g, '>\n<');
  formatted = formatted.replace(/{\s*/g, ' {\n  ');
  formatted = formatted.replace(/;\s*/g, ';\n  ');
  formatted = formatted.replace(/}\s*/g, '\n}\n');
  
  editor.value = formatted;
  addToHistory(currentTab);
  updatePreview();
  alert('✨ Code formatted!');
}

// Templates
export function loadTemplate(template) {
  const elements = getElements();
  const templates = {
    basic: {
      html: defaults.html,
      css: defaults.css
    },
    portfolio: {
      html: `<header><h1>John Doe</h1><p class="tagline">Web Developer</p></header><section><h2>Projects</h2><div class="project-card"><h3>Project 1</h3><p>Amazing project</p></div></section>`,
      css: `body { background: #1a1a2e; color: #eee; font-family: Arial; } header { background: #16213e; padding: 3rem; text-align: center; } .tagline { color: #94a3b8; } section { padding: 2rem; } .project-card { background: #16213e; padding: 1.5rem; margin: 1rem 0; border-radius: 10px; }`
    },
    landing: {
      html: `<div class="hero"><h1>Build Something Amazing</h1><p>Perfect solution</p><button>Get Started</button></div><section><h2>Features</h2><div class="feature"><h3>⚡ Fast</h3></div></section>`,
      css: `body { margin: 0; font-family: Arial; } .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5rem 2rem; text-align: center; } .hero button { background: white; color: #667eea; border: none; padding: 1rem 2rem; border-radius: 30px; font-weight: bold; } section { padding: 3rem 2rem; } .feature { background: #f8f9fa; padding: 2rem; border-radius: 10px; text-align: center; }`
    },
    blog: {
      html: `<header><h1>My Blog</h1><nav><a href="#home">Home</a><a href="#about">About</a></nav></header><main><article><h2>Blog Post Title</h2><p class="date">October 31, 2025</p><p>Your blog content goes here...</p></article></main>`,
      css: `body { font-family: Georgia, serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 2rem; } header { text-align: center; padding: 2rem 0; border-bottom: 3px solid #333; } nav { margin-top: 1rem; } nav a { margin: 0 1rem; color: #333; text-decoration: none; } article { margin: 3rem 0; } .date { color: #666; font-style: italic; }`
    }
  };
  
  const temp = templates[template];
  if (temp) {
    elements.htmlEditor.value = temp.html;
    elements.cssEditor.value = temp.css;
    elements.jsEditor.value = defaults.js;
    addToHistory('html');
    addToHistory('css');
    updatePreview();
    closeModal('templates');
    alert('✅ Template loaded!');
  }
}

// Snippets
export function insertSnippet(snippet) {
  const elements = getElements();
  const snippets = {
    navbar: '<nav class="navbar">\n  <a href="#home">Home</a>\n  <a href="#about">About</a>\n  <a href="#services">Services</a>\n  <a href="#contact">Contact</a>\n</nav>',
    hero: '<section class="hero">\n  <h1>Welcome to My Site</h1>\n  <p>Subtitle goes here</p>\n  <button>Call to Action</button>\n</section>',
    footer: '<footer>\n  <p>&copy; 2025 Your Name. All rights reserved.</p>\n  <div class="social">\n    <a href="#">Facebook</a>\n    <a href="#">Twitter</a>\n    <a href="#">Instagram</a>\n  </div>\n</footer>',
    form: '<form>\n  <input type="text" placeholder="Name" required>\n  <input type="email" placeholder="Email" required>\n  <textarea placeholder="Message" required></textarea>\n  <button type="submit">Send</button>\n</form>',
    card: '<div class="card">\n  <img src="https://placehold.co/300" alt="Card image">\n  <h3>Card Title</h3>\n  <p>Card description goes here</p>\n  <button>Learn More</button>\n</div>'
  };
  
  const code = snippets[snippet];
  if (code) {
    const editor = elements.htmlEditor;
    const pos = editor.selectionStart;
    editor.value = editor.value.substring(0, pos) + '\n' + code + '\n' + editor.value.substring(pos);
    editor.focus();
    addToHistory('html');
    updatePreview();
    closeModal('snippets');
    alert('✅ Snippet inserted!');
  }
}

// Emoji picker
export function setupEmojis() {
  const grid = document.getElementById('emojiGrid');
  if (!grid || grid.children.length > 0) return; // Already set up
  
  const emojis = ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','❤️','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','🔥','✨','💫','⭐','🌟','✅','❌','⚡','💡','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','👍','👎','👌','🤟','🤘','👏','🙌','👐','🤲','🤝','🙏'];
  
  const elements = getElements();
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.onclick = () => {
      const editor = elements.htmlEditor;
      const pos = editor.selectionStart;
      editor.value = editor.value.substring(0, pos) + emoji + editor.value.substring(pos);
      editor.focus();
      addToHistory('html');
      updatePreview();
      closeModal('emoji');
    };
    grid.appendChild(btn);
  });
}

// Setup project name editing
export function setupProjectNameEditing() {
  const projectNameEl = document.getElementById('projectName');
  if (!projectNameEl) return;
  
  projectNameEl.addEventListener('blur', () => {
    // Save to localStorage when edited
    const elements = getElements();
    const data = {
      name: projectNameEl.textContent,
      html: elements.htmlEditor.value,
      css: elements.cssEditor.value,
      js: elements.jsEditor.value
    };
    localStorage.setItem('currentProject', JSON.stringify(data));
  });
  
  projectNameEl.addEventListener('keydown', (e) => {
    // Press Enter to save and unfocus
    if (e.key === 'Enter') {
      e.preventDefault();
      projectNameEl.blur();
    }
  });
}

// Projects
export function saveProject() {
  const elements = getElements();
  const nameInput = document.getElementById('projectNameInput');
  const name = nameInput.value || 'Untitled';
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  
  const project = {
    id: Date.now(),
    name: name,
    html: elements.htmlEditor.value,
    css: elements.cssEditor.value,
    js: elements.jsEditor.value,
    date: new Date().toLocaleDateString()
  };
  
  projects.push(project);
  localStorage.setItem('projects', JSON.stringify(projects));
  document.getElementById('projectName').textContent = name;
  
  updateProjectsList();
  alert('✅ Project saved!');
}

export function updateProjectsList() {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const list = document.getElementById('projectsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  projects.forEach(project => {
    const item = document.createElement('div');
    item.className = 'project-item';
    item.innerHTML = `
      <div>
        <strong>${project.name}</strong><br>
        <small>${project.date}</small>
      </div>
      <div class="project-actions">
        <button class="btn-primary" style="padding: 0.5rem 0.8rem;" onclick="window.loadProject(${project.id})">Load</button>
        <button class="btn-red" style="padding: 0.5rem 0.8rem;" onclick="window.deleteProject(${project.id})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

export function loadProject(id) {
  const elements = getElements();
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const project = projects.find(p => p.id === id);
  
  if (project) {
    elements.htmlEditor.value = project.html;
    elements.cssEditor.value = project.css;
    elements.jsEditor.value = project.js;
    document.getElementById('projectName').textContent = project.name;
    
    addToHistory('html');
    addToHistory('css');
    addToHistory('js');
    updatePreview();
    closeModal('projects');
    alert('✅ Project loaded!');
  }
}

export function deleteProject(id) {
  if (confirm('Delete this project?')) {
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(projects));
    updateProjectsList();
  }
}

export function exportProject() {
  const elements = getElements();
  const data = {
    name: document.getElementById('projectName').textContent,
    html: elements.htmlEditor.value,
    css: elements.cssEditor.value,
    js: elements.jsEditor.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ Project exported!');
}

export function importProject(event) {
  const elements = getElements();
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        elements.htmlEditor.value = data.html || '';
        elements.cssEditor.value = data.css || '';
        elements.jsEditor.value = data.js || '';
        document.getElementById('projectName').textContent = data.name || 'Imported Project';
        
        addToHistory('html');
        addToHistory('css');
        addToHistory('js');
        updatePreview();
        closeModal('projects');
        alert('✅ Project imported!');
      } catch (err) {
        alert('❌ Error importing project');
      }
    };
    reader.readAsText(file);
  }
}

export function downloadWebsite() {
  const elements = getElements();
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.getElementById('projectName').textContent}</title>
  <style>
${elements.cssEditor.value}
  </style>
</head>
<body>
${elements.htmlEditor.value.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>/gi, '')}
  <script>
${elements.jsEditor.value}
  <\/script>
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${document.getElementById('projectName').textContent}.html`;
  a.click();
  URL.revokeObjectURL(url);
  alert('✅ Website downloaded!');
}
