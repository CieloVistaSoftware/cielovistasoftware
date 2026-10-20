/*
 * Projects index — every public repository, live from the GitHub API, one
 * table row each (cielovistasoftware#6).
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
import { centralDate } from 'https://cdn.jsdelivr.net/gh/CieloVistaSoftware/wb-starter@a7d9d012b02b5d65c7f1ff4aad0ab3374788fd39/src/core/central-time.js';

const USER = 'CieloVistaSoftware';
const API = 'https://api.github.com/users/' + USER + '/repos?per_page=100&sort=updated';
const CACHE_KEY = 'cvs-projects-v1';

const body = document.getElementById('projects-body');
const status = document.getElementById('projectStatus');
const search = document.getElementById('projectSearch');
const forks = document.getElementById('showForks');

let repos = [];

// A repo with Pages enabled is served at /<name>/ unless it has claimed a
// custom domain, which the API reports in `homepage`.
function siteUrl(r) {
    if (!r.has_pages) { return null; }
    if (r.homepage && /^https?:\/\//.test(r.homepage)) { return r.homepage; }
    return 'https://' + USER.toLowerCase() + '.github.io/' + r.name + '/';
}

function link(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
}

function row(r) {
    const tr = document.createElement('tr');
    const cell = (content) => {
        const td = tr.insertCell();
        if (typeof content === 'string') { td.textContent = content; } else if (content) { td.append(content); }
        return td;
    };
    const name = cell(link(r.html_url, r.name));
    if (r.fork) { name.append(' (fork)'); }
    cell(r.description || '');
    cell(r.language || '');
    cell(r.pushed_at ? centralDate(r.pushed_at) : '');
    cell(String(r.stargazers_count ?? 0));
    const site = siteUrl(r);
    cell(site ? link(site, 'Visit') : '');
    return tr;
}

function render() {
    const q = search.value.trim().toLowerCase();
    const list = repos.filter((r) => {
        if (!forks.checked && r.fork) { return false; }
        if (!q) { return true; }
        return (r.name + ' ' + (r.description || '') + ' ' + (r.language || '')).toLowerCase().includes(q);
    });

    // Anything with a site first: a visitor here wants to look at something,
    // not read source. Within each group, most recently pushed first.
    list.sort((a, b) => {
        const as = a.has_pages ? 0 : 1, bs = b.has_pages ? 0 : 1;
        if (as !== bs) { return as - bs; }
        return String(b.pushed_at).localeCompare(String(a.pushed_at));
    });

    body.replaceChildren(...list.map(row));

    const live = list.filter((r) => r.has_pages).length;
    status.textContent = list.length
        ? list.length + ' project' + (list.length === 1 ? '' : 's') + ', ' + live + ' with a live site'
        : 'Nothing matches “' + q + '”.';
}

function fail(msg) {
    status.textContent = '';
    const td = body.insertRow().insertCell();
    td.colSpan = 6;
    td.append(msg + ' Every project is still on ', link('https://github.com/' + USER + '?tab=repositories', 'GitHub'), '.');
}

let cached = null;
try { cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); } catch { /* private mode */ }

if (Array.isArray(cached)) {
    repos = cached;
    render();
} else {
    try {
        const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
        if (res.status === 403) { throw new Error('rate-limited'); }
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        repos = await res.json();
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(repos)); } catch { /* ignore */ }
        render();
    } catch (err) {
        fail(err.message === 'rate-limited'
            ? 'GitHub is rate-limiting this network right now. Try again shortly.'
            : 'Could not reach GitHub just now.');
    }
}

search.addEventListener('input', render);
forks.addEventListener('change', render);
