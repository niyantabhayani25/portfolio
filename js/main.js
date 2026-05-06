/* ============================================================
   main.js — Postman Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  /* ── Section config ─────────────────────────────────────── */
  const SECTIONS = {
    home:        { method: 'GET',  path: '/developer',    time: '42ms',  size: '1.2 KB', headers: 8  },
    about:       { method: 'GET',  path: '/about.json',   time: '18ms',  size: '3.4 KB', headers: 6  },
    stack:       { method: 'GET',  path: '/composer.json',time: '11ms',  size: '2.8 KB', headers: 4  },
    experience:  { method: 'GET',  path: '/git-log',      time: '67ms',  size: '4.2 KB', headers: 4  },
    domains:     { method: 'GET',  path: '/domains',      time: '33ms',  size: '1.8 KB', headers: 2  },
    recognition: { method: 'GET',  path: '/verified.json',time: '9ms',   size: '0.8 KB', headers: 4  },
    contact:     { method: 'POST', path: '/connect',      time: null,    size: null,     headers: 0  },
  };

  const DEFAULT_SECTION = 'home';
  let activeSection = DEFAULT_SECTION;
  let countersStarted = false;

  /* ── Element refs ───────────────────────────────────────── */
  const splash          = document.getElementById('splash');
  const splashDots      = document.querySelector('.splash-dots');
  const splashStatus    = document.getElementById('splash-status');
  const jsonOutput      = document.getElementById('json-output');
  const jsonCursor      = document.getElementById('json-cursor');
  const methodPill      = document.getElementById('method-pill');
  const methodText      = document.getElementById('method-text');
  const urlPath         = document.getElementById('url-path');
  const sendBtn         = document.getElementById('send-btn');
  const respStatusBadge = document.getElementById('resp-status-badge');
  const respTime        = document.getElementById('resp-time');
  const respHdrBadge    = document.getElementById('resp-hdr-badge');
  const sidebarEl       = document.getElementById('sidebar');
  const sidebarToggle   = document.getElementById('sidebar-toggle');
  const consoleOverlay  = document.getElementById('console-overlay');
  const consoleToggleBtn= document.getElementById('console-toggle');
  const sbConsoleBtn    = document.getElementById('sb-console-btn');
  const consoleClose    = document.getElementById('console-close');
  const consoleLog      = document.getElementById('console-log');
  const consoleClear    = document.getElementById('console-clear');
  const contentArea     = document.getElementById('content-area');
  const resizeHandle    = document.getElementById('resize-handle');

  /* ── Splash ─────────────────────────────────────────────── */
  setTimeout(function () {
    if (splashDots)  splashDots.textContent  = '';
    if (splashStatus) splashStatus.textContent = '200 OK';
  }, 900);

  setTimeout(function () {
    if (splash) splash.classList.add('fade-out');
    if (jsonOutput && jsonCursor && window.__typeJson) {
      window.__typeJson(jsonOutput, jsonCursor, 200);
    }
    logToConsole('GET', '200', '{{base_url}}/developer', '42ms');
  }, 1400);

  /* ── Section switching ──────────────────────────────────── */
  function switchSection(id) {
    if (!SECTIONS[id]) return;
    activeSection = id;
    const cfg = SECTIONS[id];

    /* Sidebar items */
    document.querySelectorAll('.coll-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.section === id);
    });

    /* Tabs */
    document.querySelectorAll('.req-tab').forEach(function (el) {
      el.classList.toggle('active', el.dataset.section === id);
      if (el.dataset.section === id) {
        el.classList.toggle('method-post', cfg.method === 'POST');
      }
    });

    /* URL bar */
    urlPath.textContent = cfg.path;
    methodText.textContent = cfg.method;
    if (cfg.method === 'GET') {
      methodPill.className = 'method-pill';
    } else {
      methodPill.className = 'method-pill post';
    }

    /* Response status */
    if (cfg.time) {
      respStatusBadge.textContent = '200 OK';
      respStatusBadge.className = 'resp-status-badge green';
      respTime.textContent = cfg.time;
      document.querySelector('.resp-size').textContent = cfg.size;
    } else {
      respStatusBadge.textContent = 'Send Request';
      respStatusBadge.className = 'resp-status-badge amber';
      respTime.textContent = '';
      document.querySelector('.resp-size').textContent = '';
    }
    respHdrBadge.textContent = cfg.headers;

    /* Show correct req-panel */
    document.querySelectorAll('.req-panel').forEach(function (el) {
      el.classList.toggle('active', el.dataset.section === id);
    });

    /* Show correct resp-section */
    document.querySelectorAll('.resp-section').forEach(function (el) {
      el.classList.toggle('active', el.dataset.section === id);
    });

    /* Reset resp-tab to Body */
    document.querySelectorAll('.resp-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.respTab === 'body');
    });
    document.querySelectorAll('.resp-tab-content').forEach(function (el) {
      const panel = el.closest('.resp-section');
      if (panel && panel.dataset.section === id) {
        el.classList.toggle('active', el.dataset.respTab === 'body');
      }
    });

    /* Body dot on sub-tabs: only for contact */
    const bodyDot = document.getElementById('body-dot');
    if (bodyDot) bodyDot.style.display = id === 'contact' ? 'inline' : 'none';

    /* Trigger counters when switching to about */
    if (id === 'about') initCounters();

    /* Animate section switch */
    const respPanel = document.getElementById('resp-' + id);
    if (respPanel) {
      respPanel.style.opacity = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          respPanel.style.transition = 'opacity 0.18s ease';
          respPanel.style.opacity = '1';
        });
      });
    }
  }

  /* ── Sidebar collection item clicks ────────────────────── */
  document.querySelectorAll('.coll-item').forEach(function (el) {
    el.addEventListener('click', function () {
      switchSection(el.dataset.section);
    });
  });

  /* ── Tab bar clicks ─────────────────────────────────────── */
  document.querySelectorAll('.req-tab').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.classList.contains('tab-close-btn')) return;
      switchSection(el.dataset.section);
    });
  });

  /* Tab close buttons (just switch to another open tab, not truly close) */
  document.querySelectorAll('.tab-close-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const tab = btn.closest('.req-tab');
      if (tab && tab.classList.contains('active')) {
        const sections = Object.keys(SECTIONS);
        const curr = sections.indexOf(tab.dataset.section);
        const next = sections[(curr + 1) % sections.length];
        switchSection(next);
      }
    });
  });

  /* ── Sub-tab switching (request side) ──────────────────── */
  document.querySelectorAll('.subtab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.subtab').forEach(function (t) {
        t.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

  /* ── Response tabs ──────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const respTab = e.target.closest('.resp-tab');
    if (!respTab) return;

    const tabId = respTab.dataset.respTab;

    /* Update resp-tab active state */
    const toolbar = respTab.closest('.resp-toolbar');
    if (toolbar) {
      toolbar.querySelectorAll('.resp-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.respTab === tabId);
      });
    }

    /* Show matching content in active resp-section */
    const activeRespSection = document.querySelector('.resp-section.active');
    if (activeRespSection) {
      activeRespSection.querySelectorAll('.resp-tab-content').forEach(function (el) {
        el.classList.toggle('active', el.dataset.respTab === tabId);
      });
    }
  });

  /* ── Stack tab switching ────────────────────────────────── */
  document.querySelectorAll('.stack-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.stack-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      document.querySelectorAll('.stack-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      tab.classList.add('active');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Git commit expand/collapse ─────────────────────────── */
  document.querySelectorAll('.git-commit').forEach(function (commit) {
    const header = commit.querySelector('.commit-header');
    if (!header) return;
    header.addEventListener('click', function () {
      const isOpen = commit.dataset.expanded === 'true';
      commit.dataset.expanded = isOpen ? 'false' : 'true';
    });
  });

  /* ── File explorer expand/collapse ─────────────────────── */
  document.querySelectorAll('.fe-item').forEach(function (item) {
    const row = item.querySelector('.fe-row');
    if (!row) return;
    row.addEventListener('click', function () {
      const isOpen = item.dataset.expanded === 'true';
      document.querySelectorAll('.fe-item').forEach(function (other) {
        if (other !== item) other.dataset.expanded = 'false';
      });
      item.dataset.expanded = isOpen ? 'false' : 'true';
    });
  });

  /* ── Recognition collapsible ────────────────────────────── */
  document.querySelectorAll('.rv-header').forEach(function (header) {
    header.addEventListener('click', function () {
      const block = header.closest('.rv-block');
      if (block) block.classList.toggle('rv-open');
    });
  });

  /* ── Send button ────────────────────────────────────────── */
  sendBtn && sendBtn.addEventListener('click', function () {
    if (activeSection === 'contact') {
      const form = document.getElementById('contact-form');
      if (form) {
        form.requestSubmit();
      }
      return;
    }

    /* Simulate a request/response for non-contact sections */
    sendBtn.classList.add('sending');
    sendBtn.querySelector('.send-label').textContent = 'Sending...';

    setTimeout(function () {
      sendBtn.classList.remove('sending');
      sendBtn.querySelector('.send-label').textContent = 'Send';

      const cfg = SECTIONS[activeSection];
      respStatusBadge.textContent = '200 OK';
      respStatusBadge.className = 'resp-status-badge green';
      respTime.textContent = cfg.time || '—';
      logToConsole('GET', '200', '{{base_url}}' + cfg.path, cfg.time || '—');
    }, 600);
  });

  /* ── Contact form: show 201 response ───────────────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      setTimeout(function () {
        const waiting = document.getElementById('contact-resp-waiting');
        const success = document.getElementById('contact-resp-success');
        const fsSuccess = document.getElementById('form-success');

        if (waiting) waiting.style.display = 'none';
        if (success) success.style.display = 'block';

        respStatusBadge.textContent = '201 Created';
        respStatusBadge.className = 'resp-status-badge green';
        respTime.textContent = '380ms';
        document.querySelector('.resp-size').textContent = '0.2 KB';

        logToConsole('POST', '201', '{{base_url}}/connect', '380ms');
      }, 400);
    });
  }

  /* ── Section link (contact_me button in about) ──────────── */
  document.querySelectorAll('[data-section-link]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const target = el.dataset.sectionLink;
      if (target) switchSection(target);
    });
  });

  /* ── Sidebar toggle ─────────────────────────────────────── */
  sidebarToggle && sidebarToggle.addEventListener('click', function () {
    if (window.innerWidth <= 768) {
      sidebarEl.classList.toggle('mobile-open');
    } else {
      sidebarEl.classList.toggle('collapsed');
    }
  });

  /* ── Console overlay ────────────────────────────────────── */
  function openConsole()  { consoleOverlay.classList.add('console-open'); }
  function closeConsole() { consoleOverlay.classList.remove('console-open'); }

  consoleToggleBtn && consoleToggleBtn.addEventListener('click', function () {
    consoleOverlay.classList.toggle('console-open');
  });
  sbConsoleBtn && sbConsoleBtn.addEventListener('click', function () {
    consoleOverlay.classList.toggle('console-open');
  });
  consoleClose && consoleClose.addEventListener('click', closeConsole);
  consoleClear && consoleClear.addEventListener('click', function () {
    if (consoleLog) consoleLog.innerHTML = '';
  });

  function logToConsole(method, status, url, ms) {
    if (!consoleLog) return;
    const now = new Date();
    const ts  = now.toTimeString().slice(0, 8);
    const row = document.createElement('div');
    row.className = 'clog-row';
    row.innerHTML =
      '<span class="clog-time">' + ts + '</span>' +
      '<span class="clog-mb ' + method.toLowerCase() + '">' + method + '</span>' +
      '<span class="clog-status ok">' + status + '</span>' +
      '<span class="clog-url">' + url + '</span>' +
      '<span class="clog-ms">' + ms + '</span>';
    consoleLog.appendChild(row);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  /* ── Resize handle ──────────────────────────────────────── */
  let isResizing = false;
  let startY = 0;
  let startH = 0;

  resizeHandle && resizeHandle.addEventListener('mousedown', function (e) {
    isResizing = true;
    startY = e.clientY;
    startH = contentArea.offsetHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isResizing) return;
    const delta = e.clientY - startY;
    const newH  = Math.max(80, Math.min(startH + delta, window.innerHeight * 0.65));
    contentArea.style.height = newH + 'px';
  });

  document.addEventListener('mouseup', function () {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  resizeHandle && resizeHandle.addEventListener('dblclick', function () {
    contentArea.style.height = '200px';
  });

  /* ── Stats counters ─────────────────────────────────────── */
  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el) {
    var target   = parseInt(el.dataset.target, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1400;
    var start    = null;
    function step(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOutQuad(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    if (countersStarted) return;
    countersStarted = true;
    document.querySelectorAll('.stat-number').forEach(animateCounter);
  }

  /* ── Sidebar collection group collapse ──────────────────── */
  const collGroupToggle = document.getElementById('coll-group-toggle');
  const collItemsList   = document.getElementById('coll-items-list');
  collGroupToggle && collGroupToggle.addEventListener('click', function () {
    const chevron = collGroupToggle.querySelector('.coll-chevron');
    if (collItemsList) {
      const isVisible = collItemsList.style.display !== 'none';
      collItemsList.style.display = isVisible ? 'none' : '';
      if (chevron) chevron.style.transform = isVisible ? 'rotate(-90deg)' : '';
    }
  });

  /* ── Initialise to home section ─────────────────────────── */
  switchSection(DEFAULT_SECTION);

})();
