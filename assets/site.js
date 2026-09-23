(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeKey = 'academic-homepage-theme';
  let selectedTheme = null;
  try {
    const saved = localStorage.getItem(themeKey);
    if (saved === 'light' || saved === 'dark') selectedTheme = saved;
  } catch {}

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? toggle.dataset.switchLight : toggle.dataset.switchDark);
    toggle.querySelector('[data-theme-label]').textContent = dark ? toggle.dataset.light : toggle.dataset.dark;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1d2421' : '#ffffff';
  }
  applyTheme(selectedTheme || (systemTheme.matches ? 'dark' : 'light'));
  toggle.addEventListener('click', () => {
    selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(selectedTheme);
    try { localStorage.setItem(themeKey, selectedTheme); } catch {}
  });
  systemTheme.addEventListener('change', event => {
    if (!selectedTheme) applyTheme(event.matches ? 'dark' : 'light');
  });

  document.querySelectorAll('[data-expandable-list]').forEach(list => {
    const items = [...list.children];
    const controls = document.querySelector(`[data-list-controls="${list.id}"]`);
    const button = controls.querySelector('[data-show-more]');
    const collapseButton = controls.querySelector('[data-show-less]');
    const counter = controls.querySelector('[data-count-template]');
    let shown = Math.min(5, items.length);
    function renderList() {
      items.forEach((item, index) => item.toggleAttribute('data-collapsed', index >= shown));
      controls.hidden = items.length <= 5;
      counter.textContent = counter.dataset.countTemplate.replace('{shown}', shown).replace('{total}', items.length);
      button.hidden = shown >= items.length;
      collapseButton.hidden = shown <= 5;
      button.setAttribute('aria-expanded', String(shown > 5));
      collapseButton.setAttribute('aria-expanded', String(shown > 5));
      button.textContent = `${button.dataset.moreLabel} (${items.length - shown})`;
    }
    renderList();
    button.addEventListener('click', () => {
      const firstNewItem = items[shown];
      shown = items.length;
      renderList();
      const focusTarget = firstNewItem.querySelector('a, h3');
      if (focusTarget) {
        if (focusTarget.tagName === 'H3') focusTarget.tabIndex = -1;
        focusTarget.focus({preventScroll: true});
      }
      firstNewItem.scrollIntoView({block: 'start', behavior: 'auto'});
    });
    collapseButton.addEventListener('click', () => {
      shown = Math.min(5, items.length);
      renderList();
      button.focus({preventScroll: true});
      controls.scrollIntoView({block: 'center', behavior: 'instant'});
      updateNavigation();
    });
  });

  const toast = document.getElementById('toast');
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  }
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail;
      button.disabled = true;
      let copied = false;
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = 'position:fixed;left:0;top:0;opacity:0;font-size:16px';
        document.body.append(textarea);
        textarea.select();
        try { copied = document.execCommand('copy'); } catch {}
        textarea.remove();
      } finally {
        button.disabled = false;
        button.focus({preventScroll: true});
      }
      notify(copied ? toast.dataset.success : toast.dataset.failure);
    });
  });

  const navLinks = [...document.querySelectorAll('.navigation a')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scrollPending = false;
  function updateNavigation() {
    const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    const current = atBottom ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= headerBottom + 60).at(-1);
    navLinks.forEach(link => {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateNavigation);
    }
  }, {passive: true});
  window.addEventListener('resize', updateNavigation);
  window.addEventListener('pageshow', updateNavigation);
  window.addEventListener('load', () => {
    if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView({behavior: 'instant', block: 'start'});
    updateNavigation();
  });
  updateNavigation();
})();
