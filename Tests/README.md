# Theme Functional Tests

## Overview
This folder contains functional tests for the CieloVista Software website theme system.

## Test Files
- `theme-test.html` - Test runner UI
- `theme-test.js` - Test logic and assertions
- `README.md` - This file

## Running the Tests

1. Open `theme-test.html` in a web browser
2. Click the "▶ Run All Tests" button
3. Watch as all 30 themes are tested automatically

## What Gets Tested

For each of the 30 themes, the test suite verifies:

1. **Theme Selection** - Verifies the theme can be selected in the dropdown
2. **CSS Variables** - Checks that critical CSS variables are updated:
   - `--bg-primary` (Primary background color)
   - `--accent-color` (Accent/highlight color)
   - `--text-paragraph` (Paragraph text color)
3. **Theme Data** - Confirms theme configuration exists in the themes object
4. **Theme Function** - Validates the `applyTheme()` function is available

## Test Results

- **Green (PASSED)** - Theme loaded successfully and all CSS variables match expected values
- **Red (FAILED)** - Theme failed one or more checks (details shown in error message)
- **Orange (TESTING)** - Theme is currently being tested
- **Gray (PENDING)** - Theme has not been tested yet

## Summary Statistics

The test summary shows:
- Total number of themes (30)
- Number of tests passed
- Number of tests failed
- Number of tests pending

## Themes Tested

All 30 themes are tested:
- dark, light, ocean, forest, sunset, midnight, crimson, coffee
- slate, mint, lavender, coral, navy, rose, emerald, amber
- indigo, teal, magenta, charcoal, olive, burgundy, turquoise
- peach, steel, lime, plum, sand, cherry, arctic, neon

## Notes

- Tests run sequentially with a 500ms delay between each to allow theme transitions
- Each test loads the main website in an iframe and manipulates the theme dropdown
- The iframe shows a live preview of each theme as it's tested
- Test results are preserved until you click "Reset"
