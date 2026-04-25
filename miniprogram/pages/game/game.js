/**
 * 轮椅大作战 - 游戏页面
 */

const app = getApp();

Page({
  data: {
    // 游戏状态
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    showResult: false,
    
    // 游戏数据
    mode: 'solo',
    loadingText: '加载中...',
    
    // 玩家信息
    playerName: '玩家',
    playerHealth: 100,
    
    // 敌方信息
    enemyName: '对手',
    enemyHealth: 100,
    
    // 倒计时
    timeLeft: '3:00',
    gameTime: 180,
    
    // 摇杆
    joystickOffsetX: 0,
    joystickOffsetY: 0,
    
    // 技能
    skillCharge: 0,
    skillReady: false,
    
    // 战斗统计
    damage: 0,
    kill: 0,
    death: 0,
    duration: '0:00',
    
    // 奖励
    rewardGold: 0,
    rewardExp: 0,
    
    // 结果
    isWinner: false,
    
    // 游戏实例
    gameInstance: null
  },

  onLoad: function (options) {
    this.setData({ mode: options.mode || 'solo' });
    
    // 初始化游戏
    this.initGame();
  },

  onUnload: function () {
    // 清理游戏
    if (this.gameInstance) {
      this.gameInstance.destroy();
    }
  },

  // 初始化游戏
  initGame: function () {
    this.setData({ loadingText: '正在初始化...' });
    
    // 模拟加载
    setTimeout(() => {
      this.setData({ 
        isLoading: false,
        isPlaying: true
      });
      
      // 启动游戏逻辑
      this.startGameLoop();
    }, 1500);
  },

  // 开始游戏循环
  startGameLoop: function () {
    // 倒计时
    this.startCountdown();
    
    // 开始游戏计时
    this.gameTimer = setInterval(() => {
      if (this.data.isPlaying && !this.data.isPaused) {
        this.updateGameTime();
      }
    }, 1000);
  },

  // 倒计时
  startCountdown: function () {
    let count = 3;
    
    const tick = () => {
      if (count > 0) {
        this.setData({ timeLeft: count.toString() });
        count--;
        setTimeout(tick, 1000);
      } else {
        this.setData({ timeLeft: '3:00' });
      }
    };
    
    tick();
  },

  // 更新游戏时间
  updateGameTime: function () {
    const time = this.data.gameTime - 1;
    
    if (time <= 0) {
      this.endGame(false);
      return;
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    
    this.setData({
      gameTime: time,
      timeLeft: `${minutes}:${seconds.toString().padStart(2, '0')}`
    });
  },

  // 摇杆控制
  onJoystickStart: function (e) {
    this.joystickStartPos = e.touches[0];
  },

  onJoystickMove: function (e) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.joystickStartPos.clientX;
    const deltaY = touch.clientY - this.joystickStartPos.clientY;
    
    // 限制最大偏移
    const maxOffset = 50;
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
    
    this.setData({
      joystickOffsetX: clampedX,
      joystickOffsetY: clampedY
    });
    
    // 发送移动指令到游戏
    if (this.gameInstance) {
      this.gameInstance.setPlayerDirection(clampedX > 0 ? 1 : -1);
    }
  },

  onJoystickEnd: function (e) {
    this.setData({
      joystickOffsetX: 0,
      joystickOffsetY: 0
    });
    
    // 停止移动
    if (this.gameInstance) {
      this.gameInstance.setPlayerDirection(0);
    }
  },

  // 攻击
  onAttack: function () {
    if (!this.data.isPlaying || this.data.isPaused) return;
    
    if (this.gameInstance) {
      this.gameInstance.playerAttack();
    }
    
    // 播放音效
    wx.vibrateShort({ type: 'light' });
  },

  // 使用技能
  onSkill: function () {
    if (!this.data.isPlaying || this.data.isPaused || !this.data.skillReady) return;
    
    if (this.gameInstance) {
      this.gameInstance.playerUseSkill();
    }
    
    // 消耗技能
    this.setData({ skillCharge: 0, skillReady: false });
    wx.vibrateShort({ type: 'heavy' });
  },

  // 暂停
  onPause: function () {
    this.setData({ isPaused: true });
  },

  // 继续
  onResume: function () {
    this.setData({ isPaused: false });
  },

  // 重新开始
  onRestart: function () {
    wx.redirectTo({
      url: '/pages/game/game?mode=' + this.data.mode
    });
  },

  // 退出游戏
  onExit: function () {
    wx.navigateBack();
  },

  // 游戏结束
  endGame: function (isWinner) {
    clearInterval(this.gameTimer);
    
    this.setData({
      isPlaying: false,
      showResult: true,
      isWinner: isWinner,
      damage: Math.floor(Math.random() * 500) + 100,
      kill: Math.floor(Math.random() * 5),
      death: Math.floor(Math.random() * 3),
      duration: '2:45',
      rewardGold: isWinner ? 80 : 40,
      rewardExp: isWinner ? 50 : 25
    });
    
    // 更新数据
    const gameData = app.globalData.gameData || {};
    gameData.gold = (gameData.gold || 0) + this.data.rewardGold;
    gameData.diamond = (gameData.diamond || 0) + Math.floor(this.data.rewardExp / 5);
    app.globalData.gameData = gameData;
    
    // 保存战绩
    this.saveGameRecord(isWinner);
  },

  // 保存战绩
  saveGameRecord: function (isWinner) {
    const records = wx.getStorageSync('gameRecords') || [];
    
    records.unshift({
      result: isWinner ? 'win' : 'lose',
      damage: this.data.damage,
      kill: this.data.kill,
      death: this.data.death,
      time: Date.now()
    });
    
    // 保留最近20条
    if (records.length > 20) {
      records.pop();
    }
    
    wx.setStorageSync('gameRecords', records);
  },

  // 分享
  onShare: function () {
    wx.shareAppMessage({
      title: '轮椅大作战',
      content: `本局造成了${this.data.damage}点伤害，来一战！`,
      imageUrl: '/images/share.jpg'
    });
  },

  // 返回主页
  onReturnHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 再来一局
  onPlayAgain: function () {
    wx.redirectTo({
      url: '/pages/game/game?mode=' + this.data.mode
    });
  },

  onShareAppMessage: function () {
    return {
      title: '轮椅大作战 - 年轻人的轮椅Battle!',
      imageUrl: '/images/share.jpg',
      path: '/pages/game/game'
    };
  }
});