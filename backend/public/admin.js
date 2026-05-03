const LANGUAGE_LABELS = {
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
  catalog: null,
  trial: null,
  trialDialect: 'north'
};

const elements = {
  status: document.getElementById('status'),
  authHint: document.getElementById('auth-hint'),
  adminShell: document.getElementById('admin-shell'),
  adminPassword: document.getElementById('admin-password'),
  adminLogin: document.getElementById('admin-login'),
  adminLogout: document.getElementById('admin-logout'),
  redeemCodeBody: document.getElementById('redeem-code-body'),
  userBody: document.getElementById('user-body'),
  redeemCodeInput: document.getElementById('redeem-code-input'),
  redeemPrefixInput: document.getElementById('redeem-prefix-input'),
  redeemCountInput: document.getElementById('redeem-count-input'),
  redeemDialectInput: document.getElementById('redeem-dialect-input'),
  redeemNoteInput: document.getElementById('redeem-note-input'),
  trialEditor: document.getElementById('trial-editor'),
  catalogEditor: document.getElementById('catalog-editor')
};

function setStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
}

function updateAuthView() {
  elements.adminShell.classList.toggle('locked', !state.authenticated);
  elements.adminLogin.classList.toggle('hidden', state.authenticated);
  elements.adminLogout.classList.toggle('hidden', !state.authenticated);
  elements.adminPassword.disabled = state.authenticated;
  elements.authHint.textContent = state.authenticated
    ? '已登录后台，可以编辑目录、试听内容和激活码。'
    : state.hasCustomPassword
      ? '请输入管理员密码后再编辑内容。'
      : '后台密码尚未完成生产配置，请先配置 ADMIN_PASSWORD。';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
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

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function labelDialect(dialect) {
  return LANGUAGE_LABELS[dialect] || dialect || '-';
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRedeemCodes(items) {
  elements.redeemCodeBody.innerHTML = items.map((item) => `
    <tr>
      <td><code>${escapeHtml(item.code)}</code></td>
      <td>${escapeHtml(item.dialect ? labelDialect(item.dialect) : '全部语种')}</td>
      <td>${escapeHtml(item.batchId || '-')}</td>
      <td>${escapeHtml(item.note || '-')}</td>
      <td><span class="badge ${item.used ? 'muted' : 'success'}">${item.used ? '已使用' : '可用'}</span></td>
      <td>${escapeHtml(item.usedBy || '-')}</td>
      <td>${formatTime(item.usedAt)}</td>
    </tr>
  `).join('');
}

function renderUsers(users) {
  elements.userBody.innerHTML = users.map((user) => `
    <tr>
      <td>${escapeHtml(user.auth && user.auth.nickName || '-')}</td>
      <td>${escapeHtml(user.auth && user.auth.phone || '-')}</td>
      <td>${escapeHtml(labelDialect(user.selectedDialect))}</td>
      <td><span class="badge ${user.product && user.product.unlocked ? 'success' : ''}">${user.product && user.product.unlocked ? '已开通' : '未开通'}</span></td>
      <td>${formatTime(user.updatedAt)}</td>
    </tr>
  `).join('');
}

function updateTrialButtons() {
  document.querySelectorAll('[data-trial-dialect]').forEach((button) => {
    button.classList.toggle('active', button.dataset.trialDialect === state.trialDialect);
  });
}

function renderTrialEditor() {
  if (!state.trial) return;
  updateTrialButtons();
  elements.trialEditor.value = JSON.stringify(state.trial[state.trialDialect], null, 2);
}

function renderCatalogEditor() {
  if (!state.catalog) return;
  elements.catalogEditor.value = JSON.stringify(state.catalog, null, 2);
}

async function refreshSession() {
  const session = await api('/api/admin/session');
  state.authenticated = !!session.authenticated;
  state.hasCustomPassword = !!session.hasCustomPassword;
  updateAuthView();
  return session;
}

async function loadRedeemCodes() {
  renderRedeemCodes(await api('/api/admin/redeem-codes'));
}

async function loadUsers() {
  renderUsers(await api('/api/admin/users'));
}

async function loadTrial() {
  state.trial = await api('/api/admin/trial');
  renderTrialEditor();
}

async function loadCatalog() {
  state.catalog = await api('/api/admin/catalog');
  renderCatalogEditor();
}

async function reloadAll() {
  await refreshSession();
  if (!state.authenticated) {
    setStatus('请先登录后台', 'info');
    return;
  }
  setStatus('正在刷新后台数据...', 'info');
  await Promise.all([loadRedeemCodes(), loadUsers(), loadTrial(), loadCatalog()]);
  setStatus('后台数据刷新完成', 'success');
}

function parseEditor(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} 不是合法 JSON`);
  }
}

async function withAuth(action, options = {}) {
  try {
    await action();
  } catch (error) {
    if (error.statusCode === 401) {
      state.authenticated = false;
      updateAuthView();
      setStatus(options.loginAction ? (error.message || '管理员密码不正确') : '登录状态已失效，请重新输入管理员密码', 'error');
      return;
    }
    setStatus(error.message, 'error');
  }
}

function saveCurrentTrialDraft() {
  if (!state.trial) return true;
  try {
    state.trial[state.trialDialect] = parseEditor(elements.trialEditor.value, '试听内容');
    return true;
  } catch (error) {
    setStatus(error.message, 'error');
    return false;
  }
}

function bindEvents() {
  elements.adminLogin.addEventListener('click', async () => {
    await withAuth(async () => {
      setStatus('正在登录后台...', 'info');
      await api('/api/admin/session', {
        method: 'POST',
        body: { password: elements.adminPassword.value.trim() }
      });
      elements.adminPassword.value = '';
      await reloadAll();
      setStatus('后台登录成功', 'success');
    }, { loginAction: true });
  });

  elements.adminLogout.addEventListener('click', async () => {
    await withAuth(async () => {
      await api('/api/admin/session', { method: 'DELETE' });
      state.authenticated = false;
      updateAuthView();
      setStatus('已退出后台登录', 'success');
    });
  });

  document.getElementById('reload-all').addEventListener('click', () => withAuth(reloadAll));
  document.getElementById('refresh-users').addEventListener('click', () => withAuth(async () => {
    setStatus('正在刷新用户列表...', 'info');
    await loadUsers();
    setStatus('用户列表已刷新', 'success');
  }));

  document.getElementById('create-redeem-code').addEventListener('click', () => withAuth(async () => {
    setStatus('正在生成激活码...', 'info');
    const code = elements.redeemCodeInput.value.trim();
    const prefix = elements.redeemPrefixInput.value.trim();
    const count = Number(elements.redeemCountInput.value || 1);
    const dialect = elements.redeemDialectInput.value || 'all';
    const note = elements.redeemNoteInput.value.trim();
    const data = await api('/api/admin/redeem-codes', {
      method: 'POST',
      body: { code, prefix, count, note, dialect }
    });
    elements.redeemCodeInput.value = data.code || (data.codes && data.codes[0] && data.codes[0].code) || '';
    elements.redeemCountInput.value = '1';
    await loadRedeemCodes();
    setStatus(`已生成 ${data.count || 1} 个激活码`, 'success');
  }));

  document.querySelectorAll('[data-trial-dialect]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!saveCurrentTrialDraft()) return;
      state.trialDialect = button.dataset.trialDialect;
      renderTrialEditor();
    });
  });

  document.getElementById('format-trial').addEventListener('click', () => {
    try {
      elements.trialEditor.value = JSON.stringify(parseEditor(elements.trialEditor.value, '试听内容'), null, 2);
      setStatus('试听内容已格式化', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  document.getElementById('save-trial').addEventListener('click', () => withAuth(async () => {
    if (!saveCurrentTrialDraft()) return;
    if (!window.confirm('确认保存当前试听内容？系统会先校验并自动备份旧文件。')) return;
    setStatus('正在保存试听内容...', 'info');
    state.trial = await api('/api/admin/trial', { method: 'PUT', body: { trial: state.trial } });
    renderTrialEditor();
    setStatus('试听内容已保存，旧版本已备份', 'success');
  }));

  document.getElementById('format-catalog').addEventListener('click', () => {
    try {
      elements.catalogEditor.value = JSON.stringify(parseEditor(elements.catalogEditor.value, '课程目录'), null, 2);
      setStatus('课程目录已格式化', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  document.getElementById('save-catalog').addEventListener('click', () => withAuth(async () => {
    const parsed = parseEditor(elements.catalogEditor.value, '课程目录');
    if (!window.confirm('确认保存课程目录？系统会先校验并自动备份旧文件。')) return;
    setStatus('正在保存课程目录...', 'info');
    state.catalog = await api('/api/admin/catalog', { method: 'PUT', body: { catalog: parsed } });
    renderCatalogEditor();
    await loadUsers();
    setStatus('课程目录已保存，旧版本已备份', 'success');
  }));
}

bindEvents();
refreshSession()
  .then(() => (state.authenticated ? reloadAll() : setStatus('请先登录后台', 'info')))
  .catch((error) => setStatus(error.message, 'error'));
