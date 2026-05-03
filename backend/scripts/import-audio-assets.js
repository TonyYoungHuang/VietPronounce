const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const REPORT_DIR = path.join(__dirname, '..', 'reports');
const MANIFEST_PATH = path.join(REPORT_DIR, 'audio-upload-manifest.json');
const REPORT_PATH = path.join(REPORT_DIR, 'audio-import-report.json');
const DEFAULT_STAGING_ROOT = path.join(__dirname, '..', 'audio-staging');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolveTargetPath(expectedPath) {
  const relative = String(expectedPath || '').replace(/^\//, '');
  return path.join(REPO_ROOT, relative);
}

function run() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('Audio upload manifest not found. Run npm run audio:pack first.');
  }

  const stagingRoot = path.resolve(process.env.AUDIO_STAGING_DIR || DEFAULT_STAGING_ROOT);
  const manifest = readJson(MANIFEST_PATH);
  const imported = [];
  const missing = [];

  (manifest.items || []).forEach((item) => {
    const sourcePath = path.join(stagingRoot, item.stagingPath);
    const targetPath = resolveTargetPath(item.expectedPath);
    if (!fs.existsSync(sourcePath)) {
      missing.push({
        id: item.id,
        text: item.text,
        dialect: item.dialect,
        mode: item.mode,
        sourcePath,
        targetPath
      });
      return;
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    imported.push({
      id: item.id,
      sourcePath,
      targetPath
    });
  });

  const report = {
    generatedAt: new Date().toISOString(),
    stagingRoot,
    imported: imported.length,
    missing: missing.length,
    importedItems: imported,
    missingItems: missing
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Audio import completed. Imported: ${imported.length}, missing: ${missing.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

run();
