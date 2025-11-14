// Site Configuration
window.siteConfig = {
    // Mode: 'ad' or 'regular'
    // 'ad' mode - Shows promotional/advertising content (article)
    // 'regular' mode - Shows standard business content
    mode: 'ad',
    
    // Default theme to load
    defaultTheme: 'dark',
    
    // Ad mode specific settings
    adMode: {
        showPromoHeader: true,
        showSpecialOffers: true,
        enableAnalytics: true,
        articlePage: 'article.html'  // Article to show in ad mode
    },
    
    // Regular mode specific settings
    regularMode: {
        showFullNavigation: true,
        enableContactForm: true
    }
};

// Apply configuration on page load
(function() {
    console.log('🔧 Site config loaded - Mode:', window.siteConfig.mode);
    
    // Add mode class to body
    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add(`mode-${window.siteConfig.mode}`);
        console.log('✅ Site mode applied:', window.siteConfig.mode);
        
        // Redirect to article in ad mode
        if (window.siteConfig.mode === 'ad' && 
            window.location.pathname.endsWith('index.html')) {
            window.location.href = window.siteConfig.adMode.articlePage;
        }
    });
})();
