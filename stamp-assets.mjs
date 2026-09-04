#!/usr/bin/env node
/*
 * Stamp CSS/JS references with the current commit hash.
 *
 *   node stamp-assets.mjs        (run after committing, then commit the result)
 *
 * WHY THIS EXISTS
 * ---------------
 * GitHub Pages serves assets with a cache lifetime, so a browser that already
 * holds styles.css keeps using its copy after a deploy. Six separate fixes in
 * one session were reported as broken while the server was already serving
 * them. The answer each time was "hard refresh", which is not a fix: it asks
 * the visitor to compensate for the site, and leaves nobody able to tell
 * whether what they are looking at is current.
 *
 * A changing query string makes the URL itself new, so the stale copy cannot
 * be reused. The commit hash rather than a timestamp, so caching still works
 * between deploys and only a real change busts it.
 *
 * NO REGULAR EXPRESSIONS HERE, deliberately. Two earlier versions of this file
 * were written through a shell heredoc that swallowed their backslashes and
 * produced an invalid regex at run time. Plain string scanning has nothing to
 * escape and cannot fail that way.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const version = execSync('git rev-parse --short HEAD').toString().trim();
const assets = ['styles.css', 'mode-styles.css', 'config.js', 'script.js', 'projects.js', 'themes.js'];
const pages = ['index.html', 'article.html', 'projects.html'];

function stampOne(html, asset, version) {
  const QUOTES = ['"', "'"];
  let out = '';
  let i = 0;
  let count = 0;

  for (;;) {
    const at = html.indexOf(asset, i);
    if (at === -1) { out += html.slice(i); break; }

    // Only a reference that opens with a quote: skips the same name appearing
    // in prose, in a comment, or as part of a longer filename.
    const prev = html.charAt(at - 1);
    const next = html.charAt(at + asset.length);
    const isReference = QUOTES.indexOf(prev) !== -1 &&
                        (QUOTES.indexOf(next) !== -1 || next === '?');
    if (!isReference) {
      out += html.slice(i, at + asset.length);
      i = at + asset.length;
      continue;
    }

    let after = at + asset.length;
    if (html.startsWith('?v=', after)) {
      while (after < html.length && QUOTES.indexOf(html.charAt(after)) === -1) { after++; }
    }

    out += html.slice(i, at) + asset + '?v=' + version;
    i = after;
    count++;
  }

  return { html: out, count: count };
}

let total = 0;
for (const page of pages) {
  let html = readFileSync(page, 'utf8');
  let n = 0;
  for (const asset of assets) {
    const result = stampOne(html, asset, version);
    html = result.html;
    n += result.count;
  }
  writeFileSync(page, html);
  total += n;
  console.log('  ' + page + ': ' + n + ' refs -> ?v=' + version);
}
console.log('');
console.log(total + ' references stamped. Commit the result.');
