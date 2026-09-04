#!/usr/bin/env node
/*
 * Stamp CSS/JS references with the current commit hash.
 *
 *   node stamp-assets.mjs        (run after committing, then commit the result)
 *
 * WHY THIS EXISTS
 * ---------------
 * GitHub Pages serves assets with a cache lifetime, so a browser that has
 * loaded styles.css keeps using its copy after a deploy. Every fix in this
 * session -- the navigation, the mode switch, the scroll position, the Clear
 * button -- was reported as "still broken" while the server was already
 * serving the fix. The answer each time was "hard refresh", which is not a
 * fix, it is asking the user to compensate for the site.
 *
 * A changing query string makes the URL itself new, so the browser cannot
 * reuse the old copy. Hash rather than a date: it changes when the code
 * changes and not otherwise, so caching still works between deploys.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const v = execSync('git rev-parse --short HEAD').toString().trim();
const assets = ['styles.css', 'mode-styles.css', 'config.js', 'script.js', 'projects.js', 'themes.js'];
const pages = ['index.html', 'article.html', 'projects.html'];

for (const page of pages) {
  let html = readFileSync(page, 'utf8');
  let n = 0;
  for (const a of assets) {
    const re = new RegExp(`(["'])${a.replace('.', '\.')}(\?v=[^"']*)?(["'])`, 'g');
    html = html.replace(re, (m, q1, _old, q2) => { n++; return `${q1}${a}?v=${v}${q2}`; });
  }
  writeFileSync(page, html);
  console.log(`  ${page}: ${n} refs -> ?v=${v}`);
}
console.log('\nCommit the result. Browsers will fetch fresh copies on the next visit.');
