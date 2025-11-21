# Codex Issues

## First-Time Testing Issues

### Date: November 20, 2025

---

## Issues Log

### Issue #1: Booking Demo Link Not Accessible
- **Date**: November 20, 2025, 19:59 UTC
- **Status**: ❌ Blocked
- **URL**: https://usecodex.com/r/book-demo
- **Problem**: 
  - Cloudflare Error 1016 - Origin DNS error
  - Website (usecodex.com) cannot be resolved
  - Unable to access the recommended 15-minute onboarding session booking page
- **Error Details**:
  - Error: "Cloudflare is currently unable to resolve your requested domain (usecodex.com)"
  - Cloudflare Ray ID: 9a1a869eaad4ebb8
- **Impact**: Cannot schedule onboarding session with founders
- **Next Steps**:
  - Try again later (DNS issue may be temporary)
  - Check if there's an alternative booking link
  - Contact Codex support through alternative channels if available

---

### Issue #2: Codex Extension Activation Confusion
- **Date**: November 20, 2025, 21:10 UTC
- **Status**: ⚠️ In Progress
- **Problem**:
  - Codex features (context annotations, inline questions) could not be activated inside VS Code using the OpenAI ChatGPT extension
  - Workflow works inside GitHub Copilot Chat, but Codex commands are missing when using the official OpenAI extension
  - `ChatGPT: Login` flow was cancelled and the extension does not recognize the existing `OPENAI_API_KEY`
- **Impact**: Cannot evaluate Codex features as planned (no context annotations, no Q&A at code level)
- **Troubleshooting Done**:
  - Verified `OPENAI_API_KEY` exists in environment variables
  - Installed `openai.chatgpt` extension successfully
  - Created test harness (`codex/Tests/test-codex-api.js`) to hit OpenAI API directly; it fails because the provided key is rejected
- **Next Steps**:
  - Re-run `ChatGPT: Login` and complete the OAuth flow using the ChatGPT Pro account
  - Generate a new API key from https://platform.openai.com/api-keys and update `OPENAI_API_KEY`
  - After successful auth, retry Codex commands and document results in `codex/TestResults/manual-test-results.md`

---

