/**
 * 商城页面
 */

const app = getApp();

Page({
  data: {
    gold: 0,
    diamond: 0,
    currentTab: 'character',
    
    // 角色商品
    characterItems: [
      { id: 2, name: '王大妈', desc: '买菜砍价王 - 伤害+15%', price: 500, image: '/images/characters/wang_dama.png' },
      { id: 3, name: '张爷爷', desc: '养生专家 - 技能CD-20%', price: 500, image: '/images/characters/zhang_ye.png' },
      { id: 4, name: '赵奶奶', desc: '暴走团长 - 护盾+20%', price: 600, image: '/images/characters/zhao_nainai.png' },
      { id: 5, name: '老刘头', desc: '象棋大师 - 暴击+25%', price: 600, image: '/images/characters/lao_liu.png' },
      { id: 6, name: '孙老太太', desc: '织毛衣高手 - 攻速+20%', price: 600, image: '/images/characters/sun_laotai.png' }
    ],
    
    // 武器商品
    weaponItems: [
      { id: 2, name: '铁蛋蛋', desc: '穿透护盾，造成15点伤害', price: 200, icon: '🥚' },
      { id: 3, name: '拐杖投掷', desc: '击退敌人，造成20点伤害', price: 300, icon: '🦯' },
      { id: 4, name: '药罐子', desc: '减速debuff，造成10点伤害', price: 250, icon: '💊' },
      { id: 5, name: '假牙飞弹', desc: '追踪效果，造成25点伤害', price: 400, icon: '🦷' },
      { id: 6, name: '老年糕', desc: '范围眩晕，造成8点伤害', price: 300, icon: '🍪' },
      { id: 7, name: '听诊器', desc: '禁锢1秒，造成15点伤害', price: 350, icon: '🩺' },
      { id: 8, name: '购物车', desc: '全屏AOE，造成40点伤害', price: 800, icon: '🛒' }
    ],
    
    // 皮肤商品
    skinItems: [
      { id: 'skin_1_1', name: '拉丁舞服', desc: '李大爷专属皮肤', price: 300, image: '/images/skins/li_dance.png' },
      { id: 'skin_1_2', name: '太极服', desc: '李大爷专属皮肤', price: 300, image: '/images/skins/li_taichi.png' },
      { id: 'skin_2_1', name: '花衬衫', desc: '王大妈专属皮肤', price: 300, image: '/images/skins/wang_flower.png' },
      { id: 'skin_2_2', name: '丝巾装', desc: '王大妈专属皮肤', price: 350, image: '/images/skins/wang_scarf.png' }
    ],
    
    // 道具商品
    propsItems: [
      { id: 'prop_gold_100', name: '100金币', desc: '游戏内货币', price: 6, icon: '💰' },
      { id: 'prop_gold_500', name: '500金币', desc: '游戏内货币', price: 25, icon: '💰' },
      { id: 'prop_gold_1000', name: '1000金币', desc: '游戏内货币', price: 45, icon: '💰' },
      { id: 'prop_diamond_60', name: '60钻石', desc: '高级货币', price: 6, icon: '💎' },
      { id: 'prop_diamond_300', name: '300钻石', desc: '高级货币', price: 25, icon: '💎' },
      { id: 'prop_card_10', name: '10连抽卡', desc: '必得史诗物品', price: 50, icon: '🎰' }
    ]
  },

  onLoad: function () {
    this.loadCurrency();
  },

  onShow: function () {
    this.loadCurrency();
  },

  loadCurrency: function () {
    const gameData = app.globalData.gameData || {};
    this.setData({
      gold: gameData.gold || 0,
      diamond: gameData.diamond || 0
    });
  },

  onSwitchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  onBuy: function (e) {
    const { id, type } = e.currentTarget.dataset;
    const item = this.getItemById(id, type);
    
    if (!item) return;
    
    wx.showModal({
      title: '确认购买',
      content: `是否花费 ${item.price} 金币购买 ${item.name}？`,
      success: (res) => {
        if (res.confirm) {
          this.processPurchase(id, type, item.price);
        }
      }
    });
  },

  getItemById: function (id, type) {
    let items;
    switch (type) {
      case 'character': items = this.data.characterItems; break;
      case 'weapon': items = this.data.weaponItems; break;
      case 'skin': items = this.data.skinItems; break;
      case 'props': items = this.data.propsItems; break;
      default: return null;
    }
    return items.find(item => item.id === id);
  },

  processPurchase: function (id, type, price) {
    const gameData = app.globalData.gameData || {};
    
    if ((gameData.gold || 0) < price) {
      wx.showToast({ title: '金币不足', icon: 'none' });
      return;
    }
    
    gameData.gold -= price;
    
    // 添加道具
    switch (type) {
      case 'character':
        if (!gameData.unlockedCharacters) gameData.unlockedCharacters = [];
        gameData.unlockedCharacters.push(id);
        break;
      case 'weapon':
        if (!gameData.weapons) gameData.weapons = {};
        gameData.weapons[id] = { count: 10 };
        break;
      case 'skin':
        if (!gameData.skins) gameData.skins = [];
        gameData.skins.push(id);
        break;
      case 'props':
        // 道具直接使用
        if (id.includes('diamond')) {
          const amount = parseInt(id.split('_')[2]);
          gameData.diamond = (gameData.diamond || 0) + amount;
        } else if (id.includes('gold')) {
          const amount = parseInt(id.split('_')[2]);
          gameData.gold = (gameData.gold || 0) + amount;
        }
        break;
    }
    
    app.globalData.gameData = gameData;
    this.loadCurrency();
    
    wx.showToast({ title: '购买成功！' });
  },

  onBuyPackage: function () {
    wx.showModal({
      title: '购买礼包',
      content: '是否花费 30 钻石购买新手大礼包？',
      success: (res) => {
        if (res.confirm) {
          const gameData = app.globalData.gameData || {};
          
          if ((gameData.diamond || 0) < 30) {
            wx.showToast({ title: '钻石不足', icon: 'none' });
            return;
          }
          
          gameData.diamond -= 30;
          gameData.gold = (gameData.gold || 0) + 1000;
          gameData.unlockedCharacters = [1, 2, 3, 4, 5, 6];
          
          app.globalData.gameData = gameData;
          this.loadCurrency();
          
          wx.showToast({ title: '购买成功！' });
        }
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 商城',
      imageUrl: '/images/share.jpg'
    };
  }
});