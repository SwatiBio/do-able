(function () {
  'use strict';

  var html = document.documentElement;
  var statusTheme = document.getElementById('statusTheme');
  var closeBtn = document.getElementById('closeBtn');
  var dialogTitle = document.getElementById('dialogTitle');
  var themeSwitch = document.getElementById('themeSwitch');

  var themes = ['nord-dark', 'nord-light'];
  var currentTheme = 'nord-dark';

  var moonIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var sunIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function getThemeLabel(name) {
    return (getComputedStyle(html).getPropertyValue('--theme-label') || '').replace(/"/g, '') || name;
  }

  function applyTheme(name) {
    currentTheme = name;
    html.setAttribute('data-theme', name);
    statusTheme.textContent = 'Theme: ' + getThemeLabel(name);
    themeSwitch.innerHTML = name === 'nord-dark' ? moonIcon : sunIcon;
  }

  // Theme toggle
  themeSwitch.addEventListener('click', function () {
    var next = currentTheme === 'nord-dark' ? 'nord-light' : 'nord-dark';
    applyTheme(next);
  });

  function toggleMinimize() {
    var body = document.querySelector('.dialog-body');
    if (body.style.display === 'none') {
      body.style.display = '';
      closeBtn.textContent = '\u00D7';
      dialogTitle.textContent = 'Do-able';
    } else {
      body.style.display = 'none';
      closeBtn.textContent = '\u25A0';
      dialogTitle.textContent = 'Do-able  (minimized)';
    }
  }

  // Close button (minimize / restore)
  closeBtn.addEventListener('click', toggleMinimize);

  // Title bar double-click to minimize / restore
  document.getElementById('titlebar').addEventListener('dblclick', toggleMinimize);

  // Advanced toggle
  var toggleBtn = document.getElementById('toggleAdvanced');
  var advancedPanel = document.getElementById('advancedPanel');

  toggleBtn.addEventListener('click', function () {
    var isOpen = !advancedPanel.classList.contains('closed');
    advancedPanel.classList.toggle('closed', isOpen);
    toggleBtn.classList.toggle('open', !isOpen);
    document.getElementById('advancedArrow').textContent = isOpen ? '\u25B6' : '\u25BC';
  });

  // Priority buttons
  var prioBtns = document.querySelectorAll('.prio-btn');
  prioBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      prioBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // Add button
  var addBtn = document.getElementById('addBtn');
  addBtn.addEventListener('click', function () {
    var input = document.getElementById('taskInput');
    var title = input.value.trim();
    if (!title) {
      addBtn.textContent = '\u2717';
      setTimeout(function () { addBtn.textContent = 'Add'; }, 300);
      return;
    }
    var orig = addBtn.textContent;
    addBtn.textContent = '\u2713';
    setTimeout(function () { addBtn.textContent = orig; }, 600);
    setTimeout(function () { input.value = ''; }, 200);
  });

  // Cancel button
  var cancelBtn = document.getElementById('cancelBtn');
  cancelBtn.addEventListener('click', function () {
    document.getElementById('taskInput').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskDue').value = '';
    document.getElementById('taskStart').value = '';
    document.getElementById('taskTime').value = '';
    document.getElementById('taskCategory').value = '';
    document.getElementById('taskTags').value = '';
    prioBtns.forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.prio-btn[data-prio="medium"]').classList.add('active');
    cancelBtn.textContent = '\u2713';
    setTimeout(function () { cancelBtn.textContent = 'Cancel'; }, 300);
  });

  // Enter to add
  document.getElementById('taskInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBtn.click();
    }
  });

  // Drag dialog by title bar
  var titlebar = document.getElementById('titlebar');
  var dialog = document.getElementById('mainDialog');
  var dragOffsetX = 0, dragOffsetY = 0;

  titlebar.addEventListener('mousedown', function (e) {
    if (e.target.tagName === 'BUTTON') return; // ignore close button
    var rect = dialog.getBoundingClientRect();
    dialog.style.position = 'fixed';
    dialog.style.left = rect.left + 'px';
    dialog.style.top = rect.top + 'px';
    dialog.style.margin = '0';
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    function onMove(ev) {
      dialog.style.left = (ev.clientX - dragOffsetX) + 'px';
      dialog.style.top = (ev.clientY - dragOffsetY) + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Clock widget
  function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clockTime').textContent = h + ':' + m;
  }
  updateClock();
  setInterval(updateClock, 10000); // update every 10s (no seconds display)

  // Desktop icons — click to select
  var deskIcons = document.querySelectorAll('.desk-icon');
  deskIcons.forEach(function (icon) {
    icon.addEventListener('click', function () {
      deskIcons.forEach(function (i) { i.classList.remove('selected'); });
      icon.classList.add('selected');
    });
  });

  // Desktop context menu
  var ctxMenu = document.getElementById('ctxMenu');
  var desktop = document.querySelector('.desktop');

  desktop.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    var x = Math.min(e.clientX, window.innerWidth - ctxMenu.offsetWidth - 4);
    var y = Math.min(e.clientY, window.innerHeight - ctxMenu.offsetHeight - 30);
    ctxMenu.style.left = x + 'px';
    ctxMenu.style.top = y + 'px';
    ctxMenu.classList.add('open');
  });

  document.addEventListener('click', function (e) {
    if (!ctxMenu.contains(e.target)) {
      ctxMenu.classList.remove('open');
    }
  });

  ctxMenu.querySelectorAll('.ctx-item').forEach(function (item) {
    item.addEventListener('click', function () {
      ctxMenu.classList.remove('open');
    });
  });

  // Init
  applyTheme('nord-dark');
})();
