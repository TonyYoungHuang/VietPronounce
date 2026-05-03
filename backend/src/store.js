const fs = require('fs');
const path = require('path');
const { catalog, trialItems, redeemCodes } = require('../../data/mock');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups');
const FILES = {
  catalog: 'catalog.json',
  trial: 'trial.json',
  redeemCodes: 'redeem-codes.json',
  users: 'users.json'
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedRedeemCodes() {
  return redeemCodes.map((code) => ({
    code,
    used: false,
    usedBy: '',
    usedAt: ''
  }));
}

function getDefaultValue(name) {
  if (name === 'catalog') return clone(catalog);
  if (name === 'trial') return clone(trialItems);
  if (name === 'redeemCodes') return seedRedeemCodes();
  if (name === 'users') return {};
  return null;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureStorage() {
  ensureDir(STORAGE_DIR);
  ensureDir(BACKUP_DIR);
}

function getFilePath(name) {
  const fileName = FILES[name];
  if (!fileName) {
    throw new Error(`未知存储文件：${name}`);
  }
  return path.join(STORAGE_DIR, fileName);
}

function getBackupDir() {
  ensureStorage();
  return BACKUP_DIR;
}

function readJson(name) {
  ensureStorage();
  const filePath = getFilePath(name);
  if (!fs.existsSync(filePath)) {
    const seeded = getDefaultValue(name);
    writeJson(name, seeded);
    return seeded;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    const fallback = getDefaultValue(name);
    writeJson(name, fallback, { backup: true });
    return fallback;
  }
}

function createBackup(name) {
  ensureStorage();
  const sourcePath = getFilePath(name);
  if (!fs.existsSync(sourcePath)) return '';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${name}-${stamp}.json`);
  fs.copyFileSync(sourcePath, backupPath);
  return backupPath;
}

function writeJson(name, value, options = {}) {
  ensureStorage();
  if (options.backup) {
    createBackup(name);
  }
  const filePath = getFilePath(name);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return value;
}

function readCatalog() {
  const current = readJson('catalog') || {};
  const next = { ...current };
  let changed = false;
  Object.keys(catalog).forEach((dialect) => {
    if (!next[dialect]) {
      next[dialect] = clone(catalog[dialect]);
      changed = true;
    }
  });
  return changed ? writeCatalog(next, { backup: true }) : current;
}

function writeCatalog(value, options) {
  return writeJson('catalog', value, options);
}

function readTrial() {
  const current = readJson('trial') || {};
  const next = { ...current };
  let changed = false;
  Object.keys(trialItems).forEach((dialect) => {
    if (!next[dialect]) {
      next[dialect] = clone(trialItems[dialect]);
      changed = true;
    }
  });
  return changed ? writeTrial(next, { backup: true }) : current;
}

function writeTrial(value, options) {
  return writeJson('trial', value, options);
}

function readRedeemCodes() {
  return readJson('redeemCodes');
}

function writeRedeemCodes(value) {
  return writeJson('redeemCodes', value);
}

function readUsers() {
  return readJson('users');
}

function writeUsers(value) {
  return writeJson('users', value);
}

module.exports = {
  ensureStorage,
  getFilePath,
  getBackupDir,
  readJson,
  writeJson,
  readCatalog,
  writeCatalog,
  readTrial,
  writeTrial,
  readRedeemCodes,
  writeRedeemCodes,
  readUsers,
  writeUsers
};
