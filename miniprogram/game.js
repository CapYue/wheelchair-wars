/**
 * 微信小程序入口
 * 轮椅大作战
 */

// 游戏主类
import Game from './Game';

export class MyGame {
    private static instance: MyGame = null;
    
    // 微信小游戏环境
    private wx: any = null;
    
    // 游戏实例
    private game: Game = null;
    
    // 启动
    public static start() {
        // 检查微信环境
        if (typeof wx !== 'undefined') {
            MyGame.instance = new MyGame();
            MyGame.instance.initWechat();
        } else {
            // Web环境
            MyGame.startWeb();
        }
    }
    
    // 初始化微信环境
    private initWechat() {
        this.wx = wx;
        
        // 设置启动画面
        this.showLoading();
        
        // 初始化用户信息
        this.initUserInfo();
        
        // 初始化云开发
        this.initCloud();
        
        // 加载游戏
        this.loadGame();
    }
    
    // 显示启动画面
    private showLoading() {
        // 创建启动画面
        const launchInfo = this.wx.getLaunchOptionsSync();
        
        // 更新场景到启动画面
        this.wx.updateShareMenu({
            withShareTicket: true
        });
        
        // 设置转发菜单
        this.wx.showShareMenu({
            withShareTicket: true
        });
        
        // 监听分享
        this.wx.onShareAppMessage(() => {
            return {
                title: '轮椅大作战 - 年轻人的轮椅Battle!',
                imageUrl: 'https://example.com/share.jpg',
                query: 'from=share'
            };
        });
    }
    
    // 初始化用户信息
    private initUserInfo() {
        // 获取用户信息
        this.wx.getUserInfo({
            success: (res: any) => {
                cc.sys.localStorage.setItem('user_info', JSON.stringify(res.userInfo));
            }
        });
        
        // 登录
        this.wx.login({
            success: (res: any) => {
                if (res.code) {
                    // 发送到服务器登录
                    this.loginWithCode(res.code);
                }
            }
        });
        
        // 监听登录状态变化
        this.wx.onShow(() => {
            // 重新检查登录
            this.wx.login({
                success: (res: any) => {
                    this.loginWithCode(res.code);
                }
            });
        });
    }
    
    // 使用code登录
    private loginWithCode(code: string) {
        // 调用云函数登录
        wx.cloud.callFunction({
            name: 'login',
            data: { code },
            success: (res: any) => {
                cc.sys.localStorage.setItem('openid', res.result.openid);
            }
        });
    }
    
    // 初始化云开发
    private initCloud() {
        wx.cloud.init({
            env: 'wheelchair-wars-xxxxx', // 云环境ID
            traceUser: true
        });
    }
    
    // 加载游戏
    private loadGame() {
        // 显示loading
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        
        // 加载游戏资源
        this.preloadAssets(() => {
            wx.hideLoading();
            this.startGame();
        });
    }
    
    // 预加载资源
    private preloadAssets(callback: Function) {
        // 资源列表
        const assets = [
            'images/characters/li_01.png',
            'images/characters/wang_01.png',
            'images/characters/zhang_01.png',
            'images/weapons/egg.png',
            'audio/bgm/battle.mp3'
        ];
        
        let loaded = 0;
        const total = assets.length;
        
        assets.forEach(path => {
            cc.loader.load(`res/${path}`, (err) => {
                loaded++;
                if (loaded >= total && callback) {
                    callback();
                }
            });
        });
    }
    
    // 启动游戏
    private startGame() {
        // 创建Canvas
        const canvas = wx.createCanvas();
        const context = canvas.getContext('2d');
        
        // 设置分辨率
        const systemInfo = wx.getSystemInfoSync();
        canvas.width = systemInfo.screenWidth;
        canvas.height = systemInfo.screenHeight;
        
        // 初始化游戏
        this.game = new Game(canvas, context);
        this.game.start();
        
        // 隐藏启动画面
        wx.hideLoading();
    }
    
    // Web环境启动
    private static startWeb() {
        // 创建Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 750;
        canvas.height = 1334;
        document.body.appendChild(canvas);
        
        const context = canvas.getContext('2d');
        
        // 初始化游戏
        const game = new Game(canvas, context);
        game.start();
    }
}

// 启动游戏
MyGame.start();