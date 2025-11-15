console.log('Script started loading...');

// State management
let currentTab = 'html';
let history = { html: [], css: [], js: [] };
let historyIndex = { html: -1, css: -1, js: -1 };
let autoSaveInterval;

const htmlEditor = document.getElementById('htmlEditor');
const cssEditor = document.getElementById('cssEditor');
const jsEditor = document.getElementById('jsEditor');
const preview = document.getElementById('preview');

console.log('DOM elements loaded:', { htmlEditor, cssEditor, jsEditor, preview });

// Default content
const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <nav>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  
  <main>
    <section id="home">
      <h2>Home Section</h2>
      <p>Start building your amazing website here!</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2025 My Website</p>
  </footer>
</body>
</html>`;

const defaultCSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

section {
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 10px;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 1.5rem;
}`;

const defaultJS = `document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded!');
});`;

// Initialize
function init() {
  loadFromStorage();
  setupEventListeners();
  setupEmojis();
  startAutoSave();
  updateProjectsList();
  updatePreview();
}

function loadFromStorage() {
  const saved = localStorage.getItem('currentProject');
  if (saved) {
    const data = JSON.parse(saved);
    htmlEditor.value = data.html || defaultHTML;
    cssEditor.value = data.css || defaultCSS;
    jsEditor.value = data.js || defaultJS;
    document.getElementById('projectName').textContent = data.name || 'Untitled Project';
  } else {
    htmlEditor.value = defaultHTML;
    cssEditor.value = defaultCSS;
    jsEditor.value = defaultJS;
  }
  
  // Initialize history
  addToHistory('html');
  addToHistory('css');
  addToHistory('js');
}

function setupEventListeners() {
  htmlEditor.addEventListener('input', () => {
    addToHistory('html');
    updatePreview();
  });
  cssEditor.addEventListener('input', () => {
    addToHistory('css');
    updatePreview();
  });
  jsEditor.addEventListener('input', () => {
    addToHistory('js');
    updatePreview();
  });
}

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    const data = {
      name: document.getElementById('projectName').textContent,
      html: htmlEditor.value,
      css: cssEditor.value,
      js: jsEditor.value
    };
    localStorage.setItem('currentProject', JSON.stringify(data));
    document.getElementById('autoSaveStatus').textContent = '✅ Auto-saved';
  }, 5000);
}

function addToHistory(type) {
  const editor = type === 'html' ? htmlEditor : type === 'css' ? cssEditor : jsEditor;
  const value = editor.value;
  
  // Remove future history if we're not at the end
  history[type] = history[type].slice(0, historyIndex[type] + 1);
  
  // Add new state
  history[type].push(value);
  historyIndex[type] = history[type].length - 1;
  
  // Limit history size
  if (history[type].length > 50) {
    history[type].shift();
    historyIndex[type]--;
  }
}

function undo() {
  if (historyIndex[currentTab] > 0) {
    historyIndex[currentTab]--;
    const editor = currentTab === 'html' ? htmlEditor : currentTab === 'css' ? cssEditor : jsEditor;
    editor.value = history[currentTab][historyIndex[currentTab]];
    updatePreview();
  }
}

function redo() {
  if (historyIndex[currentTab] < history[currentTab].length - 1) {
    historyIndex[currentTab]++;
    const editor = currentTab === 'html' ? htmlEditor : currentTab === 'css' ? cssEditor : jsEditor;
    editor.value = history[currentTab][historyIndex[currentTab]];
    updatePreview();
  }
}

function updatePreview() {
  const html = htmlEditor.value;
  const css = cssEditor.value;
  const js = jsEditor.value;

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>
        ${html.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>/gi, '')}
        <script>${js}<\/script>
      </body>
    </html>
  `;

  preview.srcdoc = content;
}

function switchTab(tab) {
  currentTab = tab;
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  
  // Find and activate the clicked tab
  tabs.forEach(t => {
    if (t.textContent.toLowerCase() === tab) {
      t.classList.add('active');
    }
  });

  htmlEditor.style.display = tab === 'html' ? 'block' : 'none';
  cssEditor.style.display = tab === 'css' ? 'block' : 'none';
  jsEditor.style.display = tab === 'js' ? 'block' : 'none';
}

function switchView(view) {
  const editorSection = document.getElementById('editorSection');
  const previewSection = document.getElementById('previewSection');
  const viewBtns = document.querySelectorAll('.view-btn');

  viewBtns.forEach(btn => btn.classList.remove('active'));

  if (view === 'editor') {
    editorSection.classList.remove('hidden');
    previewSection.classList.remove('active');
    viewBtns[0].classList.add('active');
  } else {
    editorSection.classList.add('hidden');
    previewSection.classList.add('active');
    viewBtns[1].classList.add('active');
    updatePreview();
  }
}

function openModal(id) {
  document.getElementById(id + 'Modal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id + 'Modal').classList.remove('active');
}

function insertElement(type) {
  const editor = htmlEditor;
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
      text = '<img src="https://via.placeholder.com/400" alt="Description">\n';
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

function formatCode() {
  const editor = currentTab === 'html' ? htmlEditor : currentTab === 'css' ? cssEditor : jsEditor;
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

function insertColor() {
  const color = document.getElementById('colorPicker').value;
  const editor = currentTab === 'css' ? cssEditor : htmlEditor;
  const pos = editor.selectionStart;
  editor.value = editor.value.substring(0, pos) + color + editor.value.substring(pos);
  editor.focus();
  addToHistory(currentTab);
  updatePreview();
  closeModal('tools');
}

function applyFont() {
  const font = document.getElementById('fontSelector').value;
  const pos = cssEditor.value.indexOf('font-family:');
  if (pos !== -1) {
    const end = cssEditor.value.indexOf(';', pos);
    cssEditor.value = cssEditor.value.substring(0, pos) + 
                     `font-family: ${font}` + 
                     cssEditor.value.substring(end);
  } else {
    cssEditor.value = `body {\n  font-family: ${font};\n}\n\n` + cssEditor.value;
  }
  addToHistory('css');
  updatePreview();
}

function applyColorScheme(scheme) {
  const schemes = {
    purple: { primary: '#667eea', secondary: '#764ba2' },
    blue: { primary: '#3b82f6', secondary: '#1d4ed8' },
    green: { primary: '#10b981', secondary: '#059669' },
    red: { primary: '#ef4444', secondary: '#dc2626' },
    dark: { primary: '#1a1a2e', secondary: '#16213e' },
    light: { primary: '#f8f9fa', secondary: '#e9ecef' },
    sunset: { primary: '#fbbf24', secondary: '#f59e0b' },
    pink: { primary: '#ec4899', secondary: '#db2777' }
  };
  
  const colors = schemes[scheme];
  cssEditor.value = cssEditor.value.replace(/#667eea/g, colors.primary);
  cssEditor.value = cssEditor.value.replace(/#764ba2/g, colors.secondary);
  
  addToHistory('css');
  updatePreview();
  closeModal('tools');
  alert('✅ Color scheme applied!');
}

function setupEmojis() {
  const emojis = ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','❤️','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','🔥','✨','💫','⭐','🌟','✅','❌','⚡','💡','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','👍','👎','👌','🤟','🤘','👏','🙌','👐','🤲','🤝','🙏'];
  
  const grid = document.getElementById('emojiGrid');
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.onclick = () => {
      const editor = htmlEditor;
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

function saveProject() {
  const name = document.getElementById('projectNameInput').value || 'Untitled';
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  
  const project = {
    id: Date.now(),
    name: name,
    html: htmlEditor.value,
    css: cssEditor.value,
    js: jsEditor.value,
    date: new Date().toLocaleDateString()
  };
  
  projects.push(project);
  localStorage.setItem('projects', JSON.stringify(projects));
  document.getElementById('projectName').textContent = name;
  
  updateProjectsList();
  alert('✅ Project saved!');
}

function updateProjectsList() {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const list = document.getElementById('projectsList');
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
        <button class="btn-primary" style="padding: 0.5rem 0.8rem;" onclick="loadProject(${project.id})">Load</button>
        <button class="btn-red" style="padding: 0.5rem 0.8rem;" onclick="deleteProject(${project.id})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function loadProject(id) {
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  const project = projects.find(p => p.id === id);
  
  if (project) {
    htmlEditor.value = project.html;
    cssEditor.value = project.css;
    jsEditor.value = project.js;
    document.getElementById('projectName').textContent = project.name;
    
    addToHistory('html');
    addToHistory('css');
    addToHistory('js');
    updatePreview();
    closeModal('projects');
    alert('✅ Project loaded!');
  }
}

function deleteProject(id) {
  if (confirm('Delete this project?')) {
    let projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(projects));
    updateProjectsList();
  }
}

function exportProject() {
  const data = {
    name: document.getElementById('projectName').textContent,
    html: htmlEditor.value,
    css: cssEditor.value,
    js: jsEditor.value
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

function importProject(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        htmlEditor.value = data.html || '';
        cssEditor.value = data.css || '';
        jsEditor.value = data.js || '';
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

function downloadWebsite() {
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.getElementById('projectName').textContent}</title>
  <style>
${cssEditor.value}
  </style>
</head>
<body>
${htmlEditor.value.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>|<\/head>|<body[^>]*>|<\/body>/gi, '')}
  <script>
${jsEditor.value}
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

// Templates
function loadTemplate(template) {
  const templates = {
    basic: {
      html: defaultHTML,
      css: defaultCSS
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
    },
    restaurant: {
      html: `<header><h1>🍕 Bella Italia</h1><p>Authentic Italian Cuisine</p></header><section class="menu"><h2>Menu</h2><div class="menu-item"><h3>Margherita Pizza - $12</h3><p>Fresh mozzarella, tomatoes, basil</p></div><div class="menu-item"><h3>Pasta Carbonara - $14</h3><p>Creamy sauce with bacon</p></div></section>`,
      css: `body { font-family: Arial; background: #fef6e4; } header { background: #f25c54; color: white; padding: 3rem; text-align: center; } .menu { max-width: 800px; margin: 2rem auto; padding: 2rem; } .menu-item { background: white; padding: 1.5rem; margin: 1rem 0; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }`
    },
    resume: {
      html: `<header><h1>Jane Smith</h1><p>Full Stack Developer</p><p>📧 jane@email.com | 📱 (555) 123-4567</p></header><section><h2>Experience</h2><div class="job"><h3>Senior Developer</h3><p>Tech Corp | 2020-2025</p><p>Built amazing things...</p></div></section><section><h2>Skills</h2><p>JavaScript, React, Node.js, Python</p></section>`,
      css: `body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 2rem; background: white; color: #333; } header { text-align: center; padding-bottom: 2rem; border-bottom: 2px solid #333; } h1 { font-size: 2.5rem; margin-bottom: 0.5rem; } section { margin: 2rem 0; } h2 { color: #667eea; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; } .job { margin: 1.5rem 0; }`
    },
    gallery: {
      html: `<header><h1>📸 Photo Gallery</h1></header><div class="gallery"><img src="https://via.placeholder.com/400x300" alt="Photo 1"><img src="https://via.placeholder.com/400x300" alt="Photo 2"><img src="https://via.placeholder.com/400x300" alt="Photo 3"><img src="https://via.placeholder.com/400x300" alt="Photo 4"></div>`,
      css: `body { font-family: Arial; background: #1a1a2e; color: white; } header { text-align: center; padding: 2rem; } .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; padding: 2rem; max-width: 1200px; margin: 0 auto; } .gallery img { width: 100%; border-radius: 10px; transition: transform 0.3s; } .gallery img:hover { transform: scale(1.05); }`
    }
  };
  
  const temp = templates[template];
  if (temp) {
    htmlEditor.value = temp.html;
    cssEditor.value = temp.css;
    jsEditor.value = defaultJS;
    addToHistory('html');
    addToHistory('css');
    updatePreview();
    closeModal('templates');
    alert('✅ Template loaded!');
  }
}

// Snippets
function insertSnippet(snippet) {
  const snippets = {
    navbar: '<nav class="navbar">\n  <a href="#home">Home</a>\n  <a href="#about">About</a>\n  <a href="#services">Services</a>\n  <a href="#contact">Contact</a>\n</nav>',
    hero: '<section class="hero">\n  <h1>Welcome to My Site</h1>\n  <p>Subtitle goes here</p>\n  <button>Call to Action</button>\n</section>',
    footer: '<footer>\n  <p>&copy; 2025 Your Name. All rights reserved.</p>\n  <div class="social">\n    <a href="#">Facebook</a>\n    <a href="#">Twitter</a>\n    <a href="#">Instagram</a>\n  </div>\n</footer>',
    form: '<form>\n  <input type="text" placeholder="Name" required>\n  <input type="email" placeholder="Email" required>\n  <textarea placeholder="Message" required></textarea>\n  <button type="submit">Send</button>\n</form>',
    card: '<div class="card">\n  <img src="https://via.placeholder.com/300" alt="Card image">\n  <h3>Card Title</h3>\n  <p>Card description goes here</p>\n  <button>Learn More</button>\n</div>',
    grid: '<div class="image-grid">\n  <img src="https://via.placeholder.com/300" alt="Image 1">\n  <img src="https://via.placeholder.com/300" alt="Image 2">\n  <img src="https://via.placeholder.com/300" alt="Image 3">\n  <img src="https://via.placeholder.com/300" alt="Image 4">\n</div>',
    'button-styles': '.button {\n  padding: 1rem 2rem;\n  border: none;\n  border-radius: 5px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.3s;\n}\n\n.button:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 8px rgba(0,0,0,0.2);\n}',
    animations: '@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.fade-in {\n  animation: fadeIn 1s ease-in;\n}\n\n@keyframes slideIn {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n.slide-in {\n  animation: slideIn 0.5s ease-out;\n}'
  };
  
  const code = snippets[snippet];
  if (code) {
    const editor = snippet.includes('styles') || snippet.includes('animations') ? cssEditor : htmlEditor;
    const type = snippet.includes('styles') || snippet.includes('animations') ? 'css' : 'html';
    const pos = editor.selectionStart;
    editor.value = editor.value.substring(0, pos) + '\n' + code + '\n' + editor.value.substring(pos);
    editor.focus();
    addToHistory(type);
    updatePreview();
    closeModal('snippets');
    alert('✅ Snippet inserted!');
  }
}

// Initialize on load
init();
