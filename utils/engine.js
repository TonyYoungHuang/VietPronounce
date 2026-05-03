function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createSeed(text) {
  return text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function scoreRecording(item, durationMs, attemptCount) {
  const seconds = Math.max(0.8, durationMs / 1000);
  const seed = createSeed(item.id) % 19;
  const typeBonusMap = {
    syllable: 2,
    word: 4,
    sentence: 6
  };
  const typeBonus = typeBonusMap[item.type] || 3;
  const retryBonus = Math.min(6, Math.max(0, attemptCount - 1) * 2);
  const durationBonus = clamp(Math.round(seconds * 7), 5, 24);
  const flowBonus = seconds >= 1.4 && seconds <= 4.5 ? 8 : seconds > 4.5 ? 4 : -3;

  const completeness = clamp(56 + durationBonus + (seed % 8) + typeBonus, 45, 98);
  const accuracy = clamp(54 + durationBonus + (seed % 11) + retryBonus + typeBonus, 42, 99);
  const fluency = clamp(52 + Math.round(seconds * 6) + (seed % 7) + flowBonus, 40, 97);
  const total = Math.round(completeness * 0.3 + accuracy * 0.45 + fluency * 0.25);
  const passed = total >= 78;

  let issueCount = 3;
  if (total >= 90) {
    issueCount = 1;
  } else if (total >= 78) {
    issueCount = 2;
  }
  issueCount = Math.min(issueCount, item.segments.length);

  return {
    durationMs,
    total,
    completeness,
    accuracy,
    fluency,
    passed,
    issueIndices: item.segments.map((_, index) => index).slice(0, issueCount)
  };
}

module.exports = {
  scoreRecording
};
