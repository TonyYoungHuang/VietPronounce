let privacyResolve = null;

function toast(title) {
  wx.showToast({ title, icon: 'none' });
}

function setPrivacyDialog(page, visible, privacyName) {
  if (!page || typeof page.setData !== 'function') return;

  page.setData({
    privacyVisible: visible,
    privacyName: privacyName || page.data.privacyName || '用户隐私保护指引'
  });
}

function requestPrivacyAuthorization(page) {
  return new Promise((resolve) => {
    if (typeof wx.getPrivacySetting !== 'function') {
      resolve(true);
      return;
    }

    wx.getPrivacySetting({
      success: (res) => {
        if (!res.needAuthorization) {
          resolve(true);
          return;
        }

        privacyResolve = resolve;
        setPrivacyDialog(page, true, res.privacyContractName);
      },
      fail: () => resolve(true)
    });
  });
}

function agreePrivacyAuthorization(page) {
  setPrivacyDialog(page, false);
  if (privacyResolve) {
    privacyResolve(true);
    privacyResolve = null;
  }
}

function rejectPrivacyAuthorization(page) {
  setPrivacyDialog(page, false);
  if (privacyResolve) {
    privacyResolve(false);
    privacyResolve = null;
  }
}

function openPrivacyContract() {
  if (typeof wx.openPrivacyContract !== 'function') return;

  wx.openPrivacyContract({
    fail: () => toast('暂时无法打开隐私保护指引')
  });
}

function openRecordSetting(resolve) {
  wx.openSetting({
    success: (settingRes) => {
      const authSetting = settingRes.authSetting || {};
      const allowed = !!authSetting['scope.record'];

      if (allowed) {
        toast('已开启麦克风，请重新长按录音');
        resolve(false);
        return;
      }

      toast('麦克风权限未开启');
      resolve(false);
    },
    fail: () => {
      toast('无法打开设置，请稍后重试');
      resolve(false);
    }
  });
}

function showRecordSettingGuide(resolve) {
  wx.showModal({
    title: '需要麦克风权限',
    content: '请在设置里打开麦克风权限，然后回到页面重新长按录音。',
    confirmText: '去授权',
    cancelText: '先不录',
    success: (modalRes) => {
      if (modalRes.confirm) {
        openRecordSetting(resolve);
        return;
      }

      resolve(false);
    },
    fail: () => resolve(false)
  });
}

function authorizeRecord(resolve) {
  wx.authorize({
    scope: 'scope.record',
    success: () => resolve(true),
    fail: () => showRecordSettingGuide(resolve)
  });
}

async function requestRecordPermission(page) {
  const privacyAllowed = await requestPrivacyAuthorization(page);
  if (!privacyAllowed) {
    toast('需要同意隐私授权后才能录音');
    return false;
  }

  return new Promise((resolve) => {
    wx.getSetting({
      success: (settingRes) => {
        const authSetting = settingRes.authSetting || {};

        if (authSetting['scope.record']) {
          resolve(true);
          return;
        }

        if (authSetting['scope.record'] === false) {
          showRecordSettingGuide(resolve);
          return;
        }

        authorizeRecord(resolve);
      },
      fail: () => authorizeRecord(resolve)
    });
  });
}

module.exports = {
  agreePrivacyAuthorization,
  openPrivacyContract,
  rejectPrivacyAuthorization,
  requestRecordPermission
};
