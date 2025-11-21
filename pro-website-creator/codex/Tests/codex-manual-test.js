/**
 * Codex Extension Manual Test Script
 * 
 * This file contains code examples to test Codex features.
 * Follow the instructions in each section to test different capabilities.
 */

// =============================================================================
// TEST 1: Context Annotation - Bug Fix Documentation
// =============================================================================
// INSTRUCTIONS:
// 1. Select the function below (lines 16-31)
// 2. Right-click → Codex → "Add Context" (or use Codex command palette)
// 3. Add this context:
//    "This is the FIXED version. Original had throttling logic with setTimeout
//     that caused race conditions. Home → About → Contact sequential tracking
//     failed because lastSentTime checks would fire out of order. Solution:
//     removed throttling entirely, kept only element comparison."
// 4. Label it: 🐛 Bug (Fixed)

function sendInspectionData(element) {
  if (!element) return;
  
  // Simple element comparison prevents duplicates
  if (element === lastInspectedElement) return;
  
  lastInspectedElement = element;
  
  // Send immediately - no throttling
  const data = extractElementData(element);
  if (data) {
    window.parent.postMessage({
      type: 'devtoolsInspect',
      ...data
    }, '*');
  }
}

// =============================================================================
// TEST 2: Security Question
// =============================================================================
// INSTRUCTIONS:
// 1. Select line 45 (the postMessage call)
// 2. Use Codex to ask question: "Is targetOrigin '*' a security risk?"
// 3. Label it: 🔒 Security
// 4. @mention a teammate if available

function examplePostMessage() {
  window.parent.postMessage({
    type: 'devtoolsInspect',
    tag: 'div',
    id: 'content'
  }, '*'); // ⚠️ Is this secure?
}

// =============================================================================
// TEST 3: Tech Debt Documentation
// =============================================================================
// INSTRUCTIONS:
// 1. Select the CSS code comment below (lines 56-62)
// 2. Add context: "TECH DEBT: CSS specificity is fragile. We had to use
//    .split-editor-wrapper textarea.line-highlighted with high specificity
//    to override defaults. Consider CSS modules or scoped styles."
// 3. Label it: 💳 Tech Debt
// 4. Add estimate: 2-4 hours to refactor

/*
CSS Specificity Issue:
.split-editor-wrapper textarea.line-highlighted {
  background: linear-gradient(to right, rgba(255, 255, 0, 0.2) 0%, transparent 100%), #0d1117;
}
*/

// =============================================================================
// TEST 4: Line Tracking Test
// =============================================================================
// INSTRUCTIONS:
// 1. Add context to the function below (line 72)
// 2. Context: "Helper function for Playwright tests - dispatches events directly"
// 3. Insert 10 blank lines ABOVE this function
// 4. Verify context moved down with the code
// 5. Delete those 10 lines
// 6. Verify context moved back up

function triggerHover(page, selector) {
  const frame = page.frame({ url: /about:srcdoc/ });
  return frame.evaluate((sel) => {
    const el = document.querySelector(sel);
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }, selector);
}

// =============================================================================
// TEST 5: Knowledge Transfer - Complex Implementation
// =============================================================================
// INSTRUCTIONS:
// 1. Select the entire section below (lines 88-110)
// 2. Add context explaining WHY we use this approach
// 3. Context: "Playwright's hover() fails on iframes with about:srcdoc that
//    aren't fully visible. Standard .hover() throws 'element not visible'.
//    We bypass this by getting frame reference and dispatching MouseEvent
//    directly. This works because the iframe content is loaded, just not
//    fully visible to Playwright's viewport checks."
// 4. Ask question: "Is there a better way to test iframe interactions?"

async function testIframeTracking() {
  // Get the iframe with about:srcdoc
  const iframe = page.frame({ url: /about:srcdoc/ });
  
  if (!iframe) {
    throw new Error('Preview iframe not found');
  }
  
  // Can't use page.hover() - element not visible
  // await page.hover('h1'); // ❌ This fails
  
  // Must dispatch event directly
  await iframe.evaluate(() => {
    const h1 = document.querySelector('h1');
    const event = new MouseEvent('mouseover', { 
      bubbles: true,
      cancelable: true 
    });
    h1.dispatchEvent(event);
  });
}

// =============================================================================
// TEST 6: Search & Discovery
// =============================================================================
// INSTRUCTIONS:
// After adding all context above:
// 1. Open Codex search
// 2. Search for "throttling" → should find Test 1
// 3. Search for "security" → should find Test 2
// 4. Search for "iframe" → should find Test 5
// 5. Filter by label: "Bug" → should find Test 1
// 6. Filter by label: "Tech Debt" → should find Test 3
// 7. Filter by label: "Security" → should find Test 2

// =============================================================================
// TEST 7: Deep Links
// =============================================================================
// INSTRUCTIONS:
// 1. Create context annotation on any code above
// 2. Get the deep link (Codex should provide this)
// 3. Close this file
// 4. Click the deep link
// 5. Verify: File opens to exact line with context visible

// =============================================================================
// TEST 8: Notifications (Requires Team)
// =============================================================================
// INSTRUCTIONS:
// 1. Add context with @mention to a teammate
// 2. Teammate should receive notification
// 3. Verify notification includes deep link
// 4. Click deep link → should open to exact location

// =============================================================================
// TEST 9: Code Ownership (Git Blame)
// =============================================================================
// INSTRUCTIONS:
// 1. Run: git blame devtools-tracker.js
// 2. Find code you authored
// 3. Have teammate ask question on YOUR code
// 4. Verify: You receive notification (as code owner)

// =============================================================================
// TEST 10: Real-World Workflow
// =============================================================================
// INSTRUCTIONS:
// Complete this workflow:
// 1. Find actual bug in devtools-tracker.js
// 2. Document bug with context + label
// 3. Ask question about root cause
// 4. Get teammate answer (or answer yourself)
// 5. Fix the bug
// 6. Mark context as resolved
// 7. Search for all resolved bugs
// 8. Compare time vs traditional GitHub Issues

// =============================================================================
// RESULTS DOCUMENTATION
// =============================================================================
// After completing all tests, document results in:
// codex/TestResults/manual-test-results.md
//
// Include:
// - Which features worked ✅
// - Which features failed ❌
// - Performance metrics (speed, accuracy)
// - Usability ratings (1-5)
// - Comparison to current workflow
// - Recommendation: Good, Bad, or Great?

module.exports = {
  sendInspectionData,
  triggerHover,
  testIframeTracking
};
