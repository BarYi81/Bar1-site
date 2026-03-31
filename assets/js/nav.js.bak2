/* nav.js — 导航公共逻辑（所有页面共用） */
(function () {

  /* ── Theme（主题切换，所有页面通用）────────────────── */
  function initTheme() {
    const btn = document.getElementById('theme-toggle-btn');
    function apply(mode) {
      document.body.classList.toggle('light', mode === 'light');
      if (btn) btn.textContent = mode === 'light' ? '🌙' : '☀️';
      localStorage.setItem('aolei_theme', mode);
      // 通知其他模块（如 usage.js 图表需要重绘）
      window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
    }
    const saved = localStorage.getItem('aolei_theme') || 'dark';
    apply(saved);
    if (btn) btn.addEventListener('click', () => {
      apply(document.body.classList.contains('light') ? 'dark' : 'light');
    });
  }

  /* ── Mobile Menu（手机端抽屉菜单）─────────────────── */
  function initMobileMenu() {
    const btn      = document.getElementById('nav-hamburger');
    const menu     = document.getElementById('mobile-menu');
    const overlay  = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('mobile-menu-close');
    if (!btn || !menu || !overlay) return;

    function open() {
      menu.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', close);
    });

    // 高亮当前页
    const path = location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });
  }

  function init() {
    initTheme();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
