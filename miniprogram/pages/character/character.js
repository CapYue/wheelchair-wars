/**
 * 角色选择页面
 */

const app = getApp();

Page({
  data: {
    characters: [
      {
        id: 1,
        name: '李大爷',
        title: '广场舞之王',
        avatar: '/images/characters/li_daye.png',
        skillName: '广场舞音波',
        skillDesc: '全屏伤害，对所有敌人造成30点伤害',
        tags: ['移速+10%'],
        speed: 0.6,
        damage: 0.5,
        health: 0.5,
        selected: true,
        locked: false
      },
      {
        id: 2,
        name: '王大妈',
        title: '买菜砍价王',
        avatar: '/images/characters/wang_dama.png',
        skillName: '金钟罩',
        skillDesc: '无敌3秒，免疫所有伤害',
        tags: ['伤害+15%'],
        speed: 0.5,
        damage: 0.65,
        health: 0.5,
        selected: false,
        locked: false
      },
      {
        id: 3,
        name: '张爷爷',
        title: '养生专家',
        avatar: '/images/characters/zhang_ye.png',
        skillName: '轮椅冲刺',
        skillDesc: '快速位移，对路径上的敌人造成25点伤害',
        tags: ['技能CD-20%'],
        speed: 0.5,
        damage: 0.5,
        health: 0.6,
        selected: false,
        locked: false
      },
      {
        id: 4,
        name: '赵奶奶',
        title: '暴走团长',
        avatar: '/images/characters/zhao_nainai.png',
        skillName: '集体讹人',
        skillDesc: '强制所有敌人后退一段距离',
        tags: ['护盾+20%'],
        speed: 0.5,
        damage: 0.5,
        health: 0.6,
        selected: false,
        locked: false
      },
      {
        id: 5,
        name: '老刘头',
        title: '象棋大师',
        avatar: '/images/characters/lao_liu.png',
        skillName: '凤凰传奇',
        skillDesc: '回复30%最大生命值',
        tags: ['暴击+25%'],
        speed: 0.5,
        damage: 0.5,
        health: 0.6,
        selected: false,
        locked: false
      },
      {
        id: 6,
        name: '孙老太太',
        title: '织毛衣高手',
        avatar: '/images/characters/sun_laotai.png',
        skillName: '呼叫急救',
        skillDesc: '回复50%最大生命值',
        tags: ['攻速+20%'],
        speed: 0.55,
        damage: 0.5,
        health: 0.55,
        selected: false,
        locked: false
      }
    ],
    selectedCharacter: null
  },

  onLoad: function () {
    // 获取已选角色
    this.loadSelectedCharacter();
  },

  loadSelectedCharacter: function () {
    const gameData = app.globalData.gameData || {};
    const selectedId = gameData.selectedCharacter || 1;
    
    const characters = this.data.characters.map(c => ({
      ...c,
      selected: c.id === selectedId
    }));
    
    this.setData({ characters });
    this.updateSelectedCharacter(selectedId);
  },

  onSelectCharacter: function (e) {
    const id = e.currentTarget.dataset.id;
    const character = this.data.characters.find(c => c.id === id);
    
    if (character.locked) {
      wx.showModal({
        title: '角色未解锁',
        content: '是否花费金币解锁该角色？',
        confirmText: '解锁',
        success: (res) => {
          if (res.confirm) {
            this.unlockCharacter(id);
          }
        }
      });
      return;
    }
    
    // 更新选择状态
    const characters = this.data.characters.map(c => ({
      ...c,
      selected: c.id === id
    }));
    
    this.setData({ characters });
    this.updateSelectedCharacter(id);
    
    // 保存选择
    this.saveSelectedCharacter(id);
  },

  updateSelectedCharacter: function (id) {
    const character = this.data.characters.find(c => c.id === id);
    this.setData({ selectedCharacter: character });
  },

  saveSelectedCharacter: function (id) {
    const gameData = app.globalData.gameData || {};
    gameData.selectedCharacter = id;
    app.globalData.gameData = gameData;
  },

  unlockCharacter: function (id) {
    const cost = 500; // 解锁费用
    const gameData = app.globalData.gameData || {};
    
    if ((gameData.gold || 0) >= cost) {
      gameData.gold -= cost;
      
      // 标记角色已解锁
      if (!gameData.unlockedCharacters) {
        gameData.unlockedCharacters = [];
      }
      gameData.unlockedCharacters.push(id);
      
      app.globalData.gameData = gameData;
      
      // 更新数据
      const characters = this.data.characters.map(c => {
        if (c.id === id) {
          return { ...c, locked: false };
        }
        return c;
      });
      
      this.setData({ characters });
      wx.showToast({ title: '解锁成功！' });
    } else {
      wx.showToast({ title: '金币不足', icon: 'none' });
    }
  },

  onConfirm: function () {
    const selected = this.data.characters.find(c => c.selected);
    if (selected) {
      wx.showToast({ title: `已选择${selected.name}` });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    }
  },

  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 选择你的角色',
      imageUrl: '/images/share.jpg'
    };
  }
});