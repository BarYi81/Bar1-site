/* nav.js — 手机端抽屉菜单（所有页面公用） */
(function () {
  function initMobileMenu() {
    const btn     = document.getElementById('nav-hamburger');
    const menu    = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
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

    // 点菜单里的链接自动关闭
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
