Component({
  properties: {
    gameWidth: {
      type: Number,
      value: 750
    },
    gameHeight: {
      type: Number,
      value: 1334
    }
  },

  data: {
    canvasWidth: 750,
    canvasHeight: 1334
  },

  lifetimes: {
    attached() {
      this.initCanvas();
    },
    detached() {
      this.cleanup();
    }
  },

  methods: {
    initCanvas() {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        canvasWidth: systemInfo.screenWidth,
        canvasHeight: systemInfo.screenHeight
      });
    },

    cleanup() {
      // 清理游戏资源
    },

    // 供外部调用的方法
    startGame(mode) {
      this.triggerEvent('ongamestart', { mode });
    },

    pauseGame() {
      this.triggerEvent('ongamepause');
    },

    resumeGame() {
      this.triggerEvent('ongameresume');
    }
  }
});