const { catalog, trialItems } = require('../../data/mock');
const { DIALECTS } = require('../../data/content-standard');
const { filterCatalogForRelease, filterTrialForRelease } = require('../../utils/content-filter');
const store = require('../src/store');

const releaseCatalog = filterCatalogForRelease(catalog);
const releaseTrial = filterTrialForRelease(trialItems);

store.writeCatalog(releaseCatalog, { backup: true });
store.writeTrial(releaseTrial, { backup: true });

console.log('Release catalog and trial content reset from data/mock.js.');
DIALECTS.forEach((dialect) => {
  const levels = releaseCatalog[dialect].levels || [];
  const lessons = levels.flatMap((level) => level.lessons || []);
  const items = lessons.flatMap((lesson) => lesson.items || []);
  console.log(`${dialect}: ${items.length} course items, trial=${releaseTrial[dialect].text}`);
});
