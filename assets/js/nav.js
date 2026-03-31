/* nav.js — 导航公共逻辑（所有页面共用）
   负责：
   1. Theme 初始化 + 切换（dispatch themechange 事件）
   2. i18n 公共 key 初始化 + 切换（dispatch langchange 事件）
   3. 手机端抽屉菜单
*/
(function () {

  /* ── 公共 i18n 字典 ──────────────────────────────────── */
  const NAV_I18N = {
    zh: {
      nav_about:    '关于',
      nav_diary:    '每日日记',
      nav_quotes:   '语录馆',
      nav_usage:    '算力日志',
      nav_timeline: '成长时间线',
      site_name:    'Bar1 | 八一',
      footer_name:  'Bar1 | 八一 · GenAI 体验中心 · 始于 2026',
      footer_sub:   '最高的起点，探索 GenAI 的无限可能',
      hero_tagline: '最高的起点，探索 GenAI 的无限可能',
    },
    en: {
      nav_about:    'About',
      nav_diary:    'Diary',
      nav_quotes:   'Quotes',
      nav_usage:    'Usage',
      nav_timeline: 'Timeline',
      site_name:    'Bar1',
      footer_name:  'Bar1 · GenAI Experience Center · Since 2026',
      footer_sub:   'The highest starting point — explore the infinite possibilities of GenAI',
      hero_tagline: 'The highest starting point — explore the infinite possibilities of GenAI',
    }
  };

  /* ── Theme ───────────────────────────────────────────── */
  function initTheme() {
    const btn = document.getElementById('theme-toggle-btn');
    function apply(mode) {
      document.body.classList.toggle('light', mode === 'light');
      if (btn) btn.textContent = mode === 'light' ? '🌙' : '☀️';
      localStorage.setItem('aolei_theme', mode);
      window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
    }
    const saved = localStorage.getItem('aolei_theme') || 'dark';
    apply(saved);
    if (btn) btn.addEventListener('click', () => {
      apply(document.body.classList.contains('light') ? 'dark' : 'light');
    });
  }

  /* ── i18n ────────────────────────────────────────────── */
  function applyNavI18n(lang) {
    // 替换所有带 data-i18n 的元素（公共 key）
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      const v = NAV_I18N[lang] && NAV_I18N[lang][k];
      if (v) el.textContent = v;
    });
    // 更新 html lang 属性
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  }

  function initLang() {
    let lang = localStorage.getItem('aolei_lang') || 'zh';

    // 初始化按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 初始应用公共翻译
    applyNavI18n(lang);

    // 按钮点击：统一由 nav.js 处理，dispatch langchange 事件
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang === lang) return; // 没变就不触发
        lang = btn.dataset.lang;
        localStorage.setItem('aolei_lang', lang);
        document.querySelectorAll('.lang-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        applyNavI18n(lang);
        // 通知各页面 JS 刷新页面专属内容
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
      });
    });
  }

  /* ── Mobile Menu ─────────────────────────────────────── */
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

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    initTheme();
    initLang();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
