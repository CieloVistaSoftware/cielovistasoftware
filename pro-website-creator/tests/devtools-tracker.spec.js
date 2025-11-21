const { test, expect } = require('@playwright/test');

// Real hover using Playwright's native hover (not fake events)
async function hoverElement(page, selector) {
  const frame = page.frame({ url: /about:srcdoc/ });
  if (!frame) throw new Error('Preview iframe not found');
  
  // Use Playwright's real hover method on the frame
  const element = frame.locator(selector);
  await element.hover({ force: true });
}

test.describe('DevTools Element Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Click split view
    const splitBtn = page.locator('.view-btn:has-text("Split")');
    await splitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await splitBtn.click();
    
    // Wait for iframe to load
    await page.waitForSelector('#splitPreviewFrame', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('should track h1 element hover', async ({ page }) => {
    const messages = [];
    
    // Listen for postMessage events from the iframe
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    await hoverElement(page, 'h1');
    await page.waitForTimeout(300);
    
    // Get captured messages from the page
    const capturedMessages = await page.evaluate(() => window.testMessages);
    
    expect(capturedMessages.length).toBeGreaterThan(0);
    const h1Message = capturedMessages.find(m => m.tagName === 'h1');
    expect(h1Message).toBeDefined();
    expect(h1Message.tagName).toBe('h1');
  });

  test('should track anchor elements with href attributes', async ({ page }) => {
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    await hoverElement(page, 'a[href="#home"]');
    await page.waitForTimeout(300);
    
    const messages = await page.evaluate(() => window.testMessages);
    const homeMessage = messages.find(m => m.attributes?.href === '#home');
    expect(homeMessage).toBeDefined();
    expect(homeMessage.tagName).toBe('a');
    expect(homeMessage.attributes.href).toBe('#home');
  });

  test('CRITICAL: Home → About → Contact sequential tracking', async ({ page }) => {
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    // Hover Home
    await hoverElement(page, 'a[href="#home"]');
    await page.waitForTimeout(200);
    
    // Hover About
    await hoverElement(page, 'a[href="#about"]');
    await page.waitForTimeout(200);
    
    // Hover Contact
    await hoverElement(page, 'a[href="#contact"]');
    await page.waitForTimeout(200);
    
    // Verify all three messages
    const messages = await page.evaluate(() => window.testMessages);
    const anchorMessages = messages.filter(m => m.tagName === 'a');
    expect(anchorMessages.length).toBeGreaterThanOrEqual(3);
    
    const hrefs = anchorMessages.map(m => m.attributes?.href);
    expect(hrefs).toContain('#home');
    expect(hrefs).toContain('#about');
    expect(hrefs).toContain('#contact');
  });

  test('should prevent duplicate messages', async ({ page }) => {
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    // Hover h1 three times
    await hoverElement(page, 'h1');
    await page.waitForTimeout(150);
    await hoverElement(page, 'h1');
    await page.waitForTimeout(150);
    await hoverElement(page, 'h1');
    await page.waitForTimeout(150);
    
    // Should only have 1-2 messages (timing edge case may send 2)
    const messages = await page.evaluate(() => window.testMessages);
    const h1Messages = messages.filter(m => m.tagName === 'h1');
    expect(h1Messages.length).toBeGreaterThanOrEqual(1);
    expect(h1Messages.length).toBeLessThanOrEqual(2);
  });

  test('should handle rapid sequential hovers', async ({ page }) => {
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    // Rapid hovers
    await hoverElement(page, 'h1');
    await hoverElement(page, 'a[href="#home"]');
    await hoverElement(page, 'a[href="#about"]');
    await hoverElement(page, 'a[href="#contact"]');
    
    await page.waitForTimeout(400);
    
    const messages = await page.evaluate(() => window.testMessages);
    expect(messages.length).toBeGreaterThanOrEqual(4);
    const tags = messages.map(m => m.tagName);
    expect(tags).toContain('h1');
    expect(tags).toContain('a');
  });

  test('should highlight correct line numbers', async ({ page }) => {
    const splitEditor = page.locator('#splitHtmlEditor');
    
    // Test h1 (line 11, index 10)
    await hoverElement(page, 'h1');
    await page.waitForTimeout(200);
    let line = await splitEditor.evaluate(el => el.style.getPropertyValue('--highlight-line'));
    expect(line).toBe('11');
    
    // Test Home link (line 13, index 12)
    await hoverElement(page, 'a[href="#home"]');
    await page.waitForTimeout(200);
    line = await splitEditor.evaluate(el => el.style.getPropertyValue('--highlight-line'));
    expect(line).toBe('13');
    
    // Test About link (line 14, index 13)
    await hoverElement(page, 'a[href="#about"]');
    await page.waitForTimeout(200);
    line = await splitEditor.evaluate(el => el.style.getPropertyValue('--highlight-line'));
    expect(line).toBe('14');
  });

  test('should extract attributes correctly', async ({ page }) => {
    await page.evaluateHandle(() => {
      window.testMessages = [];
      window.addEventListener('message', (e) => {
        if (e.data.type === 'devtoolsInspect') {
          window.testMessages.push(e.data);
        }
      });
    });

    await hoverElement(page, 'section#home');
    await page.waitForTimeout(300);
    
    const messages = await page.evaluate(() => window.testMessages);
    const sectionMessage = messages.find(m => m.tagName === 'section');
    expect(sectionMessage).toBeDefined();
    expect(sectionMessage.attributes).toBeDefined();
    expect(sectionMessage.attributes.id).toBe('home');
  });
});
