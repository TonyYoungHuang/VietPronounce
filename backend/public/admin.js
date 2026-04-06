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

  if (state.authenticated) {
    elements.authHint.textContent = '已登录后台，可以继续编辑目录、试听内容和兑换码。';
    return;
  }

  elements.authHint.textContent = state.hasCustomPassword
    ? '请输入你配置的管理员密码后再编辑内容。'
    : '未设置环境变量时，使用默认密码登录；建议后续改成自定义 ADMIN_PASSWORD。';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
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

function renderRedeemCodes(items) {
  elements.redeemCodeBody.innerHTML = items.map((item) => `
    <tr>
      <td><code>${item.code}</code></td>
      <td><span class="badge ${item.used ? 'muted' : 'success'}">${item.used ? '已使用' : '可用'}</span></td>
      <td>${item.usedBy || '-'}</td>
      <td>${formatTime(item.usedAt)}</td>
    </tr>
  `).join('');
}

function renderUsers(users) {
  elements.userBody.innerHTML = users.map((user) => `
    <tr>
      <td>${user.auth?.nickName || '-'}</td>
      <td>${user.auth?.phone || '-'}</td>
      <td>${user.selectedDialect === 'south' ? '南越' : '北越'}</td>
      <td><span class="badge ${user.product?.unlocked ? 'success' : ''}">${user.product?.unlocked ? '已开通' : '未开通'}</span></td>
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
  const data = await api('/api/admin/redeem-codes');
  renderRedeemCodes(data);
}

async function loadUsers() {
  const data = await api('/api/admin/users');
  renderUsers(data);
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

async function withAuth(action) {
  try {
    await action();
  } catch (error) {
    if (error.statusCode === 401) {
      state.authenticated = false;
      updateAuthView();
      setStatus('登录状态已失效，请重新输入管理员密码', 'error');
      return;
    }
    setStatus(error.message, 'error');
  }
}

function bindEvents() {
  elements.adminLogin.addEventListener('click', async () => {
    await withAuth(async () => {
      setStatus('正在登录后台...', 'info');
      const password = elements.adminPassword.value.trim();
      await api('/api/admin/session', { method: 'POST', body: { password } });
      elements.adminPassword.value = '';
      await reloadAll();
      setStatus('后台登录成功', 'success');
    });
  });

  elements.adminLogout.addEventListener('click', async () => {
    await withAuth(async () => {
      await api('/api/admin/session', { method: 'DELETE' });
      state.authenticated = false;
      updateAuthView();
      setStatus('已退出后台登录', 'success');
    });
  });

  document.getElementById('reload-all').addEventListener('click', () => {
    withAuth(async () => {
      await reloadAll();
    });
  });

  document.getElementById('refresh-users').addEventListener('click', async () => {
    await withAuth(async () => {
      setStatus('正在刷新用户列表...', 'info');
      await loadUsers();
      setStatus('用户列表已刷新', 'success');
    });
  });

  document.getElementById('create-redeem-code').addEventListener('click', async () => {
    await withAuth(async () => {
      setStatus('正在创建兑换码...', 'info');
      const code = elements.redeemCodeInput.value.trim();
      const data = await api('/api/admin/redeem-codes', { method: 'POST', body: { code } });
      elements.redeemCodeInput.value = data.code;
      await loadRedeemCodes();
      setStatus(`兑换码 ${data.code} 已创建`, 'success');
    });
  });

  document.querySelectorAll('[data-trial-dialect]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.trial) {
        try {
          state.trial[state.trialDialect] = parseEditor(elements.trialEditor.value, '试听内容');
        } catch (error) {
          setStatus(error.message, 'error');
          return;
        }
      }
      state.trialDialect = button.dataset.trialDialect;
      renderTrialEditor();
    });
  });

  document.getElementById('format-trial').addEventListener('click', () => {
    try {
      const parsed = parseEditor(elements.trialEditor.value, '试听内容');
      elements.trialEditor.value = JSON.stringify(parsed, null, 2);
      setStatus('试听内容已格式化', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  document.getElementById('save-trial').addEventListener('click', async () => {
    await withAuth(async () => {
      const parsed = parseEditor(elements.trialEditor.value, '试听内容');
      state.trial[state.trialDialect] = parsed;
      if (!window.confirm('确认保存当前试听内容？系统会先校验并自动备份旧文件。')) {
        return;
      }
      setStatus('正在保存试听内容...', 'info');
      state.trial = await api('/api/admin/trial', { method: 'PUT', body: { trial: state.trial } });
      renderTrialEditor();
      setStatus('试听内容已保存，旧版本已备份', 'success');
    });
  });

  document.getElementById('format-catalog').addEventListener('click', () => {
    try {
      const parsed = parseEditor(elements.catalogEditor.value, '课程目录');
      elements.catalogEditor.value = JSON.stringify(parsed, null, 2);
      setStatus('课程目录已格式化', 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  document.getElementById('save-catalog').addEventListener('click', async () => {
    await withAuth(async () => {
      const parsed = parseEditor(elements.catalogEditor.value, '课程目录');
      if (!window.confirm('确认保存课程目录？系统会先校验并自动备份旧文件。')) {
        return;
      }
      setStatus('正在保存课程目录...', 'info');
      state.catalog = await api('/api/admin/catalog', { method: 'PUT', body: { catalog: parsed } });
      renderCatalogEditor();
      await loadUsers();
      setStatus('课程目录已保存，旧版本已备份', 'success');
    });
  });
}

bindEvents();
refreshSession()
  .then(() => {
    updateAuthView();
    if (state.authenticated) {
      return reloadAll();
    }
    setStatus('请先登录后台', 'info');
    return null;
  })
  .catch((error) => setStatus(error.message, 'error'));
