function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

const DIMENSION_DEFS = [
  { key: 'tone', label: '声调走势' },
  { key: 'vowel', label: '元音口型' },
  { key: 'final', label: '尾音收口' },
  { key: 'dialect', label: '北越 / 南越差异' },
  { key: 'rhythm', label: '音节节奏' }
];

const TONE_RE = /[àáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
const FINAL_RE = /[mnptck]$/i;

function getSegments(item) {
  if (Array.isArray(item && item.segments) && item.segments.length) return item.segments;
  return String((item && item.text) || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, tip: '' }));
}

function pickSegment(item, issueIndices, matcher) {
  const segments = getSegments(item);
  const ordered = [
    ...issueIndices.map((index) => segments[index]).filter(Boolean),
    ...segments
  ];
  return ordered.find((segment) => matcher(String(segment.text || ''))) || ordered[0] || { text: '' };
}

function scoreStatus(value) {
  if (value >= 88) return '稳';
  if (value >= 78) return '接近';
  return '重点';
}

function buildVietnameseDimensions(input = {}) {
  const item = input.item || {};
  const dialect = input.dialect === 'south' ? 'south' : 'north';
  const issueIndices = Array.isArray(input.issueIndices) ? input.issueIndices : [];
  const accuracy = clamp(input.accuracy, 0, 100);
  const completeness = clamp(input.completeness, 0, 100);
  const fluency = clamp(input.fluency, 0, 100);
  const issuePenalty = Math.min(10, issueIndices.length * 3);
  const toneSegment = pickSegment(item, issueIndices, (text) => TONE_RE.test(text));
  const finalSegment = pickSegment(item, issueIndices, (text) => FINAL_RE.test(text));
  const vowelSegment = pickSegment(item, issueIndices, (text) => /[aeiouyăâêôơư]/i.test(text));
  const rhythmText = String(item.text || '').trim();
  const dialectName = dialect === 'south' ? '南越' : '北越';

  const values = {
    tone: clamp(accuracy - issuePenalty),
    vowel: clamp(Math.round((accuracy + completeness) / 2) - Math.floor(issuePenalty / 2)),
    final: clamp(completeness - (FINAL_RE.test(String(finalSegment.text || '')) ? issuePenalty : 2)),
    dialect: clamp(accuracy - 2),
    rhythm: clamp(fluency)
  };

  return [
    {
      key: 'tone',
      label: '声调走势',
      score: values.tone,
      status: scoreStatus(values.tone),
      focus: toneSegment.text || rhythmText,
      tip: toneSegment.text
        ? `${toneSegment.text} 的调值走势要更清楚，起点和落点不要抹平。`
        : '保持越南语声调的起伏，不要用普通话平读带过去。'
    },
    {
      key: 'vowel',
      label: '元音口型',
      score: values.vowel,
      status: scoreStatus(values.vowel),
      focus: vowelSegment.text || rhythmText,
      tip: vowelSegment.text
        ? `${vowelSegment.text} 的元音口型再稳定一点，避免挤成中文近似音。`
        : '元音要保持越南语口型位置，不要过度用中文音替代。'
    },
    {
      key: 'final',
      label: '尾音收口',
      score: values.final,
      status: scoreStatus(values.final),
      focus: finalSegment.text || rhythmText,
      tip: finalSegment.text
        ? `${finalSegment.text} 的尾音要收住，t/p/k 类结尾只封口，不要读出明显送气。`
        : '句尾保持干净，不要拖成长音或吞掉鼻音。'
    },
    {
      key: 'dialect',
      label: '北越 / 南越差异',
      score: values.dialect,
      status: scoreStatus(values.dialect),
      focus: dialectName,
      tip: dialect === 'south'
        ? '南越语流可以更松弛，但声调边界仍要保留。'
        : '北越读法里声调边界更清楚，收尾和调值要更稳定。'
    },
    {
      key: 'rhythm',
      label: '音节节奏',
      score: values.rhythm,
      status: scoreStatus(values.rhythm),
      focus: rhythmText,
      tip: item.type === 'sentence'
        ? '短句里每个音节要连贯推进，停顿不要切碎意思。'
        : '保持音节长度稳定，先慢后稳，再逐步提速。'
    }
  ];
}

function normalizePronunciationDimensions(value, fallbackInput = {}) {
  const fallback = buildVietnameseDimensions(fallbackInput);
  if (!Array.isArray(value) || !value.length) return fallback;
  const fallbackByKey = fallback.reduce((map, item) => ({ ...map, [item.key]: item }), {});
  return DIMENSION_DEFS.map((definition) => {
    const source = value.find((item) => item && item.key === definition.key) || {};
    const fallbackItem = fallbackByKey[definition.key] || definition;
    const score = source.score === undefined ? fallbackItem.score : clamp(source.score);
    return {
      key: definition.key,
      label: source.label || fallbackItem.label || definition.label,
      score,
      status: source.status || scoreStatus(score),
      focus: source.focus || fallbackItem.focus || '',
      tip: source.tip || fallbackItem.tip || ''
    };
  });
}

module.exports = {
  buildVietnameseDimensions,
  normalizePronunciationDimensions
};
