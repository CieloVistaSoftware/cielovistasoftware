/*
 * Projects index — lists every public repository, live from the GitHub API.
 *
 * Fetched at load rather than baked in at build time, deliberately: a
 * hardcoded list is correct on the day it is written and wrong forever after.
 * This page cannot go stale, and a new repo appears on it without anyone
 * remembering to come back here.
 *
 * The API allows 60 unauthenticated requests per hour per IP. This costs one,
 * and the result is cached in sessionStorage so moving around the site does
 * not spend another.
 */
(function () {
    'use strict';

    var USER = 'CieloVistaSoftware';
    var API = 'https://api.github.com/users/' + USER + '/repos?per_page=100&sort=updated';
    var CACHE_KEY = 'cvs-projects-v1';

    var grid = document.getElementById('projectGrid');
    var status = document.getElementById('projectStatus');
    var search = document.getElementById('projectSearch');
    var forks = document.getElementById('showForks');
    if (!grid) { return; }

    var repos = [];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function when(iso) {
        if (!iso) { return ''; }
        var d = new Date(iso);
        if (isNaN(d)) { return ''; }
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    }

    // A repo with Pages enabled is served at /<name>/ unless it has claimed a
    // custom domain, which the API reports in `homepage`.
    function siteUrl(r) {
        if (!r.has_pages) { return null; }
        if (r.homepage && /^https?:\/\//.test(r.homepage)) { return r.homepage; }
        return 'https://' + USER.toLowerCase() + '.github.io/' + r.name + '/';
    }

    function card(r) {
        var site = siteUrl(r);
        var meta = [r.language, when(r.pushed_at)].filter(Boolean).join(' \u00b7 ');
        return '' +
            '<article class="project-card' + (site ? ' project-card--live' : '') + '">' +
                '<h3>' + esc(r.name) + (r.fork ? ' <span class="project-tag">fork</span>' : '') + '</h3>' +
                '<p class="project-desc">' + esc(r.description || 'No description.') + '</p>' +
                (meta ? '<p class="project-meta">' + esc(meta) + '</p>' : '') +
                '<p class="project-links">' +
                    (site
                        ? '<a class="project-link project-link--site" href="' + esc(site) + '" target="_blank" rel="noopener">Visit site</a>'
                        : '') +
                    '<a class="project-link" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">Source</a>' +
                '</p>' +
            '</article>';
    }

    function render() {
        var q = (search && search.value || '').trim().toLowerCase();
        var list = repos.filter(function (r) {
            if (!forks.checked && r.fork) { return false; }
            if (!q) { return true; }
            return (r.name + ' ' + (r.description || '') + ' ' + (r.language || ''))
                .toLowerCase().indexOf(q) !== -1;
        });

        // Anything with a site first: a visitor here wants to look at something,
        // not read source. Within each group, most recently pushed first.
        list.sort(function (a, b) {
            var as = a.has_pages ? 0 : 1, bs = b.has_pages ? 0 : 1;
            if (as !== bs) { return as - bs; }
            return String(b.pushed_at).localeCompare(String(a.pushed_at));
        });

        grid.innerHTML = list.map(card).join('');

        var live = list.filter(function (r) { return r.has_pages; }).length;
        status.textContent = list.length
            ? list.length + ' project' + (list.length === 1 ? '' : 's') +
              ', ' + live + ' with a live site'
            : 'Nothing matches \u201c' + q + '\u201d.';
    }

    function load(data) {
        repos = data;
        render();
    }

    function fail(msg) {
        status.textContent = msg;
        grid.innerHTML = '<article class="project-card">' +
            '<h3>Browse on GitHub</h3>' +
            '<p class="project-desc">The list could not be loaded, but every project is ' +
            'still available directly.</p>' +
            '<p class="project-links"><a class="project-link project-link--site" ' +
            'href="https://github.com/' + USER + '?tab=repositories">Open GitHub</a></p>' +
            '</article>';
    }

    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { /* private mode */ }

    if (cached && Array.isArray(cached)) {
        load(cached);
    } else {
        fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
            .then(function (res) {
                if (res.status === 403) { throw new Error('rate-limited'); }
                if (!res.ok) { throw new Error('HTTP ' + res.status); }
                return res.json();
            })
            .then(function (data) {
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
                load(data);
            })
            .catch(function (err) {
                fail(err.message === 'rate-limited'
                    ? 'GitHub is rate-limiting this network right now. Try again shortly.'
                    : 'Could not reach GitHub just now.');
            });
    }

    if (search) { search.addEventListener('input', render); }
    if (forks) { forks.addEventListener('change', render); }
})();
