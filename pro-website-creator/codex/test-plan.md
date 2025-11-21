# Codex Extension Test Plan

## Overview
Testing Codex VS Code extension features for context management, collaboration, and code annotation.

---

## Test Environment Setup

### Prerequisites
- [ ] VS Code installed
- [ ] Codex extension installed from marketplace
- [ ] Git repository initialized
- [ ] Team members added (if testing collaboration features)
- [ ] Slack integration configured (optional)

---

## Test Cases

### 1. Context Management at Code Block Level

#### TC-001: Add Context to Code Block
- **Objective**: Verify context can be added to specific code blocks
- **Steps**:
  1. Open a JavaScript/TypeScript file
  2. Select a function or code block
  3. Add context annotation using Codex
  4. Verify context is saved and visible
- **Expected**: Context appears inline with code block
- **Status**: ⬜ Not Started

#### TC-002: View Context While Coding
- **Objective**: Verify context is accessible when needed
- **Steps**:
  1. Navigate to a file with existing Codex context
  2. Hover over or click on annotated code blocks
  3. Verify context displays properly
- **Expected**: Context shows at the exact code location
- **Status**: ⬜ Not Started

---

### 2. IDE Question Feature

#### TC-003: Ask Question from IDE
- **Objective**: Test asking questions directly from code
- **Steps**:
  1. Select a code block
  2. Use Codex to ask a question about the code
  3. Verify question is saved and visible to team
- **Expected**: Question is logged and accessible
- **Status**: ⬜ Not Started

#### TC-004: Answer Question and Reduce PR Cycles
- **Objective**: Verify Q&A reduces back-and-forth in PRs
- **Steps**:
  1. Ask a question about implementation
  2. Have teammate answer inline
  3. Verify answer is linked to exact code location
  4. Compare to traditional PR comment workflow
- **Expected**: Faster resolution than PR comments
- **Status**: ⬜ Not Started

---

### 3. Custom Labels System

#### TC-005: Create Custom Labels
- **Objective**: Test creating and managing custom labels
- **Steps**:
  1. Create label: "Bug" 🐛
  2. Create label: "Tech Debt" 💳
  3. Create label: "Security" 🔒
  4. Create label: "Performance" ⚡
  5. Create label: "Documentation" 📝
- **Expected**: All labels created and available
- **Status**: ⬜ Not Started

#### TC-006: Apply Labels to Code
- **Objective**: Verify labels can be applied to annotations
- **Steps**:
  1. Add context with "Bug" label
  2. Add context with "Tech Debt" label
  3. Add context with "Security" label
  4. Verify labels are visible and color-coded
- **Expected**: Labels clearly identify issue types
- **Status**: ⬜ Not Started

#### TC-007: Filter by Labels
- **Objective**: Test label-based filtering
- **Steps**:
  1. Filter annotations by "Bug"
  2. Filter annotations by "Security"
  3. Filter by multiple labels
  4. Verify correct results
- **Expected**: Search returns only matching labeled items
- **Status**: ⬜ Not Started

---

### 4. Search Experience

#### TC-008: Search by Keyword
- **Objective**: Test searching for context by keywords
- **Steps**:
  1. Add context with keywords: "authentication", "API", "database"
  2. Search for "authentication"
  3. Search for "API"
  4. Verify results are relevant
- **Expected**: Finds all matching context entries
- **Status**: ⬜ Not Started

#### TC-009: Search by Label
- **Objective**: Verify label-based search works
- **Steps**:
  1. Search for all "Bug" items
  2. Search for all "Security" items
  3. Verify results
- **Expected**: Returns correctly filtered results
- **Status**: ⬜ Not Started

#### TC-010: Search by Author/Code Owner
- **Objective**: Test searching by who created context
- **Steps**:
  1. Search for context created by specific user
  2. Search for questions asked by code owner
  3. Verify results
- **Expected**: Returns user-specific context
- **Status**: ⬜ Not Started

---

### 5. Deep Link Notifications

#### TC-011: Notification on Code Owner Question
- **Objective**: Test git blame integration for code ownership
- **Steps**:
  1. Have teammate ask question on code you authored (via git blame)
  2. Verify notification received
  3. Click notification deep link
  4. Verify it opens exact file and code block
- **Expected**: Opens to precise location in code
- **Status**: ⬜ Not Started

#### TC-012: Notification on Answer to Your Question
- **Objective**: Test notifications when questions are answered
- **Steps**:
  1. Ask a question on a code block
  2. Have teammate answer
  3. Verify notification received
  4. Click deep link
- **Expected**: Opens to exact answer location
- **Status**: ⬜ Not Started

#### TC-013: Notification on @Mention
- **Objective**: Test mention notifications
- **Steps**:
  1. Have teammate @mention you in context/question
  2. Verify notification received
  3. Click deep link
- **Expected**: Opens to exact mention location
- **Status**: ⬜ Not Started

---

### 6. Slack Integration

#### TC-014: Slack Context Logging
- **Objective**: Test Slack logs context creation
- **Steps**:
  1. Add new context in IDE
  2. Check Slack channel for notification
  3. Verify message contains summary
  4. Verify deep link is present
- **Expected**: Slack message posted with link
- **Status**: ⬜ Not Started

#### TC-015: Slack Question Logging
- **Objective**: Test Slack logs questions
- **Steps**:
  1. Ask question from IDE
  2. Check Slack for notification
  3. Click deep link in Slack
  4. Verify opens correct location in IDE
- **Expected**: Deep link opens to exact code block
- **Status**: ⬜ Not Started

#### TC-016: Answer Questions from Slack
- **Objective**: Test bidirectional Slack integration
- **Steps**:
  1. Receive question notification in Slack
  2. Click deep link
  3. Answer in IDE
  4. Verify answer appears in Slack
- **Expected**: Answer syncs back to Slack
- **Status**: ⬜ Not Started

---

### 7. Local Line-Tracking

#### TC-017: Context Survives Code Changes
- **Objective**: Test line-tracking beyond git diff
- **Steps**:
  1. Add context to line 50
  2. Add 10 new lines above (shifting to line 60)
  3. Verify context moves with code
  4. Delete 5 lines above
  5. Verify context still tracks correctly
- **Expected**: Context stays with original code block
- **Status**: ⬜ Not Started

#### TC-018: Context Survives Refactoring
- **Objective**: Test tracking through major changes
- **Steps**:
  1. Add context to a function
  2. Rename function
  3. Move function to different file
  4. Verify context follows
- **Expected**: Context maintains link to code
- **Status**: ⬜ Not Started

#### TC-019: Context on Modified Lines
- **Objective**: Test behavior when annotated code is edited
- **Steps**:
  1. Add context to specific code
  2. Modify that exact code
  3. Verify context relationship is maintained
  4. Check if outdated context is flagged
- **Expected**: Context shows as potentially outdated
- **Status**: ⬜ Not Started

---

### 8. Real-World Workflow Tests

#### TC-020: Bug Tracking Workflow
- **Objective**: Use Codex for bug tracking
- **Steps**:
  1. Find a bug in code
  2. Add context with "Bug" label describing issue
  3. Ask question about root cause
  4. Teammate answers
  5. Fix bug
  6. Mark context as resolved
- **Expected**: Complete bug lifecycle tracked
- **Status**: ⬜ Not Started

#### TC-021: Tech Debt Documentation
- **Objective**: Track technical debt
- **Steps**:
  1. Identify code that needs refactoring
  2. Add "Tech Debt" label with description
  3. Add estimate of effort
  4. Track over time
  5. Search all tech debt items
- **Expected**: Easy to find and prioritize tech debt
- **Status**: ⬜ Not Started

#### TC-022: Security Review Workflow
- **Objective**: Document security concerns
- **Steps**:
  1. Review authentication code
  2. Add "Security" labels to concerning areas
  3. Ask questions about security implications
  4. Get expert review via @mentions
  5. Track remediation
- **Expected**: Security issues documented and tracked
- **Status**: ⬜ Not Started

#### TC-023: PR Review Enhancement
- **Objective**: Compare Codex vs traditional PR comments
- **Steps**:
  1. Submit PR with complex changes
  2. Use Codex for questions/context instead of PR comments
  3. Measure response time
  4. Count back-and-forth iterations
  5. Compare to baseline PR process
- **Expected**: Faster review cycle with Codex
- **Status**: ⬜ Not Started

---

## Success Metrics

### Quantitative
- [ ] Context retrieval time < 1 second
- [ ] Deep links open correct location 100% of time
- [ ] Line tracking accuracy > 95% after refactoring
- [ ] PR cycle time reduced by > 30%
- [ ] Question response time improved by > 50%

### Qualitative
- [ ] Team finds context helpful and uses regularly
- [ ] Reduces "where is this documented?" questions
- [ ] Improves code review quality
- [ ] Better knowledge sharing across team
- [ ] Reduces Slack/email noise

---

## Test Scenarios by Project Area

### DevTools Tracker (Current Feature)
- [ ] Add context explaining tracker architecture
- [ ] Label complex event handling as "Tech Debt"
- [ ] Ask questions about iframe communication
- [ ] Track CSS specificity bugs with labels
- [ ] Document reactive Map implementation decisions

### Playwright Tests
- [ ] Label flaky tests as "Bug"
- [ ] Document why certain tests use direct event dispatch
- [ ] Ask questions about frame selectors
- [ ] Track test coverage gaps as "Tech Debt"

### Line Highlighter Module
- [ ] Document why CSS calc is used for line highlighting
- [ ] Ask about cross-browser compatibility
- [ ] Label edge cases as "Bug" or "Security"

---

## Issues & Blockers
- [ ] Unable to access onboarding demo (DNS error) - see issues.md
- [ ] Extension may not be installed yet
- [ ] Need team members for collaboration testing
- [ ] Slack integration requires workspace setup

---

## Notes
- Focus on real use cases from current development
- Test with actual codebase issues (devtools tracking)
- Compare efficiency vs current tools (GitHub comments, Slack threads)
- Document any bugs found in issues.md
- Track time saved vs traditional workflows

---

## Next Steps
1. Install Codex VS Code extension
2. Complete onboarding (once demo link is fixed)
3. Start with basic context addition (TC-001)
4. Progress through test cases systematically
5. Document findings and issues
6. Evaluate if Codex improves team workflow
