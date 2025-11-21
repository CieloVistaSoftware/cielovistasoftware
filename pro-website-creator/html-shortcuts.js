/**
 * HTML Shortcuts Module
 * Provides Emmet-style abbreviations, tag wrapping, and tag pair renaming
 * @module html-shortcuts
 */

/**
 * Expand Emmet abbreviations
 * @param {string} abbr - The abbreviation to expand
 * @returns {string} The expanded HTML
 */
export function expandEmmet(abbr) {
  abbr = abbr.trim();
  
  // HTML5 boilerplate
  if (abbr === '!' || abbr === 'html:5') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`;
  }
  
  // div.class
  const classMatch = abbr.match(/^(\w+)\.([a-zA-Z0-9_-]+)$/);
  if (classMatch) {
    return `<${classMatch[1]} class="${classMatch[2]}"></${classMatch[1]}>`;
  }
  
  // div#id
  const idMatch = abbr.match(/^(\w+)#([a-zA-Z0-9_-]+)$/);
  if (idMatch) {
    return `<${idMatch[1]} id="${idMatch[2]}"></${idMatch[1]}>`;
  }
  
  // div.class#id or div#id.class
  const classIdMatch = abbr.match(/^(\w+)\.([a-zA-Z0-9_-]+)#([a-zA-Z0-9_-]+)$/) || 
                        abbr.match(/^(\w+)#([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
  if (classIdMatch) {
    const tag = classIdMatch[1];
    const attr1 = classIdMatch[2];
    const attr2 = classIdMatch[3];
    // Determine which is class and which is id
    const hasClassFirst = abbr.indexOf('.') < abbr.indexOf('#');
    const className = hasClassFirst ? attr1 : attr2;
    const idName = hasClassFirst ? attr2 : attr1;
    return `<${tag} class="${className}" id="${idName}"></${tag}>`;
  }
  
  // Multiplication: ul>li*3
  const multiMatch = abbr.match(/^(\w+)>(\w+)\*(\d+)$/);
  if (multiMatch) {
    const parent = multiMatch[1];
    const child = multiMatch[2];
    const count = parseInt(multiMatch[3]);
    let children = '';
    for (let i = 1; i <= count; i++) {
      children += `  <${child}></${child}>\n`;
    }
    return `<${parent}>\n${children}</${parent}>`;
  }
  
  // Table shortcut: table>tr*2>td*3
  const tableMatch = abbr.match(/^table>tr\*(\d+)>td\*(\d+)$/);
  if (tableMatch) {
    const rows = parseInt(tableMatch[1]);
    const cols = parseInt(tableMatch[2]);
    let html = '<table>\n';
    for (let r = 0; r < rows; r++) {
      html += '  <tr>\n';
      for (let c = 0; c < cols; c++) {
        html += '    <td></td>\n';
      }
      html += '  </tr>\n';
    }
    html += '</table>';
    return html;
  }
  
  // Attributes: a[href="#"]
  const attrMatch = abbr.match(/^(\w+)\[([^\]]+)\]$/);
  if (attrMatch) {
    const tag = attrMatch[1];
    const attrs = attrMatch[2];
    const attrPairs = attrs.split(/\s+/).map(attr => {
      if (attr.includes('=')) {
        const [key, val] = attr.split('=');
        return `${key}=${val}`;
      }
      return `${attr}=""`;
    }).join(' ');
    return `<${tag} ${attrPairs}></${tag}>`;
  }
  
  // Simple nesting: div>p
  const nestMatch = abbr.match(/^(\w+)>(\w+)$/);
  if (nestMatch) {
    return `<${nestMatch[1]}>\n  <${nestMatch[2]}></${nestMatch[2]}>\n</${nestMatch[1]}>`;
  }
  
  // Sibling: div+p
  const siblingMatch = abbr.match(/^(\w+)\+(\w+)$/);
  if (siblingMatch) {
    return `<${siblingMatch[1]}></${siblingMatch[1]}>\n<${siblingMatch[2]}></${siblingMatch[2]}>`;
  }
  
  return null;
}

/**
 * Wrap selected text in HTML tags
 * @param {string} text - The text to wrap
 * @param {string} tagName - The tag name to wrap with
 * @returns {string} The wrapped text
 */
export function wrapInTag(text, tagName) {
  // Remove < > if user typed them
  tagName = tagName.replace(/[<>]/g, '');
  
  // Handle tags with attributes
  const attrMatch = tagName.match(/^(\w+)\s+(.+)$/);
  if (attrMatch) {
    return `<${attrMatch[1]} ${attrMatch[2]}>${text}</${attrMatch[1]}>`;
  }
  
  return `<${tagName}>${text}</${tagName}>`;
}

/**
 * Find matching opening/closing tag pair
 * @param {string} code - The HTML code
 * @param {number} cursorPos - Current cursor position
 * @returns {Object|null} Object with opening and closing tag positions
 */
export function findMatchingTagPair(code, cursorPos) {
  // Check if cursor is inside a tag
  const beforeCursor = code.substring(0, cursorPos);
  const afterCursor = code.substring(cursorPos);
  
  // Find the tag we're in
  const openingMatch = beforeCursor.match(/<(\w+)(?:\s[^>]*)?>(?:(?!<\/\1>).)*$/s);
  if (!openingMatch) return null;
  
  const tagName = openingMatch[1];
  const openingTagStart = beforeCursor.lastIndexOf('<' + tagName);
  const openingTagEnd = code.indexOf('>', openingTagStart) + 1;
  
  // Find matching closing tag
  const closingPattern = new RegExp(`</${tagName}>`, 'i');
  const afterOpening = code.substring(openingTagEnd);
  const closingMatch = afterOpening.match(closingPattern);
  
  if (!closingMatch) return null;
  
  const closingTagStart = openingTagEnd + afterOpening.indexOf(closingMatch[0]);
  const closingTagEnd = closingTagStart + closingMatch[0].length;
  
  return {
    openingTag: {
      start: openingTagStart,
      end: openingTagEnd,
      name: tagName,
      full: code.substring(openingTagStart, openingTagEnd)
    },
    closingTag: {
      start: closingTagStart,
      end: closingTagEnd,
      full: code.substring(closingTagStart, closingTagEnd)
    }
  };
}

/**
 * Rename both opening and closing tags
 * @param {string} code - The HTML code
 * @param {number} cursorPos - Current cursor position
 * @param {string} newTagName - The new tag name
 * @returns {Object|null} Object with new code and cursor position
 */
export function renameTagPair(code, cursorPos, newTagName) {
  const pair = findMatchingTagPair(code, cursorPos);
  if (!pair) return null;
  
  // Replace closing tag first (to preserve positions)
  let newCode = code.substring(0, pair.closingTag.start) +
                `</${newTagName}>` +
                code.substring(pair.closingTag.end);
  
  // Replace opening tag (preserve attributes)
  const openingTag = pair.openingTag.full;
  const attrMatch = openingTag.match(/^<\w+(\s[^>]*)?>/);
  const attrs = attrMatch && attrMatch[1] ? attrMatch[1] : '';
  
  newCode = newCode.substring(0, pair.openingTag.start) +
            `<${newTagName}${attrs}>` +
            newCode.substring(pair.openingTag.end);
  
  return {
    code: newCode,
    cursorPos: cursorPos
  };
}
