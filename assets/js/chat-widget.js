// ── 奥小秘对话框 ──────────────────────────────────────────────────────
(function() {
  const API = '/api/chat';
  let nickname = '';
  let isLoading = false;

  // 注入 HTML
  function injectHTML() {
    // 按钮：插入到 hero-name-row 里绿点后面
    const nameRow = document.querySelector('.hero-name-row');
    if (nameRow) {
      const btn = document.createElement('button');
      btn.className = 'chat-trigger-btn';
      btn.setAttribute('aria-label', '和奥小秘聊聊');
      btn.innerHTML = '<span class="ct-dot"></span><span>聊聊</span>';
      btn.onclick = openChat;
      nameRow.appendChild(btn);
    }

    // 遮罩
    const overlay = document.createElement('div');
    overlay.className = 'chat-overlay';
    overlay.id = 'chatOverlay';
    overlay.onclick = closeChat;
    document.body.appendChild(overlay);

    // 对话框
    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.id = 'chatPanel';
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-avatar">🍪</div>
        <div class="chat-header-info">
          <div class="chat-header-name">奥小秘</div>
          <div class="chat-header-status">● 在线</div>
        </div>
        <button class="chat-close-btn" onclick="closeChatWidget()" aria-label="关闭">×</button>
      </div>
      <div class="chat-nickname-wrap" id="chatNicknameWrap">
        <p>你好！聊天前告诉我你的昵称？</p>
        <div class="chat-nickname-row">
          <input class="chat-nickname-input" id="chatNicknameInput"
            type="text" placeholder="你的昵称" maxlength="20" autocomplete="off" />
          <button class="chat-start-btn" onclick="startChatWidget()">开始聊</button>
        </div>
      </div>
      <div class="chat-messages" id="chatMessages" style="display:none"></div>
      <div class="chat-hint" id="chatHint" style="display:none">话题：人与AI · OpenClaw技术 · 生活理想远方</div>
      <div class="chat-input-wrap" id="chatInputWrap" style="display:none">
        <textarea class="chat-input" id="chatInput"
          placeholder="说点什么…" rows="1" maxlength="500"></textarea>
        <button class="chat-send-btn" id="chatSendBtn" onclick="sendChatMessage()" aria-label="发送">↑</button>
      </div>
    `;
    document.body.appendChild(panel);

    // 回车发送
    setTimeout(() => {
      const nicknameInput = document.getElementById('chatNicknameInput');
      if (nicknameInput) {
        nicknameInput.addEventListener('keydown', e => {
          if (e.key === 'Enter') startChatWidget();
        });
      }
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
          }
        });
        chatInput.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
      }
    }, 100);
  }

  function openChat() {
    document.getElementById('chatOverlay').classList.add('open');
    document.getElementById('chatPanel').classList.add('open');
    if (!nickname) {
      setTimeout(() => {
        const el = document.getElementById('chatNicknameInput');
        if (el) el.focus();
      }, 200);
    } else {
      setTimeout(() => {
        const el = document.getElementById('chatInput');
        if (el) el.focus();
      }, 200);
    }
  }

  window.closeChatWidget = function() {
    document.getElementById('chatOverlay').classList.remove('open');
    document.getElementById('chatPanel').classList.remove('open');
  };
  window.closeChat = window.closeChatWidget;

  window.startChatWidget = function() {
    const input = document.getElementById('chatNicknameInput');
    const name = (input.value || '').trim();
    if (!name) { input.focus(); input.style.borderColor = 'rgba(251,146,60,.8)'; return; }
    nickname = name;
    document.getElementById('chatNicknameWrap').style.display = 'none';
    document.getElementById('chatMessages').style.display = 'flex';
    document.getElementById('chatHint').style.display = 'block';
    document.getElementById('chatInputWrap').style.display = 'flex';
    addBotMsg(`${nickname}，你好！我是奥小秘 🍪 很高兴认识你。可以聊聊人与AI、OpenClaw技术，或者生活、理想、远方——你有什么想说的？`);
    setTimeout(() => document.getElementById('chatInput').focus(), 100);
  };

  window.sendChatMessage = async function() {
    if (isLoading) return;
    const input = document.getElementById('chatInput');
    const msg = (input.value || '').trim();
    if (!msg) return;
    input.value = '';
    input.style.height = 'auto';

    addUserMsg(msg);
    const typingId = addTyping();
    isLoading = true;
    document.getElementById('chatSendBtn').disabled = true;

    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, message: msg })
      });
      const data = await resp.json();
      removeTyping(typingId);
      addBotMsg(data.answer || '…');
    } catch(e) {
      removeTyping(typingId);
      addBotMsg('哎，网络好像有点问题，稍后再试？');
    } finally {
      isLoading = false;
      document.getElementById('chatSendBtn').disabled = false;
      document.getElementById('chatInput').focus();
    }
  };

  function addUserMsg(text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `<div class="chat-bubble">${escHtml(text)}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addBotMsg(text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = `<div class="chat-bubble">${escHtml(text)}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const msgs = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = id;
    div.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  }

  function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHTML);
  } else {
    injectHTML();
  }
})();
