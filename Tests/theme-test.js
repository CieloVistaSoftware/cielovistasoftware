// All themes to test - will be loaded from iframe
let themesToTest = [];
let themes = {};

// Expected CSS variables for each theme (using same data)
let themeExpectedValues = {};

let testResults = {};
let currentTestIndex = 0;
let isTestRunning = false;
let testInterval;

// Load themes from iframe
function loadThemesFromIframe() {
    const iframe = document.getElementById('test-iframe');
    
    if (!iframe) {
        console.error('Iframe not found');
        return false;
    }
    
    const iframeWindow = iframe.contentWindow;
    
    if (!iframeWindow) {
        console.error('Iframe window not accessible');
        return false;
    }
    
    // Check if script.js has loaded in the iframe
    if (!iframeWindow.themes) {
        console.error('Themes not found in iframe window');
        return false;
    }
    
    themes = iframeWindow.themes;
    themesToTest = Object.keys(themes);
    
    // Build expected values
    themeExpectedValues = {};
    Object.keys(themes).forEach(themeName => {
        const theme = themes[themeName];
        themeExpectedValues[themeName] = {
            '--bg-primary': theme.bgPrimary,
            '--bg-secondary': theme.bgSecondary,
            '--bg-card': theme.bgCard,
            '--bg-header': theme.bgHeader,
            '--text-primary': theme.textPrimary,
            '--text-secondary': theme.textSecondary,
            '--text-paragraph': theme.textParagraph,
            '--accent-color': theme.accentColor,
            '--accent-hover': theme.accentHover,
            '--border-color': theme.borderColor,
            '--hero-gradient-start': theme.heroGradientStart,
            '--hero-gradient-end': theme.heroGradientEnd
        };
    });
    
    console.log(`✅ Loaded ${themesToTest.length} themes from iframe`);
    return true;
}

// Initialize test results
function initializeTests() {
    console.log('Initializing tests...');
    
    // Load themes from iframe first
    if (!loadThemesFromIframe()) {
        console.error('Failed to load themes, retrying...');
        setTimeout(initializeTests, 500);
        return;
    }
    
    const resultsContainer = document.getElementById('test-results');
    
    if (!resultsContainer) {
        console.error('Results container not found!');
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    themesToTest.forEach(theme => {
        testResults[theme] = {
            status: 'pending',
            errors: []
        };
        
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.id = `test-${theme}`;
        testItem.style.display = 'none'; // Hide by default
        testItem.innerHTML = `
            <div>
                <strong>${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</strong>
                <div class="error-details" id="error-${theme}" style="display: none;"></div>
            </div>
            <span class="test-status status-pending" id="status-${theme}">PENDING</span>
        `;
        resultsContainer.appendChild(testItem);
    });
    
    console.log(`Initialized ${themesToTest.length} test items`);
}

// Update test status in UI
function updateTestStatus(theme, status, errors = []) {
    const testItem = document.getElementById(`test-${theme}`);
    const statusSpan = document.getElementById(`status-${theme}`);
    const errorDiv = document.getElementById(`error-${theme}`);
    
    if (!testItem || !statusSpan || !errorDiv) {
        console.warn(`UI elements not found for theme: ${theme}`);
        return;
    }
    
    testItem.className = `test-item ${status}`;
    statusSpan.className = `test-status status-${status}`;
    statusSpan.textContent = status.toUpperCase();
    
    if (errors.length > 0) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = errors.map(err => `❌ ${err}`).join('<br>');
    } else {
        errorDiv.style.display = 'none';
    }
    
    // Show only the current test (testing) or completed tests (passed/failed)
    if (status === 'testing') {
        // Hide all other items
        themesToTest.forEach(t => {
            const item = document.getElementById(`test-${t}`);
            if (item) {
                item.style.display = t === theme ? 'flex' : 'none';
            }
        });
    } else if (status === 'passed' || status === 'failed') {
        // Keep completed test visible
        testItem.style.display = 'flex';
    }
    
    updateSummary();
}

// Update summary statistics
function updateSummary() {
    const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
    const pending = Object.values(testResults).filter(r => r.status === 'pending').length;
    
    document.getElementById('passed-count').textContent = passed;
    document.getElementById('failed-count').textContent = failed;
    document.getElementById('pending-count').textContent = pending;
}

// Test a single theme
function testTheme(themeName) {
    return new Promise((resolve) => {
        console.log(`🔍 Testing: ${themeName}`);
        
        const iframe = document.getElementById('test-iframe');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeWindow = iframe.contentWindow;
        
        updateTestStatus(themeName, 'testing');
        
        // Scroll the test item into view
        const testItem = document.getElementById(`test-${themeName}`);
        if (testItem) {
            testItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        try {
            // Get the theme dropdown
            const themeDropdown = iframeDoc.getElementById('themeDropdown');
            if (!themeDropdown) {
                throw new Error('Theme dropdown not found');
            }
            
            console.log(`  📝 Current theme: ${themeDropdown.value} → Changing to: ${themeName}`);
            
            // Change theme
            themeDropdown.value = themeName;
            const event = new Event('change', { bubbles: true });
            themeDropdown.dispatchEvent(event);
            
            // Scroll iframe to show the theme dropdown
            const header = iframeDoc.querySelector('header');
            if (header) {
                header.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Wait for theme to apply
            setTimeout(() => {
                const errors = [];
                const expectedValues = themeExpectedValues[themeName];
                
                if (!expectedValues) {
                    errors.push(`No expected values defined for theme "${themeName}"`);
                    testResults[themeName] = { status: 'failed', errors: errors };
                    updateTestStatus(themeName, 'failed', errors);
                    resolve();
                    return;
                }
                
                // Check if theme is in dropdown options
                const options = Array.from(themeDropdown.options).map(o => o.value);
                if (!options.includes(themeName)) {
                    errors.push(`Theme "${themeName}" not found in dropdown`);
                }
                
                // Check if theme was selected
                if (themeDropdown.value !== themeName) {
                    errors.push(`Failed to select theme "${themeName}"`);
                }
                
                // Check CSS variables
                const rootStyles = getComputedStyle(iframeDoc.documentElement);
                
                for (const [variable, expectedValue] of Object.entries(expectedValues)) {
                    const actualValue = rootStyles.getPropertyValue(variable).trim();
                    
                    // Normalize colors for comparison (remove spaces, convert to lowercase)
                    const normalizedActual = actualValue.replace(/\s/g, '').toLowerCase();
                    const normalizedExpected = expectedValue.replace(/\s/g, '').toLowerCase();
                    
                    if (normalizedActual !== normalizedExpected) {
                        errors.push(`${variable}: expected "${expectedValue}", got "${actualValue}"`);
                    }
                }
                
                // Scroll iframe to show different sections
                const sections = ['header', '.hero', '#about', '#services', '#contact', 'footer'];
                const sectionIndex = currentTestIndex % sections.length;
                const sectionToShow = iframeDoc.querySelector(sections[sectionIndex]);
                if (sectionToShow) {
                    sectionToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // Check if applyTheme function exists
                if (typeof iframeWindow.applyTheme !== 'function') {
                    console.warn('applyTheme function not found - this is OK if theme changes work');
                    // Don't add to errors - the theme might still work via event listener
                }
                
                // Check if themes object exists
                if (!iframeWindow.themes || !iframeWindow.themes[themeName]) {
                    errors.push(`Theme data for "${themeName}" not found in themes object`);
                }
                
                // Update results
                testResults[themeName] = {
                    status: errors.length === 0 ? 'passed' : 'failed',
                    errors: errors
                };
                
                if (errors.length === 0) {
                    console.log(`  ✅ ${themeName} PASSED`);
                } else {
                    console.log(`  ❌ ${themeName} FAILED:`, errors);
                }
                
                updateTestStatus(themeName, testResults[themeName].status, errors);
                resolve();
            }, 500); // Wait for theme to apply
            
        } catch (error) {
            testResults[themeName] = {
                status: 'failed',
                errors: [error.message]
            };
            updateTestStatus(themeName, 'failed', [error.message]);
            resolve();
        }
    });
}

// Run all tests sequentially
async function runAllTests() {
    console.log('Starting test run...');
    
    if (isTestRunning) {
        console.log('Tests already running');
        return;
    }
    
    // Reload themes from iframe in case they weren't loaded yet
    if (!loadThemesFromIframe()) {
        alert('❌ Could not load themes from the website. Please refresh the page.');
        return;
    }
    
    if (themesToTest.length === 0) {
        alert('❌ No themes found to test. Please refresh the page.');
        return;
    }
    
    // Initialize test UI if not already done
    const resultsContainer = document.getElementById('test-results');
    if (!resultsContainer || !resultsContainer.querySelector('.test-item')) {
        console.log('Initializing test UI...');
        initializeTests();
    }
    
    isTestRunning = true;
    currentTestIndex = 0;
    
    // Update status indicator
    const statusIndicator = document.getElementById('test-status-indicator');
    const statusText = document.getElementById('test-status-text');
    if (statusIndicator && statusText) {
        statusIndicator.className = 'status-indicator running';
        statusText.className = 'status-text running';
        statusText.textContent = 'RUNNING';
    }
    
    // Reset all tests
    themesToTest.forEach(theme => {
        testResults[theme] = {
            status: 'pending',
            errors: []
        };
        updateTestStatus(theme, 'pending');
    });
    
    console.log(`Running ${themesToTest.length} tests...`);
    
    // Run tests one by one
    for (const theme of themesToTest) {
        if (!isTestRunning) break;
        console.log(`Testing theme: ${theme}`);
        await testTheme(theme);
        currentTestIndex++;
    }
    
    isTestRunning = false;
    
    // Update status indicator
    const statusIndicator2 = document.getElementById('test-status-indicator');
    const statusText2 = document.getElementById('test-status-text');
    if (statusIndicator2 && statusText2) {
        statusIndicator2.className = 'status-indicator stopped';
        statusText2.className = 'status-text stopped';
        statusText2.textContent = 'STOPPED';
    }
    
    // Show final summary
    const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
    
    console.log(`Tests complete: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        alert(`✅ All ${passed} theme tests passed!`);
    } else {
        alert(`⚠️ Tests completed: ${passed} passed, ${failed} failed`);
    }
}

// Stop running tests
function stopTests() {
    isTestRunning = false;
    
    // Update status indicator
    const statusIndicator = document.getElementById('test-status-indicator');
    const statusText = document.getElementById('test-status-text');
    if (statusIndicator && statusText) {
        statusIndicator.className = 'status-indicator stopped';
        statusText.className = 'status-text stopped';
        statusText.textContent = 'STOPPED';
    }
}

// Reset all tests
function resetTests() {
    stopTests();
    initializeTests();
    updateSummary();
    
    // Reset iframe to dark theme
    const iframe = document.getElementById('test-iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const themeDropdown = iframeDoc.getElementById('themeDropdown');
    if (themeDropdown) {
        themeDropdown.value = 'dark';
        const event = new Event('change', { bubbles: true });
        themeDropdown.dispatchEvent(event);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    console.log('Test page loaded');
    
    // Wait for iframe to load
    const iframe = document.getElementById('test-iframe');
    
    if (!iframe) {
        console.error('Iframe not found!');
        return;
    }
    
    // Add load event listener to iframe
    iframe.addEventListener('load', () => {
        console.log('Iframe loaded, waiting for scripts...');
        
        // Poll for themes to be available
        let attempts = 0;
        const maxAttempts = 20;
        const checkInterval = setInterval(() => {
            attempts++;
            console.log(`Attempt ${attempts}/${maxAttempts} to load themes...`);
            
            if (loadThemesFromIframe()) {
                clearInterval(checkInterval);
                initializeTests();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('Failed to load themes after', maxAttempts, 'attempts');
                document.getElementById('test-results').innerHTML = '<p style="color: #e74c3c; padding: 20px;">⚠️ Could not load themes from website. Click "Run All Tests" to retry.</p>';
            }
        }, 200);
    });
});
