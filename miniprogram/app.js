/**
 * 轮椅大作战 - 微信小程序入口
 */

// 应用入口
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'wheelchair-wars-xxxxx', // 替换为实际云环境ID
        traceUser: true,
      });
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 设置适配参数
    this.adaptScreen(systemInfo);
    
    // 登录
    this.login();
    
    // 加载本地数据
    this.loadLocalData();
    
    // 检查更新
    this.checkUpdate();
  },
  
  onShow: function () {
    // 调用显示回调
  },
  
  onHide: function () {
    // 保存数据
    this.saveLocalData();
  },

  globalData: {
    userInfo: null,
    openid: null,
    systemInfo: null,
    isLogin: false,
    gameData: null,
    
    // 游戏配置
    config: {
      debug: false,
      enableVibration: true,
      enableSound: true,
      quality: 'high'
    }
  },
  
  // 登录
  login: function () {
    return new Promise((resolve, reject) => {
      // 微信登录
      wx.login({
        success: res => {
          if (res.code) {
            // 发送 code 到服务器获取 openid
            wx.cloud.callFunction({
              name: 'login',
              data: { code: res.code },
              success: res => {
                this.globalData.openid = res.result.openid;
                this.globalData.isLogin = true;
                resolve(res.result);
              },
              fail: err => {
                console.error('登录失败', err);
                reject(err);
              }
            });
          }
        },
        fail: err => {
          reject(err);
        }
      });
    });
  },
  
  // 获取用户信息
  getUserInfo: function () {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          this.globalData.userInfo = res.userInfo;
          resolve(res.userInfo);
        },
        fail: err => {
          console.error('获取用户信息失败', err);
          reject(err);
        }
      });
    });
  },
  
  // 加载本地数据
  loadLocalData: function () {
    try {
      const gameData = wx.getStorageSync('gameData');
      if (gameData) {
        this.globalData.gameData = JSON.parse(gameData);
      }
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  },
  
  // 保存本地数据
  saveLocalData: function () {
    try {
      if (this.globalData.gameData) {
        wx.setStorageSync('gameData', JSON.stringify(this.globalData.gameData));
      }
    } catch (e) {
      console.error('保存本地数据失败', e);
    }
  },
  
  // 屏幕适配
  adaptScreen: function (systemInfo) {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    const navBarHeight = menuButtonInfo.bottom + 10;
    
    this.globalData.statusBarHeight = statusBarHeight;
    this.globalData.navBarHeight = navBarHeight;
    this.globalData.screenWidth = systemInfo.screenWidth;
    this.globalData.screenHeight = systemInfo.screenHeight;
  },
  
  // 检查更新
  checkUpdate: function () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          console.log('有新版本');
        }
      });
      
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      updateManager.onUpdateFailed(function () {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false
        });
      });
    }
  },
  
  // 分享配置
  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 年轻人的轮椅Battle!',
      imageUrl: '/images/share.jpg',
      query: 'from=share'
    };
  }
});