# DevTools Tracker Tests

## Prerequisites
1. Make sure Live Server is running on port 5500
2. Open index.html in Live Server

## Run Tests

```bash
cd c:\Users\jwpmi\Downloads\CieloVistaSoftware\pro-website-creator
npm test
```

## Test Modes

- `npm test` - Run all tests headless
- `npm run test:headed` - Run with browser visible
- `npm run test:debug` - Debug mode with Playwright Inspector
- `npm run test:ui` - Interactive UI mode

## Tests Included

1. **Basic h1 tracking** - Verifies h1 element hover sends message
2. **Anchor tracking** - Verifies anchor elements with href are tracked
3. **Sequential anchors** - Tests Home → About → Contact sequence
4. **Duplicate prevention** - Ensures same element doesn't send multiple messages
5. **Element change detection** - Tests H1 → Home → H1 sequence
6. **Attribute extraction** - Verifies attributes are extracted correctly
7. **Rapid hovers** - Tests rapid sequential hovers
8. **Line highlighting** - Verifies correct line numbers are highlighted
9. **Preview mode** - Tests tracking works in preview (not just split)
10. **CRITICAL: Home → About transition** - The main issue being fixed

## Expected Results

All 13 tests should PASS when DevTools tracking is working correctly.
