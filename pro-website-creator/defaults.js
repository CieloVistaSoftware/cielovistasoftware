export const defaults = {
  html: `<!DOCTYPE html>
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
</html>`,

  css: `* {
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
}`,

  js: `document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded!');
});`
};
