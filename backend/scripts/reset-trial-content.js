const { trialItems } = require('../../data/mock');
const { filterTrialForRelease } = require('../../utils/content-filter');
const store = require('../src/store');

const releaseTrial = filterTrialForRelease(trialItems);

store.writeTrial(releaseTrial, { backup: true });

console.log('Trial content reset from data/mock.js.');
Object.entries(releaseTrial).forEach(([dialect, item]) => {
  console.log(`${dialect}: ${item.text} (${item.segments.length} segments)`);
});
