/* ============================================================
   main.js — Interactions, scroll, counters, status bar
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Splash Screen
  ---------------------------------------------------------- */
  const splash      = document.getElementById('splash');
  const splashDots  = document.querySelector('.splash-dots');
  const splashStat  = document.getElementById('splash-status');
  const jsonOutput  = document.getElementById('json-output');
  const jsonCursor  = document.getElementById('json-cursor');

  // Step 1 → show "200 OK" after 900ms
  setTimeout(function () {
    if (splashDots)  splashDots.textContent  = '';
    if (splashStat)  splashStat.textContent  = '200 OK';
  }, 900);

  // Step 2 → hide splash and begin typing after 1400ms
  setTimeout(function () {
    if (splash) splash.classList.add('fade-out');

    if (jsonOutput && jsonCursor && window.__typeJson) {
      window.__typeJson(jsonOutput, jsonCursor, 250);
    }
  }, 1400);

  /* ----------------------------------------------------------
     Sidebar nav — active state + smooth scroll
  ---------------------------------------------------------- */
  const navItems   = Array.from(document.querySelectorAll('.nav-item'));
  const sections   = Array.from(document.querySelectorAll('.section'));
  const sbSection  = document.getElementById('sb-section');

  const SECTION_LABELS = {
    home:        'home',
    about:       '// about.php',
    stack:       '// composer.json',
    experience:  '$ git log',
    domains:     '$ ls -la /domains',
    recognition: '// verified.json',
    contact:     'POST /connect',
  };

  function setActiveSection(id) {
    navItems.forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === id);
    });
    if (sbSection) sbSection.textContent = SECTION_LABELS[id] || id;
  }

  // Smooth scroll on nav click
  navItems.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = a.getAttribute('href').slice(1);
      var target   = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Smooth scroll for any .scroll-link
  document.querySelectorAll('.scroll-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.getElementById(href.slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     Intersection Observer — reveal + active nav
  ---------------------------------------------------------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.id) setActiveSection(entry.target.id);
        if (entry.target.id === 'about') initCounters();
      }
    });
  }, { threshold: 0.18, rootMargin: '-40px 0px' });

  sections.forEach(function (s) { revealObs.observe(s); });

  /* ----------------------------------------------------------
     Stat Counters
  ---------------------------------------------------------- */
  var countersStarted = false;

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

  /* ----------------------------------------------------------
     Stack Tabs
  ---------------------------------------------------------- */
  var stackTabs = document.querySelectorAll('.stack-tab');

  stackTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      stackTabs.forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.stack-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     Git Log — expand / collapse commits
  ---------------------------------------------------------- */
  document.querySelectorAll('.git-commit').forEach(function (commit) {
    var header = commit.querySelector('.commit-header');
    if (!header) return;

    header.addEventListener('click', function () {
      var isOpen = commit.dataset.expanded === 'true';
      commit.dataset.expanded = isOpen ? 'false' : 'true';
    });
  });

  /* ----------------------------------------------------------
     File Explorer — expand / collapse (only one at a time)
  ---------------------------------------------------------- */
  var feItems = document.querySelectorAll('.fe-item');

  feItems.forEach(function (item) {
    var row = item.querySelector('.fe-row');
    if (!row) return;

    row.addEventListener('click', function () {
      var isOpen = item.dataset.expanded === 'true';
      // Close all others
      feItems.forEach(function (other) {
        if (other !== item) other.dataset.expanded = 'false';
      });
      item.dataset.expanded = isOpen ? 'false' : 'true';
    });
  });

  /* ----------------------------------------------------------
     Recognition — collapsible JSON blocks
  ---------------------------------------------------------- */
  document.querySelectorAll('.rv-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var block = header.closest('.rv-block');
      if (block) block.classList.toggle('rv-open');
    });
  });

})();
