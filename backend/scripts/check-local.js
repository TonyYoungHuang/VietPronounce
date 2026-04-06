const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const backendDir = path.resolve(__dirname, '..');
const backupDir = path.join(backendDir, 'storage', 'backups');
const port = 4102;
const baseUrl = `http://127.0.0.1:${port}`;
const adminPassword = 'check-pass-123';
let adminCookie = '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.cookie ? { Cookie: options.cookie } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && options.captureCookie) {
    adminCookie = setCookie.split(';')[0];
  }
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || `请求失败：${pathname}`);
  }
  return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

async function waitForHealth() {
  for (let index = 0; index < 40; index += 1) {
    try {
      const health = await requestJson('/health');
      if (health.status === 'ok') return;
    } catch (error) {
      // keep polling
    }
    await sleep(250);
  }
  throw new Error('后端健康检查超时');
}

async function stopServer(child) {
  if (!child || child.killed) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    sleep(2000)
  ]);
}

(async () => {
  const beforeBackups = fs.existsSync(backupDir) ? new Set(fs.readdirSync(backupDir)) : new Set();
  const child = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: { ...process.env, PORT: String(port), ADMIN_PASSWORD: adminPassword },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (chunk) => process.stdout.write(String(chunk)));
  child.stderr.on('data', (chunk) => process.stderr.write(String(chunk)));

  try {
    await waitForHealth();

    const catalog = await requestJson('/api/catalog');
    assert.ok(catalog.north && catalog.south, 'catalog 应包含 north / south');

    const trial = await requestJson('/api/trial?dialect=north');
    assert.equal(trial.levelId, 'beginner');

    const user = await requestJson('/api/auth/mock-login', {
      method: 'POST',
      body: { nickName: 'backend-check' }
    });
    assert.ok(user.userId, 'mock login 应返回 userId');

    const userId = user.userId;
    await requestJson('/api/auth/bind-phone', {
      method: 'POST',
      body: { userId, phone: '13800138000' }
    });

    const session = await requestJson('/api/admin/session');
    assert.equal(session.authenticated, false, '初始不应登录后台');

    await requestJson('/api/admin/session', {
      method: 'POST',
      body: { password: adminPassword },
      captureCookie: true
    });
    assert.ok(adminCookie, '后台登录后应拿到 cookie');

    const redeemCode = `CHECK-${Date.now()}`;
    await requestJson('/api/admin/redeem-codes', {
      method: 'POST',
      body: { code: redeemCode },
      cookie: adminCookie
    });
    await requestJson('/api/redeem', {
      method: 'POST',
      body: { userId, code: redeemCode }
    });

    const levels = await requestJson(`/api/levels?userId=${encodeURIComponent(userId)}&dialect=north`);
    assert.ok(Array.isArray(levels) && levels.length > 0, 'levels 不能为空');

    const levelId = catalog.north.levels[0].id;
    const lessons = await requestJson(`/api/lessons?userId=${encodeURIComponent(userId)}&dialect=north&levelId=${encodeURIComponent(levelId)}`);
    assert.ok(Array.isArray(lessons) && lessons.length > 0, 'lessons 不能为空');

    const item = catalog.north.levels[0].lessons[0].items[0];
    const savedUser = await requestJson('/api/progress/score', {
      method: 'POST',
      body: {
        userId,
        dialect: 'north',
        itemId: item.id,
        score: {
          total: 82,
          completeness: 80,
          accuracy: 85,
          fluency: 79,
          passed: true,
          issueIndices: [0],
          attemptCount: 1,
          durationMs: 2100,
          scoreSource: 'check'
        }
      }
    });
    assert.equal(savedUser.latestPracticeResult.itemId, item.id);

    const weakness = await requestJson(`/api/weakness?userId=${encodeURIComponent(userId)}&dialect=north`);
    assert.ok(Array.isArray(weakness), 'weakness 应返回数组');

    const adminUsers = await requestJson('/api/admin/users', { cookie: adminCookie });
    assert.ok(adminUsers.some((entry) => entry.userId === userId), 'admin users 应包含刚创建的用户');

    const currentCatalog = await requestJson('/api/admin/catalog', { cookie: adminCookie });
    await requestJson('/api/admin/catalog', {
      method: 'PUT',
      body: { catalog: currentCatalog },
      cookie: adminCookie
    });

    const currentTrial = await requestJson('/api/admin/trial', { cookie: adminCookie });
    await requestJson('/api/admin/trial', {
      method: 'PUT',
      body: { trial: currentTrial },
      cookie: adminCookie
    });

    const afterBackups = fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : [];
    const newBackups = afterBackups.filter((name) => !beforeBackups.has(name));
    assert.ok(newBackups.some((name) => name.startsWith('catalog-')), 'catalog 保存后应生成备份');
    assert.ok(newBackups.some((name) => name.startsWith('trial-')), 'trial 保存后应生成备份');

    console.log('Local integration check passed.');
  } catch (error) {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  } finally {
    await stopServer(child);
  }
})();
