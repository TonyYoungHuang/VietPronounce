const fs = require('fs');
const path = require('path');
const store = require('../src/store');
const { DIALECTS } = require('../../data/content-standard');

function normalizeCode(item) {
  if (!item || !item.code) return null;
  const dialect = DIALECTS.includes(item.dialect) ? item.dialect : 'all';
  return {
    code: String(item.code).trim().toUpperCase(),
    product: String(item.product || 'premium').trim() || 'premium',
    dialect,
    batchId: String(item.batchId || `IMPORT-${Date.now()}`).trim().toUpperCase(),
    note: String(item.note || '').trim(),
    createdAt: item.createdAt || new Date().toISOString(),
    used: Boolean(item.used),
    usedBy: item.usedBy || '',
    usedAt: item.usedAt || ''
  };
}

function readImportFile(filePath) {
  const resolved = path.resolve(filePath);
  const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.codes)) return payload.codes;
  throw new Error('导入文件必须是数组，或包含 codes 数组。');
}

function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('用法：node scripts/import-redeem-codes.js /path/to/redeem-codes.json');
    process.exit(1);
  }

  store.ensureStorage();
  const current = store.readRedeemCodes();
  const existing = new Set(current.map((item) => item.code));
  const incoming = readImportFile(filePath);
  const next = [];

  incoming.forEach((item) => {
    const normalized = normalizeCode(item);
    if (!normalized || !normalized.code || existing.has(normalized.code)) return;
    existing.add(normalized.code);
    next.push(normalized);
  });

  store.writeRedeemCodes([...next, ...current]);
  console.log(`Imported ${next.length} redeem codes. Total: ${next.length + current.length}`);
}

run();
