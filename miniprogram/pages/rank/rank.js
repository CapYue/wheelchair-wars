/**
 * 排行榜页面
 */

const app = getApp();

Page({
  data: {
    currentTab: 'all',
    
    myRank: 999,
    myName: '轮椅战士',
    myScore: 0,
    rankName: '青铜',
    
    rankList: []
  },

  onLoad: function () {
    this.loadMyRank();
    this.loadRankList();
  },

  onShow: function () {
    this.loadMyRank();
  },

  loadMyRank: function () {
    const gameData = app.globalData.gameData || {};
    const rankInfo = gameData.rank || { score: 0, level: 1 };
    
    // 计算段位名称
    const rankNames = ['青铜', '白银', '黄金', '钻石', '王者', '传说'];
    
    this.setData({
      myName: (app.globalData.userInfo?.nickName) || '轮椅战士',
      myScore: rankInfo.score,
      rankName: rankNames[rankInfo.level - 1] || '青铜'
    });
    
    // 从云端获取排名
    this.fetchMyRank();
  },

  fetchMyRank: function () {
    wx.cloud.callFunction({
      name: 'getMyRank',
      data: { openid: app.globalData.openid },
      success: (res) => {
        this.setData({ myRank: res.result?.rank || 999 });
      },
      fail: () => {
        this.setData({ myRank: 999 });
      }
    });
  },

  loadRankList: function () {
    // 模拟数据
    const mockRankList = [
      { rank: 1, name: '广场舞之神', avatar: '/images/avatar_1.png', score: 5800, rankLevel: '王者' },
      { rank: 2, name: '轮椅漂移王', avatar: '/images/avatar_2.png', score: 5200, rankLevel: '王者' },
      { rank: 3, name: '鸡蛋投手', avatar: '/images/avatar_3.png', score: 4800, rankLevel: '钻石' },
      { rank: 4, name: '拐杖大师', avatar: '/images/avatar_4.png', score: 4500, rankLevel: '钻石' },
      { rank: 5, name: '假牙追踪者', avatar: '/images/avatar_5.png', score: 4200, rankLevel: '钻石' },
      { rank: 6, name: '老年糕之王', avatar: '/images/avatar_6.png', score: 3800, rankLevel: '黄金' },
      { rank: 7, name: '购物车驾驶员', avatar: '/images/avatar_7.png', score: 3500, rankLevel: '黄金' },
      { rank: 8, name: '听诊器医生', avatar: '/images/avatar_8.png', score: 3200, rankLevel: '黄金' },
      { rank: 9, name: '药罐子收藏家', avatar: '/images/avatar_9.png', score: 2900, rankLevel: '白银' },
      { rank: 10, name: '铁蛋蛋爱好者', avatar: '/images/avatar_10.png', score: 2600, rankLevel: '白银' }
    ];
    
    this.setData({ rankList: mockRankList });
    
    // 从云端获取真实排行
    this.fetchRankList();
  },

  fetchRankList: function () {
    wx.cloud.callFunction({
      name: 'getRankList',
      data: { type: this.data.currentTab },
      success: (res) => {
        if (res.result && res.result.list) {
          this.setData({ rankList: res.result.list });
        }
      },
      fail: () => {
        // 使用模拟数据
      }
    });
  },

  onSwitchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.fetchRankList();
  },

  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 查看排行榜',
      imageUrl: '/images/share.jpg'
    };
  }
});