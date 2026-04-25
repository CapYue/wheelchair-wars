/**
 * 轮椅大作战 - 首页
 */

const app = getApp();

Page({
  data: {
    userInfo: null,
    level: 1,
    gold: 0,
    diamond: 0,
    recentRecords: []
  },

  onLoad: function () {
    // 加载用户数据
    this.loadUserData();
    
    // 加载战绩记录
    this.loadRecentRecords();
  },

  onShow: function () {
    // 每次显示刷新数据
    this.loadUserData();
    this.loadRecentRecords();
  },

  // 加载用户数据
  loadUserData: function () {
    const gameData = app.globalData.gameData || {};
    
    this.setData({
      userInfo: app.globalData.userInfo || { nickName: '轮椅战士' },
      level: gameData.level || 1,
      gold: gameData.gold || 0,
      diamond: gameData.diamond || 0
    });
  },

  // 加载战绩记录
  loadRecentRecords: function () {
    try {
      const records = wx.getStorageSync('gameRecords') || [];
      this.setData({
        recentRecords: records.slice(0, 5)
      });
    } catch (e) {
      console.error('加载战绩失败', e);
    }
  },

  // 单人闯关
  onSoloMode: function () {
    wx.navigateTo({
      url: '/pages/game/game?mode=solo'
    });
  },

  // 多人匹配
  onPvPMode: function () {
    wx.showLoading({ title: '匹配中...' });
    
    // 模拟匹配
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: '/pages/game/game?mode=pvp'
      });
    }, 2000);
  },

  // 好友对战
  onFriendMode: function () {
    wx.showModal({
      title: '好友对战',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  // 角色选择
  onCharacterSelect: function () {
    wx.switchTab({
      url: '/pages/character/character'
    });
  },

  // 排行榜
  onRankList: function () {
    wx.switchTab({
      url: '/pages/rank/rank'
    });
  },

  // 商城
  onShop: function () {
    wx.switchTab({
      url: '/pages/shop/shop'
    });
  },

  // 设置
  onSettings: function () {
    wx.switchTab({
      url: '/pages/settings/settings'
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 年轻人的轮椅Battle!',
      imageUrl: '/images/share.jpg',
      path: '/pages/index/index'
    };
  }
});