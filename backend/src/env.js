const fs = require('fs');
const path = require('path');

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const index = trimmed.indexOf('=');
  if (index === -1) return null;
  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (!key) return null;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const parsed = parseEnvLine(line);
    if (!parsed || Object.prototype.hasOwnProperty.call(process.env, parsed.key)) return;
    process.env[parsed.key] = parsed.value;
  });
}

function loadBackendEnv() {
  const backendDir = path.resolve(__dirname, '..');
  loadEnvFile(path.join(backendDir, '.env.local'));
  loadEnvFile(path.join(backendDir, '.env'));
}

module.exports = {
  loadBackendEnv
};
