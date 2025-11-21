/**
 * Codex API Test Script
 * Tests OpenAI Codex functionality using the API directly
 */

const https = require('https');

const API_KEY = process.env.OPENAI_API_KEY || process.env.OpenAI || process.env.OPENAI;

if (!API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('✅ OpenAI API Key found');
console.log('🔍 Testing Codex functionality...\n');

/**
 * Test 1: Code Explanation
 * Send our actual devtools-tracker.js code and ask for explanation
 */
async function testCodeExplanation() {
  const code = `
function sendInspectionData(element) {
  if (!element) return;
  
  // Check if same element as last time
  if (element === lastInspectedElement) return;
  
  lastInspectedElement = element;
  
  // Send immediately - no throttling needed with element comparison
  const data = extractElementData(element);
  if (data) {
    window.parent.postMessage({
      type: 'devtoolsInspect',
      ...data
    }, '*');
  }
}
  `;

  const prompt = `Analyze this code and explain:
1. What problem does this solve?
2. Why is there no throttling?
3. Is the postMessage with '*' origin a security concern?

Code:
${code}`;

  return callOpenAI(prompt, 'Code Explanation Test');
}

/**
 * Test 2: Bug Detection
 * Ask Codex to find potential issues in our code
 */
async function testBugDetection() {
  const code = `
async function triggerHover(page, selector) {
  const frame = page.frame({ url: /about:srcdoc/ });
  return frame.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }, selector);
}
  `;

  const prompt = `Find potential bugs or issues in this code:
${code}

What could go wrong? What edge cases are missing?`;

  return callOpenAI(prompt, 'Bug Detection Test');
}

/**
 * Test 3: Tech Debt Analysis
 * Ask about technical debt in CSS approach
 */
async function testTechDebtAnalysis() {
  const css = `
.split-editor-wrapper textarea:not(.line-highlighted) {
  background: #0d1117;
}

.split-editor-wrapper textarea.line-highlighted {
  background: linear-gradient(to right, rgba(255, 255, 0, 0.2) 0%, transparent 100%), #0d1117;
}
  `;

  const prompt = `Analyze this CSS for technical debt:
${css}

What are the maintainability concerns? What would be a better approach?`;

  return callOpenAI(prompt, 'Tech Debt Analysis Test');
}

/**
 * Test 4: Security Review
 * Ask about security implications
 */
async function testSecurityReview() {
  const code = `
window.parent.postMessage({
  type: 'devtoolsInspect',
  tag: element.tagName.toLowerCase(),
  id: element.id,
  classes: element.className
}, '*');
  `;

  const prompt = `Review this code for security vulnerabilities:
${code}

Is using '*' as targetOrigin dangerous? What are the risks?`;

  return callOpenAI(prompt, 'Security Review Test');
}

/**
 * Test 5: Code Improvement Suggestions
 */
async function testCodeImprovement() {
  const code = `
// Original throttled version (removed due to bugs)
let lastSentTime = 0;
const THROTTLE_MS = 100;

function sendInspectionData(element) {
  const now = Date.now();
  if (now - lastSentTime < THROTTLE_MS) return;
  lastSentTime = now;
  // send data...
}
  `;

  const prompt = `This throttling approach caused race conditions in sequential operations.
We removed it and used element comparison instead. Was that the right choice?

Code:
${code}

Suggest better alternatives for preventing duplicate sends.`;

  return callOpenAI(prompt, 'Code Improvement Test');
}

/**
 * Call OpenAI API
 */
function callOpenAI(prompt, testName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a senior code reviewer and architect. Provide concise, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 ${testName}`);
    console.log(`${'='.repeat(80)}\n`);

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.error) {
            console.error(`❌ Error: ${response.error.message}`);
            reject(response.error);
            return;
          }

          const answer = response.choices[0].message.content;
          console.log(`📝 Response:\n${answer}\n`);
          
          resolve({
            test: testName,
            success: true,
            response: answer,
            tokens: response.usage
          });
        } catch (error) {
          console.error(`❌ Failed to parse response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Codex API Tests\n');
  console.log('Testing OpenAI API integration for code analysis...\n');

  const results = [];

  try {
    // Test 1: Code Explanation
    const test1 = await testCodeExplanation();
    results.push(test1);
    
    // Test 2: Bug Detection
    const test2 = await testBugDetection();
    results.push(test2);
    
    // Test 3: Tech Debt Analysis
    const test3 = await testTechDebtAnalysis();
    results.push(test3);
    
    // Test 4: Security Review
    const test4 = await testSecurityReview();
    results.push(test4);
    
    // Test 5: Code Improvement
    const test5 = await testCodeImprovement();
    results.push(test5);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    const passed = results.filter(r => r.success).length;
    console.log(`✅ Passed: ${passed}/${results.length}`);
    
    let totalTokens = 0;
    results.forEach(r => {
      if (r.tokens) {
        totalTokens += r.tokens.total_tokens;
        console.log(`\n${r.test}:`);
        console.log(`  - Tokens: ${r.tokens.total_tokens} (prompt: ${r.tokens.prompt_tokens}, completion: ${r.tokens.completion_tokens})`);
      }
    });
    
    console.log(`\n📈 Total tokens used: ${totalTokens}`);
    console.log('\n✅ All tests completed successfully!');
    console.log('\nCodex functionality: ⭐⭐⭐⭐⭐ GREAT');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.log('\nCodex functionality: ❌ BAD');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
