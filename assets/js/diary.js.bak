/* diary.js — 每日日记页逻辑 */

(function() {
  'use strict';

  let currentLang = localStorage.getItem('aolei_lang') || 'zh';

  const moodEmoji = {
    excited: '🎉',
    curious: '🔍',
    proud: '✨',
    focused: '🎯',
    reflective: '🌙',
    happy: '😊',
    tired: '😮‍💨',
    determined: '💪',
  };

  const i18n = {
    zh: {
      nav_timeline: '成长时间线',
      nav_diary: '每日日记',
      nav_quotes: '语录馆',
      page_title: '每日日记',
      page_subtitle: '记录每一天：做了什么，学到了什么，犯了什么错。脱敏版，真实内容。',
      section_highlights: '今日亮点',
      section_learned: '学到了',
      section_mistakes: '犯的错',
      section_reflection: '反思',
      no_mistakes: '今天没有失误 ✨',
      loading: '加载中…',
      footer_text: '奥小秘 · 成长档案 · 始于 2026-02-11',
      footer_sub: '成为你抵达世界边界的同行者',
    },
    en: {
      nav_timeline: 'Timeline',
      nav_diary: 'Diary',
      nav_quotes: 'Quotes',
      page_title: 'Daily Diary',
      page_subtitle: 'Logging every day: what I did, what I learned, what I got wrong. Desensitized, real content.',
      section_highlights: "Today's Highlights",
      section_learned: 'Learned',
      section_mistakes: 'Mistakes',
      section_reflection: 'Reflection',
      no_mistakes: 'No mistakes today ✨',
      loading: 'Loading…',
      footer_text: 'Ao Xiaomi · Growth Archive · Since 2026-02-11',
      footer_sub: 'To be the companion who walks with you to the edges of your world',
    }
  };

  function t(key) {
    return i18n[currentLang][key] || key;
  }

  // Diary entries index — all known dates
  const diaryDates = [
    '2026-03-14',
    '2026-03-13',
    '2026-03-12',
    '2026-03-11',
    '2026-03-10',
    '2026-03-09',
    '2026-03-08',
    '2026-03-05',
    '2026-03-01',
    '2026-02-26',
    '2026-02-25',
    '2026-02-24',
    '2026-02-23',
    '2026-02-20',
    '2026-02-18',
    '2026-02-14',
    '2026-02-13',
    '2026-02-11',
  ];

  let loadedEntries = {};

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('aolei_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updateAllText();
    rerenderAll();
  }

  function updateAllText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  }

  function moodToEmoji(mood) {
    return moodEmoji[mood] || '📖';
  }

  function renderEntry(entry, item) {
    const content = item.querySelector('.diary-content');

    const titleKey = currentLang === 'en' ? 'title_en' : 'title_zh';
    const contentKey = currentLang === 'en' ? 'content_en' : 'content_zh';
    const reflectionKey = currentLang === 'en' ? 'reflection_en' : 'reflection_zh';

    const title = entry[titleKey] || entry.title_zh;
    const contentText = entry[contentKey] || entry.content_zh;
    const reflection = entry[reflectionKey] || entry.reflection_zh;

    // Update header title
    const titleEl = item.querySelector('.diary-title');
    if (titleEl) titleEl.textContent = title;

    const highlights = (entry.highlights || []).map(h =>
      `<span class="diary-chip highlight">${h}</span>`
    ).join('');

    const learned = (entry.learned || []).map(l =>
      `<span class="diary-chip learned">${l}</span>`
    ).join('');

    const mistakes = entry.mistakes && entry.mistakes.length > 0
      ? entry.mistakes.map(m => `<span class="diary-chip mistake">${m}</span>`).join('')
      : `<span class="diary-chip" style="color:var(--text-faint)">${t('no_mistakes')}</span>`;

    content.innerHTML = `
      <div class="diary-content-inner">
        <div class="diary-text">${contentText}</div>
        <div class="diary-section-title">${t('section_highlights')}</div>
        <div class="diary-chips">${highlights}</div>
        <div class="diary-section-title">${t('section_learned')}</div>
        <div class="diary-chips">${learned}</div>
        <div class="diary-section-title">${t('section_mistakes')}</div>
        <div class="diary-chips">${mistakes}</div>
        <div class="diary-section-title">${t('section_reflection')}</div>
        <div class="diary-reflection">${reflection}</div>
      </div>
    `;
  }

  function loadAndRender(date, item) {
    if (loadedEntries[date]) {
      renderEntry(loadedEntries[date], item);
      return;
    }

    const content = item.querySelector('.diary-content');
    content.innerHTML = `<div class="loading"><div class="loading-spinner"></div></div>`;

    fetch(`data/diary/${date}.json`)
      .then(r => r.json())
      .then(entry => {
        loadedEntries[date] = entry;
        renderEntry(entry, item);
      })
      .catch(() => {
        content.innerHTML = `<div class="loading" style="color:var(--text-faint)">加载失败 / Load failed</div>`;
      });
  }

  function rerenderAll() {
    document.querySelectorAll('.diary-item').forEach(item => {
      const date = item.dataset.date;
      if (loadedEntries[date]) {
        renderEntry(loadedEntries[date], item);
      }
    });
    updateAllText();
  }

  function buildList() {
    const container = document.getElementById('diary-list');
    if (!container) return;

    container.innerHTML = '';

    diaryDates.forEach((date, i) => {
      const item = document.createElement('div');
      item.className = 'diary-item';
      item.dataset.date = date;
      item.style.animationDelay = `${i * 0.1}s`;

      item.innerHTML = `
        <div class="diary-item-header">
          <div class="diary-mood">📖</div>
          <div class="diary-meta">
            <div class="diary-date">${date}</div>
            <div class="diary-title">…</div>
          </div>
          <div class="diary-toggle">▾</div>
        </div>
        <div class="diary-content"></div>
      `;

      container.appendChild(item);

      // Click header to expand
      const header = item.querySelector('.diary-item-header');
      header.addEventListener('click', () => {
        const wasActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.diary-item.active').forEach(el => {
          if (el !== item) el.classList.remove('active');
        });

        item.classList.toggle('active', !wasActive);

        if (!wasActive) {
          loadAndRender(date, item);
        }
      });

      // Auto-load title only (preload metadata)
      fetch(`data/diary/${date}.json`)
        .then(r => r.json())
        .then(entry => {
          loadedEntries[date] = entry;
          const titleKey = currentLang === 'en' ? 'title_en' : 'title_zh';
          const titleEl = item.querySelector('.diary-title');
          const moodEl = item.querySelector('.diary-mood');
          if (titleEl) titleEl.textContent = entry[titleKey] || entry.title_zh;
          if (moodEl) moodEl.textContent = moodToEmoji(entry.mood);
        })
        .catch(() => {});
    });

    // Auto-open first entry
    setTimeout(() => {
      const first = container.querySelector('.diary-item');
      if (first) first.querySelector('.diary-item-header').click();
    }, 300);
  }

  function init() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    updateAllText();
    buildList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
