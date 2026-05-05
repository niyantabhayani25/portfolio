/* ============================================================
   typing.js — Hero JSON typing animation
   ============================================================ */
(function () {

  const SPEED = 16; // ms per character

  // Raw JSON lines (pre-formatted for display)
  const JSON_LINES = [
    ['{', 'j-brace'],
    ['  ', 'j-brace'],   ['"name"', 'j-key'],      [':', 'j-colon'],    [' "Niyanta Bhayani"', 'j-str'],   [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"role"', 'j-key'],      [':', 'j-colon'],    [' "Associate Technical Lead"', 'j-str'],  [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"status"', 'j-key'],    [':', 'j-colon'],    [' "● open_to_remote"', 'j-bullet'], [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"stack"', 'j-key'],     [':', 'j-colon'],    [' [', 'j-brace'],
    ['    ', 'j-brace'], ['"PHP"', 'j-str'],        [',', 'j-comma'],   [' "Laravel"', 'j-str'],  [',', 'j-comma'],  [' "Node.js"', 'j-str'],  [',', 'j-comma'],  [' "Vue"', 'j-str'],  [',', 'j-comma'],  [' "Python"', 'j-str'],  [',', 'j-comma'],  [' "AWS"', 'j-str'],
    ['  ', 'j-brace'],   [']', 'j-brace'],          [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"experience_years"', 'j-key'], [':', 'j-colon'], [' 7', 'j-num'],    [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"specialization"', 'j-key'],  [':', 'j-colon'], [' "Backend Systems"', 'j-str'], [',', 'j-comma'],
    ['  ', 'j-brace'],   ['"location"', 'j-key'],  [':', 'j-colon'],    [' "Bengaluru, Karnataka, IN"', 'j-str'],
    ['}', 'j-brace']
  ];

  // Convert token list into a newline-aware flat sequence
  function buildTokenSequence() {
    // We'll handle newlines as special '\n' tokens
    const result = [];
    const groups = groupByLine();
    groups.forEach((lineTokens, i) => {
      lineTokens.forEach(tok => result.push(tok));
      if (i < groups.length - 1) result.push(['\n', '']);
    });
    return result;
  }

  function groupByLine() {
    // Each outer array in JSON_LINES is already one visual "row" — but we need
    // to collapse them into lines separated by newlines.
    // Rows that start with '{' or '}' are standalone lines.
    // Others are grouped by leading whitespace / commas.
    const lines = [];
    let current = [];

    JSON_LINES.forEach(tok => {
      if (tok[0] === '{' || tok[0] === '}') {
        if (current.length) { lines.push(current); current = []; }
        lines.push([tok]);
      } else if (tok[0].startsWith('  ') && tok[1] === 'j-brace') {
        // Leading indent → start of a new line
        if (current.length) { lines.push(current); current = []; }
        current.push(tok);
      } else {
        current.push(tok);
      }
    });
    if (current.length) lines.push(current);
    return lines;
  }

  function makeSpan(cls, text) {
    if (!cls) return document.createTextNode(text);
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    return span;
  }

  function typeJson(outputEl, cursorEl, delay) {
    const tokens = buildTokenSequence();
    let tokenIdx = 0;
    let charIdx   = 0;

    // Start after delay
    setTimeout(tick, delay);

    function tick() {
      if (tokenIdx >= tokens.length) {
        // Done — remove cursor
        if (cursorEl && cursorEl.parentNode) cursorEl.remove();
        return;
      }

      const [text, cls] = tokens[tokenIdx];

      if (text === '\n') {
        outputEl.insertBefore(document.createTextNode('\n'), cursorEl);
        tokenIdx++;
        charIdx = 0;
        setTimeout(tick, SPEED);
        return;
      }

      if (charIdx === 0 && cls) {
        // Create the span for this token
        const span = document.createElement('span');
        span.className = cls;
        outputEl.insertBefore(span, cursorEl);
      }

      // Get or create the span to append into
      const span = cursorEl.previousElementSibling;
      if (cls && span && span.className === cls) {
        span.textContent += text[charIdx];
      } else {
        outputEl.insertBefore(document.createTextNode(text[charIdx]), cursorEl);
      }

      charIdx++;
      if (charIdx >= text.length) {
        tokenIdx++;
        charIdx = 0;
      }

      setTimeout(tick, SPEED);
    }
  }

  window.__typeJson = typeJson;

})();
