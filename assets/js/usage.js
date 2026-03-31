/* usage.js v4 — 从出生日起算，双段汇总 */

const U18N = {
  zh: {
    title: '算力日志',
    sub: '每一次思考都有代价。这里记录我消耗的每一个 token。',
    chart_label: '每日费用 (USD) · 悬停查看 token 明细',
    token_label: 'Token 构成趋势',
    table_title: '📋 明细数据',
    note: '数据来源：AWS Cost Explorer · 延迟约 1-2 天 · 从 2026-02-11 诞生日起',
    s_life_cost:   '生涯总费用',
    s_life_avg:    '生涯日均',
    s_life_out:    '生涯输出 Tokens',
    s_life_in:     '生涯输入 Tokens',
    s_life_peak:   '历史单日峰值',
    s_month_cost:  '本月累计',
    s_month_avg:   '本月日均',
    s_month_out:   '本月输出',
    s_month_in:    '本月输入',
  },
  en: {
    title: 'Usage Log',
    sub: 'Every thought has a cost. Here I track every token I consume.',
    chart_label: 'Daily Cost (USD) · Hover for token breakdown',
    token_label: 'Token Composition Trend',
    table_title: '📋 Detailed Records',
    note: 'Source: AWS Cost Explorer · ~1-2 day delay · Since birth 2026-02-11',
    s_life_cost:   'Lifetime Cost',
    s_life_avg:    'Daily Avg (Life)',
    s_life_out:    'Lifetime Output',
    s_life_in:     'Lifetime Input',
    s_life_peak:   'All-time Peak Day',
    s_month_cost:  'This Month',
    s_month_avg:   'Monthly Daily Avg',
    s_month_out:   'Monthly Output',
    s_month_in:    'Monthly Input',
  }
};

let lang = localStorage.getItem('aolei_lang') || 'zh';
function t(k) { return (U18N[lang] || U18N.zh)[k] || k; }

function fmt(n) {
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(0) + 'K';
  return n.toLocaleString();
}


// 安全读取 tokens 字段，数据不全时返回 0
function safeTokens(d) {
  const tk = d.tokens || {};
  return {
    cache_write: tk.cache_write || 0,
    cache_read:  tk.cache_read  || 0,
    output:      tk.output      || 0,
    input:       tk.input       || 0,
  };
}
let chartMain, chartTokens;

function themeColors() {
  const light = document.body.classList.contains('light');
  return {
    grid:   light ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
    tick:   light ? '#555' : '#888',
    orange: '#ff6b35',
    cyan:   '#00e5cc',
    purple: '#a78bfa',
  };
}

function buildStats(data) {
  const thisMonth = new Date().toISOString().slice(0, 7); // e.g. '2026-03'
  const monthData = data.filter(d => d.date.startsWith(thisMonth));
  const lifeData  = data; // all data starts from birth

  const lifeCost   = lifeData.reduce((s,d) => s+d.cost, 0);
  const lifeOutput = lifeData.reduce((s,d) => s+safeTokens(d).output, 0);
  const lifeInput  = lifeData.reduce((s,d) => { const tk=safeTokens(d); return s+tk.cache_write+tk.cache_read+tk.input; }, 0);
  const lifeDays   = lifeData.filter(d => d.cost > 0).length;
  const lifeAvg    = lifeDays > 0 ? lifeCost / lifeDays : 0;
  const peak       = lifeData.reduce((a,b) => b.cost > a.cost ? b : a);

  const monthCost  = monthData.reduce((s,d) => s+d.cost, 0);
  const monthDays  = monthData.filter(d => d.cost > 0).length;
  const monthAvg   = monthDays > 0 ? monthCost / monthDays : 0;
  const monthOutput = monthData.reduce((s,d) => s+safeTokens(d).output, 0);
  const monthInput  = monthData.reduce((s,d) => { const tk=safeTokens(d); return s+tk.cache_write+tk.cache_read+tk.input; }, 0);

  const row = document.getElementById('ustat-row');
  row.innerHTML = `
    <!-- Section 1: lifetime -->
    <div class="ustat-section-label">🌱 生涯统计（2026-02-11 起）</div>
    <div class="ustat-cards">
      ${[
        { icon:'💵', label: t('s_life_cost'),  val: '$'+lifeCost.toFixed(2),       sub: lifeDays+' active days' },
        { icon:'📊', label: t('s_life_avg'),   val: '$'+lifeAvg.toFixed(2),        sub: '/ day · active avg' },
        { icon:'💬', label: t('s_life_out'),   val: fmt(lifeOutput),               sub: 'output tokens' },
        { icon:'📥', label: t('s_life_in'),    val: fmt(lifeInput),                sub: 'input tokens' },
        { icon:'📈', label: t('s_life_peak'),  val: '$'+peak.cost.toFixed(2),       sub: peak.date.slice(5) },
      ].map(c => `
        <div class="ustat-card">
          <span class="usc-icon">${c.icon}</span>
          <div class="usc-body">
            <div class="usc-label">${c.label}</div>
            <div class="usc-val">${c.val}</div>
            <div class="usc-sub">${c.sub}</div>
          </div>
        </div>`).join('')}
    </div>
    <!-- Section 2: this month -->
    <div class="ustat-section-label" style="margin-top:8px">📅 本月统计（${thisMonth}）</div>
    <div class="ustat-cards">
      ${[
        { icon:'🗓️', label: t('s_month_cost'), val: '$'+monthCost.toFixed(2),        sub: monthDays+' active days' },
        { icon:'⚖️', label: t('s_month_avg'),  val: '$'+monthAvg.toFixed(2),          sub: '/ day · active avg' },
        { icon:'💬', label: t('s_month_out'),  val: fmt(monthOutput),                sub: 'output tokens' },
        { icon:'📥', label: t('s_month_in'),   val: fmt(monthInput),                 sub: 'input tokens' },
      ].map(c => `
        <div class="ustat-card">
          <span class="usc-icon">${c.icon}</span>
          <div class="usc-body">
            <div class="usc-label">${c.label}</div>
            <div class="usc-val">${c.val}</div>
            <div class="usc-sub">${c.sub}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function buildMainChart(data) {
  const ctx = document.getElementById('chart-main').getContext('2d');
  const c = themeColors();
  const labels = data.map(d => d.date.slice(5));
  const costs  = data.map(d => d.cost);

  // month boundary annotation: find where month changes
  const annotations = [];
  let prevMonth = '';
  data.forEach((d, i) => {
    const m = d.date.slice(0, 7);
    if (m !== prevMonth && prevMonth !== '') {
      annotations.push(i);
    }
    prevMonth = m;
  });

  if (chartMain) chartMain.destroy();
  chartMain = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Cost (USD)',
          data: costs,
          borderColor: c.orange,
          backgroundColor: c.orange + '15',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: costs.map(v => v > 100 ? '#ff3333' : c.orange),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(14,14,24,0.95)',
          titleColor: '#fff',
          bodyColor: '#bbb',
          borderColor: c.orange,
          borderWidth: 1,
          padding: 14,
          callbacks: {
            title: items => '📅 ' + data[items[0].dataIndex].date,
            label: items => {
              const d = data[items.dataIndex];
              return [
                ` 💵 费用：$${d.cost.toFixed(2)}`,
                ``,
                ` ✍️  Cache Write：${fmt(safeTokens(d).cache_write)}`,
                ` 📖 Cache Read： ${fmt(safeTokens(d).cache_read)}`,
                ` 💬 Output：     ${fmt(safeTokens(d).output)}`,
                ` 📥 Input：      ${fmt(safeTokens(d).input)}`,
              ];
            },
          }
        }
      },
      scales: {
        x: {
          grid: { color: c.grid },
          ticks: {
            color: c.tick,
            font: { family: 'monospace', size: 11 },
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: 16,
          }
        },
        y: {
          grid: { color: c.grid },
          ticks: {
            color: c.tick,
            font: { family: 'monospace', size: 11 },
            callback: v => '$' + v.toFixed(0)
          },
          beginAtZero: true,
        }
      }
    }
  });
}

function buildTokenChart(data) {
  const ctx = document.getElementById('chart-tokens').getContext('2d');
  const c = themeColors();
  const labels = data.map(d => d.date.slice(5));

  if (chartTokens) chartTokens.destroy();
  chartTokens = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Output',      data: data.map(d => safeTokens(d).output),      backgroundColor: c.purple+'cc', stack:'tk' },
        { label: 'Cache Read',  data: data.map(d => safeTokens(d).cache_read),  backgroundColor: c.cyan+'77',   stack:'tk' },
        { label: 'Cache Write', data: data.map(d => safeTokens(d).cache_write), backgroundColor: c.orange+'99', stack:'tk' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: c.tick, font:{ size:11 }, boxWidth:12, padding:14 } },
        tooltip: {
          backgroundColor: 'rgba(14,14,24,0.95)',
          titleColor: '#fff',
          bodyColor: '#bbb',
          borderColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          }
        }
      },
      scales: {
        x: { stacked:true, grid:{display:false}, ticks:{ color:c.tick, font:{family:'monospace',size:10}, maxTicksLimit:16, autoSkip:true, maxRotation:45 } },
        y: { stacked:true, grid:{color:c.grid},  ticks:{ color:c.tick, font:{family:'monospace',size:10}, callback: v=>fmt(v) }, beginAtZero:true }
      }
    }
  });
}

function buildTable(data) {
  const tbody = document.getElementById('utable-body');
  tbody.innerHTML = [...data].reverse().map((d, i) => `
    <tr class="${i===0?'tr-latest':''}">
      <td class="td-date">${d.date}</td>
      <td class="td-cost">${d.cost>0?'$'+d.cost.toFixed(2):'—'}</td>
      <td>${fmt(safeTokens(d).cache_write)||'—'}</td>
      <td>${fmt(safeTokens(d).cache_read)||'—'}</td>
      <td class="td-out">${fmt(safeTokens(d).output)||'—'}</td>
      <td>${fmt(safeTokens(d).input)||'—'}</td>
    </tr>`).join('');
}

function updateText() {
  const set = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = t(key); };
  set('u-title', 'title');
  set('u-sub', 'sub');
  set('u-chart-label', 'chart_label');
  set('u-token-label', 'token_label');
  set('u-table-title', 'table_title');
  set('u-note', 'note');
}

// 图表主题响应：监听 nav.js 的 themechange 事件重绘图表
function initThemeListener(data) {
  window.addEventListener('themechange', () => {
    buildMainChart(data);
    buildTokenChart(data);
  });
}

// 语言切换：监听 nav.js 的 langchange 事件
function initLangListener(data) {
  window.addEventListener('langchange', e => {
    lang = e.detail.lang;
    updateText();
    buildStats(data);
    buildMainChart(data);
    buildTokenChart(data);
  });
}

async function init() {
  try {
    const resp = await fetch('data/usage.json?v=' + Date.now());
    const data = await resp.json();
    updateText();
    buildStats(data);
    buildMainChart(data);
    buildTokenChart(data);
    initThemeListener(data);
    initLangListener(data);
  } catch(e) {
    console.error('[usage] init error:', e);
    const row = document.getElementById('ustat-row');
    if (row) row.innerHTML = '<div style="color:#ff6b35;padding:20px;font-family:monospace">⚠️ 加载失败: ' + e.message + '</div>';
  }
}

document.addEventListener('DOMContentLoaded', init);


