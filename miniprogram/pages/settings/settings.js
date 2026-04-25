/**
 * 设置页面
 */

const app = getApp();

Page({
  data: {
    // 音量
    sfxVolume: 100,
    bgmVolume: 50,
    
    // 开关
    vibration: true,
    showFPS: false,
    
    // 画质
    qualityOptions: ['低', '中', '高'],
    quality: '高',
    qualityIndex: 2,
    
    // 控制方式
    controlOptions: ['虚拟摇杆', '按键操作'],
    controlType: '虚拟摇杆',
    controlIndex: 0,
    
    // 用户信息
    userInfo: null,
    openid: null
  },

  onLoad: function () {
    this.loadSettings();
    this.loadUserInfo();
  },

  loadSettings: function () {
    const settings = app.globalData.config || {};
    
    this.setData({
      sfxVolume: (settings.sfxVolume || 1) * 100,
      bgmVolume: (settings.bgmVolume || 0.5) * 100,
      vibration: settings.enableVibration !== false,
      showFPS: settings.showFPS || false,
      quality: settings.quality || '高',
      qualityIndex: ['低', '中', '高'].indexOf(settings.quality || '高')
    });
  },

  loadUserInfo: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      openid: app.globalData.openid
    });
  },

  saveSettings: function (key, value) {
    const settings = app.globalData.config || {};
    settings[key] = value;
    app.globalData.config = settings;
    
    // 同步到本地存储
    try {
      wx.setStorageSync('settings', JSON.stringify(settings));
    } catch (e) {
      console.error('保存设置失败', e);
    }
  },

  onSFXVolumeChange: function (e) {
    const value = e.detail.value;
    this.setData({ sfxVolume: value });
    this.saveSettings('sfxVolume', value / 100);
  },

  onBGMVolumeChange: function (e) {
    const value = e.detail.value;
    this.setData({ bgmVolume: value });
    this.saveSettings('bgmVolume', value / 100);
  },

  onVibrationChange: function (e) {
    const value = e.detail.value;
    this.setData({ vibration: value });
    this.saveSettings('enableVibration', value);
  },

  onShowFPSChange: function (e) {
    const value = e.detail.value;
    this.setData({ showFPS: value });
    this.saveSettings('showFPS', value);
  },

  onQualityChange: function (e) {
    const index = e.detail.value;
    const options = ['低', '中', '高'];
    this.setData({
      quality: options[index],
      qualityIndex: index
    });
    this.saveSettings('quality', options[index]);
  },

  onControlChange: function (e) {
    const index = e.detail.value;
    const options = ['虚拟摇杆', '按键操作'];
    this.setData({
      controlType: options[index],
      controlIndex: index
    });
    this.saveSettings('controlType', options[index]);
  },

  onCheckUpdate: function () {
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        wx.showToast({ title: '发现新版本', icon: 'none' });
      } else {
        wx.showToast({ title: '已是最新版本', icon: 'success' });
      }
    });
    
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  },

  onPrivacy: function () {
    wx.showModal({
      title: '隐私政策',
      content: '轮椅大作战尊重并保护用户隐私，详情请查看完整隐私政策。',
      showCancel: false
    });
  },

  onTerms: function () {
    wx.showModal({
      title: '用户协议',
      content: '使用轮椅大作战即表示您同意我们的用户协议条款。',
      showCancel: false
    });
  },

  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 设置',
      imageUrl: '/images/share.jpg'
    };
  }
});