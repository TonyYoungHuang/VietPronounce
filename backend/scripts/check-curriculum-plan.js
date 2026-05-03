const assert = require('assert');
const {
  TARGET_ITEMS_PER_DIALECT,
  TARGET_LESSONS_PER_DIALECT,
  TARGET_ITEMS_PER_LESSON,
  curriculumPlan
} = require('../../data/curriculum-plan');
const { DIALECTS } = require('../../data/content-standard');

function sumContentMix(lesson) {
  return Object.values(lesson.contentMix || {}).reduce((total, value) => total + Number(value || 0), 0);
}

function run() {
  for (const dialect of DIALECTS) {
    const plan = curriculumPlan[dialect];
    assert.ok(plan, `Missing curriculum plan: ${dialect}`);
    assert.equal(plan.targetItems, TARGET_ITEMS_PER_DIALECT, `${dialect} target item count mismatch`);
    assert.equal(plan.targetLessons, TARGET_LESSONS_PER_DIALECT, `${dialect} target lesson count mismatch`);
    assert.equal(plan.lessons.length, TARGET_LESSONS_PER_DIALECT, `${dialect} lesson count mismatch`);
    assert.ok(plan.pronunciationCore.length >= 5, `${dialect} pronunciation core is too thin`);
    assert.ok(plan.difficultPoints.length >= 5, `${dialect} difficult points are too thin`);
    assert.ok(plan.scoringDimensions.length >= 5, `${dialect} scoring dimensions are too thin`);

    const itemTotal = plan.lessons.reduce((total, lesson) => {
      assert.equal(lesson.targetItems, TARGET_ITEMS_PER_LESSON, `${lesson.id} target item count mismatch`);
      assert.equal(sumContentMix(lesson), TARGET_ITEMS_PER_LESSON, `${lesson.id} content mix mismatch`);
      assert.ok(lesson.focus.length || lesson.order > 6, `${lesson.id} should include language-specific focus`);
      return total + lesson.targetItems;
    }, 0);

    assert.equal(itemTotal, TARGET_ITEMS_PER_DIALECT, `${dialect} lesson item total mismatch`);
  }

  console.log(`Curriculum plan check passed. Dialects=${DIALECTS.length}, targetItemsPerDialect=${TARGET_ITEMS_PER_DIALECT}`);
}

run();
