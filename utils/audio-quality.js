const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

function getDurationBounds(itemType) {
  if (itemType === 'syllable') return { minMs: 550, maxMs: 5000 };
  if (itemType === 'word') return { minMs: 750, maxMs: 6500 };
  return { minMs: 1100, maxMs: 12000 };
}

function getFileInfo(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileInfo({
      filePath,
      success: resolve,
      fail: reject
    });
  });
}

function assessRecordingQuality(input = {}) {
  const durationMs = Number(input.durationMs || 0);
  const size = Number(input.size || 0);
  const itemType = input.itemType || 'sentence';
  const bounds = getDurationBounds(itemType);
  const seconds = Math.max(durationMs / 1000, 0.01);
  const bytesPerSecond = size / seconds;

  if (!input.filePath) {
    return { ok: false, code: 'missing-file', message: '请先完成一段录音。' };
  }
  if (durationMs < bounds.minMs) {
    return { ok: false, code: 'too-short', message: '录音太短了，请完整读完后再提交。' };
  }
  if (durationMs > bounds.maxMs) {
    return { ok: false, code: 'too-long', message: '录音太长了，请只朗读当前这一句。' };
  }
  if (!size || size < 900) {
    return { ok: false, code: 'empty-audio', message: '没有检测到有效录音，请靠近麦克风重录。' };
  }
  if (size > MAX_AUDIO_BYTES) {
    return { ok: false, code: 'too-large', message: '录音文件过大，可能包含过多噪音，请重录。' };
  }
  if (bytesPerSecond < 900) {
    return { ok: false, code: 'too-quiet', message: '录音音量太低或没有明显人声，请靠近麦克风重录。' };
  }
  if (bytesPerSecond > 180000) {
    return { ok: false, code: 'too-noisy', message: '录音噪声或爆音过多，请在安静环境下重录。' };
  }
  if (bytesPerSecond > 110000) {
    return { ok: false, code: 'possible-clipping', message: '录音可能有爆音，请离麦克风稍远一点重录。' };
  }

  return {
    ok: true,
    code: 'ok',
    durationMs,
    size,
    bytesPerSecond: Math.round(bytesPerSecond)
  };
}

async function validateRecordingQuality(recording, item) {
  const info = await getFileInfo(recording.filePath);
  return assessRecordingQuality({
    filePath: recording.filePath,
    durationMs: recording.durationMs,
    size: info.size,
    itemType: item && item.type
  });
}

module.exports = {
  assessRecordingQuality,
  validateRecordingQuality
};
