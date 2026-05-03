const LANGUAGE_LABELS = {
  all: '全部语种',
  north: '北越',
  south: '南越',
  thai: '泰语',
  malay: '马来语',
  indo: '印尼语',
  tagalog: '菲律宾语',
  hindi: '印地语',
  tamil: '泰米尔语'
};

const state = {
  authenticated: false,
  hasCustomPassword: false,
  codes: [],
  latest: []
};

const elements = {
  status: document.getElementById('status'),
  authCard: document.getElementById('auth-card'),
  authHint: document.getElementById('auth-hint'),
  workbench: document.getElementById('workbench'),
  historyPanel: document.getElementById('history-panel'),
  password: document.getElementById('admin-password'),
  login: document.getElementById('admin-login'),
  logout: document.getElementById('admin-logout'),
  dialect: document.getElementById('dialect'),
  prefix: document.getElementById('prefix'),
  count: document.getElementById('count'),
  code: document.getElementById('code'),
  note: document.getElementById('note'),
  create: document.getElementById('create'),
  copyLatest: document.getElementById('copy-latest'),
  refresh: document.getElementById('refresh'),
  copyAvailable: document.getElementById('copy-available'),
  latestSummary: document.getElementById('latest-summary'),
  latestOutput: document.getElementById('latest-output'),
  codeBody: document.getElementById('code-body')
};

function setStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.message || '请求失败');
    error.statusCode = response.status;
    throw error;
  }
  return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function updateAuthView() {
  elements.workbench.classList.toggle('locked', !state.authenticated);
  elements.historyPanel.classList.toggle('locked', !state.authenticated);
  elements.login.classList.toggle('hidden', state.authenticated);
  elements.logout.classList.toggle('hidden', !state.authenticated);
  elements.password.disabled = state.authenticated;
  elements.authHint.textContent = state.authenticated
    ? '已登录，可以直接生成并发放激活码。'
    : state.hasCustomPassword
      ? '请输入管理员密码。'
      : '当前仍可使用默认密码登录，建议上线后配置 ADMIN_PASSWORD。';
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function labelDialect(dialect) {
  return LANGUAGE_LABELS[dialect || 'all'] || dialect || '-';
}

function renderCodes() {
  elements.codeBody.innerHTML = state.codes.slice(0, 300).map((item) => `
    <tr>
      <td><code>${escapeHtml(item.code)}</code></td>
      <td>${escapeHtml(labelDialect(item.dialect))}</td>
      <td>${escapeHtml(item.batchId || '-')}</td>
      <td>${escapeHtml(item.note || '-')}</td>
      <td><span class="badge ${item.used ? 'used' : ''}">${item.used ? '已使用' : '可用'}</span></td>
      <td>${escapeHtml(item.usedBy || '-')}</td>
      <td>${formatTime(item.usedAt || item.createdAt)}</td>
    </tr>
  `).join('');
}

function renderLatest() {
  elements.latestSummary.textContent = state.latest.length
    ? `本次生成 ${state.latest.length} 个码。`
    : '还没有生成。';
  elements.latestOutput.value = state.latest.map((item) => item.code).join('\n');
}

async function refreshSession() {
  const session = await api('/api/admin/session');
  state.authenticated = !!session.authenticated;
  state.hasCustomPassword = !!session.hasCustomPassword;
  updateAuthView();
  if (state.authenticated) {
    await loadCodes();
  }
}

async function loadCodes() {
  state.codes = await api('/api/admin/redeem-codes');
  renderCodes();
}

async function withAuth(action, options = {}) {
  try {
    await action();
  } catch (error) {
    if (error.statusCode === 401) {
      state.authenticated = false;
      updateAuthView();
      setStatus(options.loginAction ? (error.message || '管理员密码不正确。') : '登录已失效，请重新登录。', 'error');
      return;
    }
    setStatus(error.message || '操作失败', 'error');
  }
}

function normalizeGenerated(data) {
  if (Array.isArray(data && data.codes)) return data.codes;
  if (data && data.code) return [data];
  return [];
}

async function createCodes() {
  await withAuth(async () => {
    const code = elements.code.value.trim();
    const count = Number(elements.count.value || 1);
    if (code && count > 1) {
      setStatus('指定激活码时数量只能为 1。', 'error');
      return;
    }
    setStatus('正在生成并写入服务器...', 'info');
    const data = await api('/api/admin/redeem-codes', {
      method: 'POST',
      body: {
        code,
        prefix: elements.prefix.value.trim(),
        count,
        dialect: elements.dialect.value,
        note: elements.note.value.trim()
      }
    });
    state.latest = normalizeGenerated(data);
    renderLatest();
    elements.code.value = '';
    elements.count.value = '1';
    await loadCodes();
    setStatus(`已生成 ${state.latest.length} 个激活码，用户现在可以兑换。`, 'success');
  });
}

async function copyText(text, message) {
  if (!text) {
    setStatus('没有可复制的内容。', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus(message, 'success');
  } catch (error) {
    elements.latestOutput.select();
    document.execCommand('copy');
    setStatus(message, 'success');
  }
}

function bindEvents() {
  elements.login.addEventListener('click', () => withAuth(async () => {
    setStatus('正在登录...', 'info');
    await api('/api/admin/session', {
      method: 'POST',
      body: { password: elements.password.value.trim() }
    });
    elements.password.value = '';
    state.authenticated = true;
    updateAuthView();
    await loadCodes();
    setStatus('登录成功。', 'success');
  }, { loginAction: true }));

  elements.logout.addEventListener('click', () => withAuth(async () => {
    await api('/api/admin/session', { method: 'DELETE' });
    state.authenticated = false;
    state.codes = [];
    updateAuthView();
    renderCodes();
    setStatus('已退出登录。', 'success');
  }));

  elements.create.addEventListener('click', createCodes);
  elements.refresh.addEventListener('click', () => withAuth(async () => {
    await loadCodes();
    setStatus('记录已刷新。', 'success');
  }));
  elements.copyLatest.addEventListener('click', () => copyText(
    state.latest.map((item) => item.code).join('\n'),
    '已复制本次生成的激活码。'
  ));
  elements.copyAvailable.addEventListener('click', () => copyText(
    state.codes.filter((item) => !item.used).map((item) => item.code).join('\n'),
    '已复制全部可用激活码。'
  ));
}

bindEvents();
refreshSession().catch((error) => setStatus(error.message || '后台状态读取失败', 'error'));
