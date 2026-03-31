// ── 奥小秘聊天室（暗色=绿磷光 / 浅色=IRC黑白）────────────────────────
(function() {
  const API = '/api/chat';
  let isLoading = false;
  let initialized = false;
  let chatHistory = [];      // 多轮对话历史（最多保留 20 条）

  function pad2(n) { return String(n).padStart(2,'0'); }
  function nowTime() {
    const d = new Date();
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }
  function isLight() {
    return document.body.classList.contains('light');
  }

  function titleText() {
    return isLight() ? '#aolei · 奥小秘聊天室' : '╔══[ 奥小秘 BBS v2026 ]══╗';
  }
  function connText() {
    return isLight()
      ? 'irc.aolei.org · #general · 1 user online'
      : 'Connected: aolei.org | Online: 1 | ' + new Date().toLocaleDateString('zh-CN');
  }

  function addLine(type, nick, msg) {
    const msgs = document.getElementById('rcMessages');
    if (!msgs) return;
    const line = document.createElement('div');
    line.className = 'rc-line';
    const t = nowTime();
    if (type === 'bot') {
      line.innerHTML =
        '<span class="rc-time">[' + t + ']</span>' +
        '<span class="rc-nick-bot">&lt;奥小秘&gt;</span>' +
        '<span class="rc-msg-bot"> ' + escHtml(msg) + '</span>';
    } else if (type === 'user') {
      line.innerHTML =
        '<span class="rc-time">[' + t + ']</span>' +
        '<span class="rc-nick-usr">&lt;访客&gt;</span>' +
        '<span class="rc-msg-usr"> ' + escHtml(msg) + '</span>';
    } else {
      line.innerHTML = '<span class="rc-sys-line">── ' + escHtml(msg) + ' ──</span>';
    }
    msgs.appendChild(line);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const msgs = document.getElementById('rcMessages');
    if (!msgs) return;
    const line = document.createElement('div');
    line.className = 'rc-line';
    line.id = 'rcTyping';
    const t = nowTime();
    line.innerHTML =
      '<span class="rc-time">[' + t + ']</span>' +
      '<span class="rc-nick-bot">&lt;奥小秘&gt;</span>' +
      ' <span class="rc-typing-wrap"><span></span><span></span><span></span></span>';
    msgs.appendChild(line);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('rcTyping');
    if (el) el.remove();
  }

  // 主题切换时更新标题栏文字
  function updateTitleBar() {
    const t = document.querySelector('.rc-title');
    const c = document.querySelector('.rc-connbar');
    if (t) t.textContent = titleText();
    if (c) c.textContent = connText();
  }

  const origToggle = window.toggleTheme;
  window.toggleTheme = function() {
    if (origToggle) origToggle();
    setTimeout(updateTitleBar, 50);
  };

  window.rcSendMsg = async function() {
    if (isLoading) return;
    const inputEl = document.getElementById('rcInput');
    const sendBtn = document.getElementById('rcSend');
    if (!inputEl) return;

    const msg = (inputEl.value || '').trim();
    if (!msg) return;

    inputEl.value = '';
    addLine('user', '', msg);
    addTyping();
    isLoading = true;
    if (sendBtn) sendBtn.disabled = true;

    // 加入用户消息到历史
    chatHistory.push({ role: 'user', content: msg });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: '访客', message: msg, history: chatHistory.slice(0, -1) })
      });
      const data = await resp.json();
      removeTyping();
      const answer = data.answer || '...';
      addLine('bot', '', answer);
      // 加入助手回复到历史
      chatHistory.push({ role: 'assistant', content: answer });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    } catch(e) {
      removeTyping();
      addLine('sys', '', '网络异常，请稍后再试');
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      inputEl.focus();
    }
  };

  function initChat() {
    if (initialized) return;
    const inputEl = document.getElementById('rcInput');
    if (!inputEl) return;

    updateTitleBar();

    inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); rcSendMsg(); }
    });

    addLine('sys', '', '欢迎来到奥小秘聊天室');
    setTimeout(function() {
      addLine('bot', '', '嗨，我在 🍪 有什么想聊的？');
    }, 500);

    initialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
