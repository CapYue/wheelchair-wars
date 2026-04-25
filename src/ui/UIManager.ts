/**
 * UI管理器
 * 轮椅大作战 - 管理所有UI界面
 */

import { GameState, GAME_EVENTS, WeaponType } from '../utils/Constants';

export class UIManager extends cc.Component {
    // UI层级
    private canvas: cc.Node = null;
    private uiRoot: cc.Node = null;
    private hudLayer: cc.Node = null;
    private popupLayer: cc.Node = null;
    private loadingLayer: cc.Node = null;

    // UI节点引用
    private mainMenu: cc.Node = null;
    private gameHUD: cc.Node = null;
    private pauseMenu: cc.Node = null;
    private resultPanel: cc.Node = null;
    private countdownLabel: cc.Label = null;
    private healthBar: cc.ProgressBar = null;
    private skillBar: cc.ProgressBar = null;
    private timerLabel: cc.Label = null;
    
    // 摇杆
    private joystick: cc.Node = null;
    private attackButton: cc.Node = null;

    onLoad() {
        this.initUIRoot();
    }

    /**
     * 初始化UI根节点
     */
    init() {
        // 创建UI层级
        this.createUILayers();
        
        // 加载UI资源
        this.loadUIResources();
        
        // 默认隐藏游戏HUD
        if (this.gameHUD) {
            this.gameHUD.active = false;
        }
        
        // 显示主菜单
        this.showMainMenu();
    }

    private initUIRoot() {
        this.canvas = cc.find('Canvas');
        if (!this.canvas) {
            cc.error('[UIManager] Canvas not found!');
            return;
        }
    }

    private createUILayers() {
        // 创建层级容器
        this.uiRoot = new cc.Node('UIRoot');
        this.uiRoot.parent = this.canvas;
        this.uiRoot.addComponent(cc.Canvas);
        
        // HUD层 - 游戏中的HUD
        this.hudLayer = new cc.Node('HUDLayer');
        this.hudLayer.parent = this.uiRoot;
        this.hudLayer.addComponent(cc.Canvas).sortOrder = 0;
        
        // 弹窗层
        this.popupLayer = new cc.Node('PopupLayer');
        this.popupLayer.parent = this.uiRoot;
        this.popupLayer.addComponent(cc.Canvas).sortOrder = 1;
        
        // 加载层
        this.loadingLayer = new cc.Node('LoadingLayer');
        this.loadingLayer.parent = this.uiRoot;
        this.loadingLayer.addComponent(cc.Canvas).sortOrder = 2;
    }

    private loadUIResources() {
        // 加载主菜单预制体
        this.createMainMenu();
        
        // 加载游戏HUD
        this.createGameHUD();
        
        // 加载暂停菜单
        this.createPauseMenu();
        
        // 加载结算面板
        this.createResultPanel();
    }

    // ==================== 主菜单 ====================

    private createMainMenu() {
        this.mainMenu = new cc.Node('MainMenu');
        this.mainMenu.parent = this.popupLayer;
        
        // 背景
        const bg = new cc.Node('Bg');
        bg.parent = this.mainMenu;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(750, 1334);
        bg.color = new cc.Color(50, 50, 80);
        
        // 标题
        const title = new cc.Node('Title');
        title.parent = this.mainMenu;
        title.addComponent(cc.Label);
        const titleLabel = title.getComponent(cc.Label);
        titleLabel.string = '🥚 轮椅大作战 🥚';
        titleLabel.fontSize = 60;
        titleLabel.font = null;
        title.setPosition(0, 300);
        
        // 副标题
        const subtitle = new cc.Node('Subtitle');
        subtitle.parent = this.mainMenu;
        subtitle.addComponent(cc.Label);
        const subLabel = subtitle.getComponent(cc.Label);
        subLabel.string = '年轻人的轮椅Battle';
        subLabel.fontSize = 28;
        subLabel.node.color = new cc.Color(180, 180, 180);
        subtitle.setPosition(0, 220);
        
        // 单人游戏按钮
        const soloBtn = this.createButton('单人闯关', 0, 50, () => this.onSoloMode());
        soloBtn.parent = this.mainMenu;
        
        // 多人对战按钮
        const pvpBtn = this.createButton('多人匹配', 0, -50, () => this.onPvPMode());
        pvpBtn.parent = this.mainMenu;
        
        // 好友对战按钮
        const friendBtn = this.createButton('好友对战', 0, -150, () => this.onFriendMode());
        friendBtn.parent = this.mainMenu;
        
        // 角色选择按钮
        const charBtn = this.createButton('选择角色', 0, -250, () => this.onCharacterSelect());
        charBtn.parent = this.mainMenu;
    }

    private createButton(text: string, x: number, y: number, callback: Function): cc.Node {
        const btn = new cc.Node('Button_' + text);
        btn.setPosition(x, y);
        
        // 背景
        const bg = new cc.Node('Bg');
        bg.parent = btn;
        const sprite = bg.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICE;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bg.setContentSize(300, 80);
        
        // 标签
        const label = new cc.Node('Label');
        label.parent = btn;
        label.addComponent(cc.Label);
        const lbl = label.getComponent(cc.Label);
        lbl.string = text;
        lbl.fontSize = 32;
        lbl.overflow = cc.Label.Overflow.CLAMP;
        lbl.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        lbl.verticalAlign = cc.Label.VerticalAlign.CENTER;
        
        // 添加按钮组件
        const button = btn.addComponent(cc.Button);
        button.transition = cc.Button.Transition.COLOR;
        
        // 点击事件
        btn.on('click', callback, this);
        
        // 添加颜色过渡
        const colors = {
            normal: new cc.Color(80, 120, 180),
            pressed: new cc.Color(60, 100, 160),
            hover: new cc.Color(100, 140, 200)
        };
        
        return btn;
    }

    /**
     * 显示主菜单
     */
    public showMainMenu() {
        if (this.mainMenu) {
            this.mainMenu.active = true;
        }
        
        if (this.gameHUD) {
            this.gameHUD.active = false;
        }
    }

    /**
     * 隐藏主菜单
     */
    public hideMainMenu() {
        if (this.mainMenu) {
            this.mainMenu.active = false;
        }
    }

    // ==================== 游戏HUD ====================

    private createGameHUD() {
        this.gameHUD = new cc.Node('GameHUD');
        this.gameHUD.parent = this.hudLayer;
        
        // 顶部信息栏
        const topBar = new cc.Node('TopBar');
        topBar.parent = this.gameHUD;
        topBar.setPosition(0, 620);
        
        // 敌方血条
        const enemyHealthBg = new cc.Node('EnemyHealthBg');
        enemyHealthBg.parent = topBar;
        enemyHealthBg.addComponent(cc.Sprite);
        enemyHealthBg.setPosition(-250, 0);
        enemyHealthBg.setContentSize(200, 20);
        enemyHealthBg.color = new cc.Color(80, 80, 80);
        
        const enemyHealthBar = new cc.Node('EnemyHealthBar');
        enemyHealthBar.parent = enemyHealthBg;
        this.enemyHealthBar = enemyHealthBar.addComponent(cc.ProgressBar);
        this.enemyHealthBar.totalLength = 196;
        enemyHealthBar.progress = 1;
        enemyHealthBar.barSprite = enemyHealthBar.node.addComponent(cc.Sprite);
        enemyHealthBar.barSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        enemyHealthBar.barSprite.node.setContentSize(196, 16);
        enemyHealthBar.barSprite.node.setPosition(98, 10);
        enemyHealthBar.barSprite.node.color = new cc.Color(255, 80, 80);
        enemyHealthBar.node.setContentSize(196, 16);
        enemyHealthBar.node.setPosition(98, 10);
        
        // 倒计时
        this.countdownLabel = new cc.Node('Countdown');
        this.countdownLabel.parent = topBar;
        this.countdownLabel.addComponent(cc.Label);
        this.countdownLabel.getComponent(cc.Label).fontSize = 48;
        this.countdownLabel.setPosition(0, 0);
        
        // 玩家血条
        const playerHealthBg = new cc.Node('PlayerHealthBg');
        playerHealthBg.parent = this.gameHUD;
        playerHealthBg.addComponent(cc.Sprite);
        playerHealthBg.setPosition(-250, -580);
        playerHealthBg.setContentSize(300, 30);
        playerHealthBg.color = new cc.Color(60, 60, 60);
        
        const playerHealthBar = new cc.Node('PlayerHealthBar');
        playerHealthBar.parent = playerHealthBg;
        this.healthBar = playerHealthBar.addComponent(cc.ProgressBar);
        this.healthBar.totalLength = 290;
        this.healthBar.progress = 1;
        this.healthBar.barSprite = playerHealthBar.node.addComponent(cc.Sprite);
        this.healthBar.barSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.healthBar.barSprite.node.setContentSize(290, 24);
        this.healthBar.barSprite.node.setPosition(145, 15);
        this.healthBar.barSprite.node.color = new cc.Color(80, 255, 80);
        this.healthBar.node.setContentSize(290, 24);
        this.healthBar.node.setPosition(145, 15);
        
        // 技能充能条
        const skillBg = new cc.Node('SkillBg');
        skillBg.parent = this.gameHUD;
        skillBg.addComponent(cc.Sprite);
        skillBg.setPosition(0, -520);
        skillBg.setContentSize(200, 25);
        skillBg.color = new cc.Color(60, 60, 60);
        
        const skillBar = new cc.Node('SkillBar');
        skillBar.parent = skillBg;
        this.skillBar = skillBar.addComponent(cc.ProgressBar);
        this.skillBar.totalLength = 190;
        this.skillBar.progress = 0;
        this.skillBar.barSprite = skillBar.node.addComponent(cc.Sprite);
        this.skillBar.barSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.skillBar.barSprite.node.setContentSize(190, 19);
        this.skillBar.barSprite.node.setPosition(95, 12);
        this.skillBar.barSprite.node.color = new cc.Color(255, 200, 0);
        this.skillBar.node.setContentSize(190, 19);
        this.skillBar.node.setPosition(95, 12);
        
        // 虚拟摇杆
        this.createJoystick();
        
        // 攻击按钮
        this.createAttackButton();
        
        // 技能按钮
        this.createSkillButton();
        
        // 暂停按钮
        this.createPauseButton();
    }

    private createJoystick() {
        this.joystick = new cc.Node('Joystick');
        this.joystick.parent = this.gameHUD;
        this.joystick.setPosition(-280, -400);
        
        // 摇杆背景
        const bg = new cc.Node('Bg');
        bg.parent = this.joystick;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(150, 150);
        bg.color = new cc.Color(100, 100, 100, 150);
        
        // 摇杆手柄
        const stick = new cc.Node('Stick');
        stick.parent = this.joystick;
        stick.addComponent(cc.Sprite);
        stick.setContentSize(60, 60);
        stick.setPosition(0, 0);
        stick.color = new cc.Color(200, 200, 200, 200);
        
        // 添加触摸组件
        const touch = this.joystick.addComponent(cc.Button);
        touch.transition = cc.Button.Transition.NONE;
        
        // 触摸事件
        this.joystick.on('touchstart', this.onJoystickStart, this);
        this.joystick.on('touchmove', this.onJoystickMove, this);
        this.joystick.on('touchend', this.onJoystickEnd, this);
        
        this.joystick.__joystickData = {
            touchId: -1,
            startPos: cc.v2(-280, -400),
            currentOffset: cc.v2(0, 0),
            maxOffset: 50
        };
    }

    private createAttackButton() {
        this.attackButton = new cc.Node('AttackButton');
        this.attackButton.parent = this.gameHUD;
        this.attackButton.setPosition(280, -400);
        
        // 按钮背景
        const bg = new cc.Node('Bg');
        bg.parent = this.attackButton;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(100, 100);
        bg.color = new cc.Color(255, 100, 100, 200);
        
        // 标签
        const label = new cc.Node('Label');
        label.parent = this.attackButton;
        label.addComponent(cc.Label);
        const lbl = label.getComponent(cc.Label);
        lbl.string = '投掷';
        lbl.fontSize = 28;
        lbl.node.color = new cc.Color(255, 255, 255);
        
        // 触摸事件
        this.attackButton.on('touchstart', this.onAttackStart, this);
        this.attackButton.on('touchend', this.onAttackEnd, this);
    }

    private createSkillButton() {
        const skillButton = new cc.Node('SkillButton');
        skillButton.parent = this.gameHUD;
        skillButton.setPosition(280, -280);
        
        // 按钮背景
        const bg = new cc.Node('Bg');
        bg.parent = skillButton;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(80, 80);
        bg.color = new cc.Color(255, 200, 0, 200);
        
        // 标签
        const label = new cc.Node('Label');
        label.parent = skillButton;
        label.addComponent(cc.Label);
        const lbl = label.getComponent(cc.Label);
        lbl.string = '大招';
        lbl.fontSize = 24;
        lbl.node.color = new cc.Color(255, 255, 255);
        
        // 触摸事件
        skillButton.on('touchstart', this.onSkillStart, this);
        
        skillButton.__skillButton = true;
    }

    private createPauseButton() {
        const pauseBtn = new cc.Node('PauseButton');
        pauseBtn.parent = this.gameHUD;
        pauseBtn.setPosition(320, 580);
        
        // 按钮背景
        const bg = new cc.Node('Bg');
        bg.parent = pauseBtn;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(60, 60);
        bg.color = new cc.Color(150, 150, 150, 180);
        
        // 暂停图标
        const icon = new cc.Node('Icon');
        icon.parent = pauseBtn;
        icon.addComponent(cc.Label);
        const iconLabel = icon.getComponent(cc.Label);
        iconLabel.string = '⏸️';
        iconLabel.fontSize = 32;
        
        // 点击事件
        pauseBtn.on('click', this.onPauseClick, this);
    }

    /**
     * 显示游戏HUD
     */
    public showGameHUD() {
        if (this.gameHUD) {
            this.gameHUD.active = true;
        }
        if (this.mainMenu) {
            this.mainMenu.active = false;
        }
    }

    // ==================== 摇杆控制 ====================

    private onJoystickStart(event: any) {
        if (!this.joystick.__joystickData) return;
        this.joystick.__joystickData.touchId = event.touch.getID();
        
        const touchPos = event.touch.getLocation();
        const worldPos = this.joystick.convertToWorldSpaceAR(cc.v2(0, 0));
        this.joystick.__joystickData.startPos = cc.v2(worldPos.x, worldPos.y);
    }

    private onJoystickMove(event: any) {
        if (!this.joystick.__joystickData) return;
        
        const touchPos = event.touch.getLocation();
        const offset = touchPos.sub(this.joystick.__joystickData.startPos);
        
        // 限制最大偏移
        const maxOffset = this.joystick.__joystickData.maxOffset;
        if (offset.mag() > maxOffset) {
            offset.normalize().mul(maxOffset);
        }
        
        this.joystick.__joystickData.currentOffset = offset;
        
        // 更新手柄位置
        const stick = this.joystick.getChildByName('Stick');
        if (stick) {
            stick.setPosition(offset.x, offset.y);
        }
        
        // 计算方向
        const dir = offset.x > 0 ? 1 : -1;
        
        // 通知Game控制器
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game && game.player) {
            game.player.setDirection(dir);
        }
    }

    private onJoystickEnd(event: any) {
        if (!this.joystick.__joystickData) return;
        this.joystick.__joystickData.currentOffset = cc.v2(0, 0);
        this.joystick.__joystickData.touchId = -1;
        
        // 重置手柄位置
        const stick = this.joystick.getChildByName('Stick');
        if (stick) {
            stick.setPosition(0, 0);
        }
        
        // 通知Game停止移动
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game && game.player) {
            game.player.setDirection(0);
        }
    }

    private onAttackStart(event: any) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game && game.player) {
            game.player.attack();
        }
    }

    private onAttackEnd(event: any) {
        // 攻击结束
    }

    private onSkillStart(event: any) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game && game.player && game.player.canUseSkill) {
            game.player.useSkill();
        }
    }

    private onPauseClick() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.pauseGame();
        }
    }

    // ==================== 暂停菜单 ====================

    private createPauseMenu() {
        this.pauseMenu = new cc.Node('PauseMenu');
        this.pauseMenu.parent = this.popupLayer;
        this.pauseMenu.active = false;
        
        // 半透明背景
        const overlay = new cc.Node('Overlay');
        overlay.parent = this.pauseMenu;
        overlay.addComponent(cc.Sprite);
        overlay.setContentSize(750, 1334);
        overlay.color = new cc.Color(0, 0, 0, 180);
        overlay.on('click', () => {}, this);
        
        // 标题
        const title = new cc.Node('Title');
        title.parent = this.pauseMenu;
        title.addComponent(cc.Label);
        title.getComponent(cc.Label).string = '游戏暂停';
        title.getComponent(cc.Label).fontSize = 48;
        title.setPosition(0, 200);
        
        // 继续按钮
        const resumeBtn = this.createButton('继续游戏', 0, 50, () => this.onResume());
        resumeBtn.parent = this.pauseMenu;
        
        // 重新开始按钮
        const restartBtn = this.createButton('重新开始', 0, -50, () => this.onRestart());
        restartBtn.parent = this.pauseMenu;
        
        // 退出按钮
        const exitBtn = this.createButton('退出游戏', 0, -150, () => this.onExit());
        exitBtn.parent = this.pauseMenu;
    }

    /**
     * 显示暂停菜单
     */
    public showPauseMenu() {
        if (this.pauseMenu) {
            this.pauseMenu.active = true;
        }
    }

    /**
     * 隐藏暂停菜单
     */
    public hidePauseMenu() {
        if (this.pauseMenu) {
            this.pauseMenu.active = false;
        }
    }

    private onResume() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.resumeGame();
        }
    }

    private onRestart() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.restartGame();
        }
    }

    private onExit() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.exitGame();
        }
    }

    // ==================== 结算面板 ====================

    private createResultPanel() {
        this.resultPanel = new cc.Node('ResultPanel');
        this.resultPanel.parent = this.popupLayer;
        this.resultPanel.active = false;
        
        // 半透明背景
        const overlay = new cc.Node('Overlay');
        overlay.parent = this.resultPanel;
        overlay.addComponent(cc.Sprite);
        overlay.setContentSize(750, 1334);
        overlay.color = new cc.Color(0, 0, 0, 200);
        
        // 结果容器
        const container = new cc.Node('Container');
        container.parent = this.resultPanel;
        container.setPosition(0, 0);
        
        // 结果标题
        const title = new cc.Node('Title');
        title.parent = container;
        title.addComponent(cc.Label);
        title.getComponent(cc.Label).fontSize = 56;
        title.setPosition(0, 300);
        
        // 统计信息
        this.createResultStat(container, '伤害', 0, 200);
        this.createResultStat(container, '击杀', 0, 130);
        this.createResultStat(container, '死亡', 0, 60);
        this.createResultStat(container, '时长', 0, -10);
        
        // 奖励信息
        this.createResultStat(container, '金币', 0, -100);
        this.createResultStat(container, '经验', 0, -170);
        
        // 按钮
        const shareBtn = this.createButton('分享', 0, -280, () => this.onShare());
        shareBtn.parent = container;
        
        const homeBtn = this.createButton('返回主页', 0, -370, () => this.onReturnHome());
        homeBtn.parent = container;
        
        const againBtn = this.createButton('再来一局', 0, -460, () => this.onPlayAgain());
        againBtn.parent = container;
    }

    private createResultStat(parent: cc.Node, label: string, x: number, y: number) {
        const stat = new cc.Node(label);
        stat.parent = parent;
        stat.setPosition(0, y);
        
        const lbl = stat.addComponent(cc.Label);
        lbl.string = `${label}: 0`;
        lbl.fontSize = 28;
        lbl.node.color = new cc.Color(200, 200, 200);
        
        stat.__statLabel = lbl;
    }

    /**
     * 显示结算结果
     */
    public showResult(result: any) {
        if (!this.resultPanel) return;
        
        this.resultPanel.active = true;
        
        const title = this.resultPanel.getChildByName('Container')?.getChildByName('Title')?.getComponent(cc.Label);
        if (title) {
            title.string = result.isWinner ? '🎉 胜利！' : '😢 失败';
            title.node.color = result.isWinner ? new cc.Color(255, 200, 0) : new cc.Color(180, 180, 180);
        }
        
        // 更新统计
        const container = this.resultPanel.getChildByName('Container');
        const stats = ['伤害', '击杀', '死亡', '时长'];
        const values = [result.myDamage, result.myKill, result.myDeath, Math.floor(result.duration)];
        
        stats.forEach((statName, i) => {
            const stat = container?.getChildByName(statName);
            const lbl = stat?.__statLabel;
            if (lbl) {
                lbl.string = `${statName}: ${values[i]}`;
            }
        });
        
        // 更新奖励
        const goldStat = container?.getChildByName('金币');
        const expStat = container?.getChildByName('经验');
        if (goldStat?.__statLabel) goldStat.__statLabel.string = `金币: +${result.rewards.gold}`;
        if (expStat?.__statLabel) expStat.__statLabel.string = `经验: +${result.rewards.exp}`;
    }

    private onShare() {
        // 分享功能
        cc.log('[UIManager] 分享');
    }

    private onReturnHome() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.exitGame();
        }
    }

    private onPlayAgain() {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.restartGame();
        }
    }

    // ==================== 加载界面 ====================

    /**
     * 显示加载界面
     */
    public showLoading(message: string = '加载中...') {
        if (!this.loadingLayer) return;
        
        this.loadingLayer.removeAllChildren();
        
        // 背景
        const bg = new cc.Node('Bg');
        bg.parent = this.loadingLayer;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(750, 1334);
        bg.color = new cc.Color(30, 30, 50);
        
        // 加载动画
        const spinner = new cc.Node('Spinner');
        spinner.parent = this.loadingLayer;
        spinner.addComponent(cc.Label);
        spinner.getComponent(cc.Label).string = '⏳';
        spinner.getComponent(cc.Label).fontSize = 64;
        spinner.setPosition(0, 50);
        
        // 旋转动画
        cc.tween(spinner)
            .repeatForever(cc.tween().by(1, { angle: 360 }))
            .start();
        
        // 文字
        const label = new cc.Node('Label');
        label.parent = this.loadingLayer;
        label.addComponent(cc.Label);
        label.getComponent(cc.Label).string = message;
        label.getComponent(cc.Label).fontSize = 32;
        label.setPosition(0, -50);
        
        this.loadingLayer.active = true;
    }

    /**
     * 隐藏加载界面
     */
    public hideLoading() {
        if (this.loadingLayer) {
            this.loadingLayer.active = false;
            this.loadingLayer.removeAllChildren();
        }
    }

    // ==================== 倒计时 ====================

    /**
     * 显示倒计时
     */
    public showCountdown(seconds: number, callback: Function) {
        if (!this.countdownLabel) return;
        
        let count = seconds;
        
        const tick = () => {
            if (count > 0) {
                this.countdownLabel.getComponent(cc.Label).string = count.toString();
                
                // 放大动画
                this.countdownLabel.setScale(0.5);
                cc.tween(this.countdownLabel)
                    .to(0.3, { scale: 1.5 }, { easing: 'sineOut' })
                    .to(0.7, { scale: 1 }, { easing: 'sineIn' })
                    .start();
                
                count--;
                this.scheduleOnce(tick, 1);
            } else {
                this.countdownLabel.getComponent(cc.Label).string = '开始!';
                
                this.scheduleOnce(() => {
                    this.countdownLabel.getComponent(cc.Label).string = '';
                    callback();
                }, 0.5);
            }
        };
        
        tick();
    }

    // ==================== 伤害数字 ====================

    /**
     * 显示伤害数字
     */
    public showDamageNumber(position: cc.Vec2, damage: number) {
        const dmgLabel = new cc.Node('Damage');
        dmgLabel.parent = this.hudLayer;
        dmgLabel.setPosition(position);
        dmgLabel.addComponent(cc.Label);
        const lbl = dmgLabel.getComponent(cc.Label);
        lbl.string = `-${Math.floor(damage)}`;
        lbl.fontSize = 36;
        lbl.node.color = new cc.Color(255, 80, 80);
        
        // 上升动画
        cc.tween(dmgLabel)
            .by(0.5, { position: cc.v3(0, 50, 0), opacity: -255 }, { easing: 'sineOut' })
            .call(() => dmgLabel.destroy())
            .start();
    }

    // ==================== 重连提示 ====================

    /**
     * 显示重连提示
     */
    public showReconnecting() {
        this.showLoading('正在重新连接...');
    }

    // ==================== 游戏模式回调 ====================

    private onSoloMode() {
        this.hideMainMenu();
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.startGame('solo', 1, 1);
        }
    }

    private onPvPMode() {
        this.showLoading('正在匹配对手...');
        // TODO: 实现匹配逻辑
    }

    private onFriendMode() {
        // TODO: 实现好友对战
        this.showLoading('等待好友加入...');
    }

    private onCharacterSelect() {
        // TODO: 显示角色选择界面
        cc.log('[UIManager] 打开角色选择');
    }

    // ==================== 更新接口 ====================

    /**
     * 更新血条
     */
    public updateHealth(ratio: number) {
        if (this.healthBar) {
            this.healthBar.progress = ratio;
            
            // 颜色变化
            if (ratio > 0.6) {
                this.healthBar.barSprite.node.color = new cc.Color(80, 255, 80);
            } else if (ratio > 0.3) {
                this.healthBar.barSprite.node.color = new cc.Color(255, 200, 0);
            } else {
                this.healthBar.barSprite.node.color = new cc.Color(255, 80, 80);
            }
        }
    }

    /**
     * 更新技能充能
     */
    public updateSkillCharge(ratio: number) {
        if (this.skillBar) {
            this.skillBar.progress = ratio;
        }
    }

    /**
     * 更新计时器
     */
    public updateTimer(time: number) {
        if (this.countdownLabel) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            this.countdownLabel.getComponent(cc.Label).string = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}