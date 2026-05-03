const appApi = require('../services/app-api');
const store = require('./store');
const { markOnline } = require('./network-status');

const QUEUE_KEY = 'vi_coach_pending_sync_v1';

function readQueue() {
  try {
    const queue = wx.getStorageSync(QUEUE_KEY);
    return Array.isArray(queue) ? queue : [];
  } catch (error) {
    return [];
  }
}

function writeQueue(queue) {
  try {
    wx.setStorageSync(QUEUE_KEY, queue);
  } catch (error) {}
  return queue;
}

function enqueueSyncTask(type, payload) {
  const queue = readQueue();
  const task = {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0
  };
  writeQueue([...queue, task].slice(-30));
  return task;
}

async function runTask(task) {
  if (task.type === 'progressScore') {
    const { userId, dialect, itemId, score } = task.payload || {};
    if (!userId || !dialect || !itemId || !score) return true;
    const remoteUser = await appApi.saveProgressScore(userId, dialect, itemId, score);
    store.hydrateFromRemoteUser(remoteUser);
    return true;
  }

  if (task.type === 'bindPhone') {
    const { userId, phone } = task.payload || {};
    if (!userId || !phone) return true;
    const remoteUser = await appApi.bindPhone(userId, phone);
    store.hydrateFromRemoteUser(remoteUser);
    return true;
  }

  return true;
}

async function flushSyncQueue() {
  const queue = readQueue();
  if (!queue.length) return { ok: true, remaining: 0, synced: 0 };

  const remaining = [];
  let synced = 0;
  for (const task of queue) {
    try {
      await runTask(task);
      synced += 1;
    } catch (error) {
      remaining.push({
        ...task,
        attempts: Number(task.attempts || 0) + 1,
        lastError: error.message || '同步失败',
        lastTriedAt: new Date().toISOString()
      });
    }
  }

  writeQueue(remaining.slice(-30));
  if (!remaining.length) markOnline();
  return { ok: !remaining.length, remaining: remaining.length, synced };
}

function getPendingSyncCount() {
  return readQueue().length;
}

module.exports = {
  enqueueSyncTask,
  flushSyncQueue,
  getPendingSyncCount
};
