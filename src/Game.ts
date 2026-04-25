/**
 * 游戏主控制器
 * 轮椅大作战 - 控制游戏主流程
 */

import { 
    GameState, 
    GameStateMachine, 
    GAME_CONFIG, 
    GAME_EVENTS,
    WeaponType,
    Direction,
    BuffType
} from './Constants';
import { Player } from '../components/Player';
import { MapController } from '../components/MapController';
import { ProjectileManager } from '../components/ProjectileManager';
import { UIManager } from '../ui/UIManager';
import { SoundManager } from './SoundManager';
import { NetworkManager } from '../network/NetworkManager';
import { DataManager } from './DataManager';

export class Game extends cc.Component {
    // 单例
    private static instance: Game = null;
    public static getInstance(): Game {
        return Game.instance;
    }

    // 游戏状态
    private state: GameState = GameState.MENU;
    private stateMachine: GameStateMachine = new GameStateMachine();

    // 游戏组件
    public player: Player = null;
    public enemy: Player = null;
    public map: MapController = null;
    public projectileManager: ProjectileManager = null;
    
    // UI
    public ui: UIManager = null;
    
    // 管理器
    public soundManager: SoundManager = null;
    public networkManager: NetworkManager = null;
    public dataManager: DataManager = null;

    // 游戏数据
    public gameTime: number = 0;
    public matchDuration: number = GAME_CONFIG.MATCH_DURATION;
    public localPlayerId: number = 0;
    public enemyPlayerId: number = 0;

    // 战斗统计
    public stats = {
        myDamage: 0,
        myKill: 0,
        myDeath: 0,
        skillUsed: 0,
        weaponUsed: 0
    };

    // 生命周期
    onLoad() {
        Game.instance = this;
        this.initManagers();
        this.setupEventListeners();
    }

    start() {
        this.stateMachine.setState(GameState.LOADING);
    }

    update(dt: number) {
        if (this.state !== GameState.PLAYING) return;

        // 更新游戏时间
        this.gameTime += dt;
        
        // 更新玩家
        if (this.player) {
            this.player.update(dt);
        }
        
        // 更新敌人
        if (this.enemy) {
            this.enemy.update(dt);
        }
        
        // 更新投射物
        if (this.projectileManager) {
            this.projectileManager.update(dt);
        }
        
        // 更新地图
        if (this.map) {
            this.map.update(dt);
        }
        
        // 检查游戏结束
        this.checkGameEnd();
    }

    // ==================== 初始化 ====================
    
    private initManagers() {
        // 数据管理器
        this.dataManager = new DataManager();
        this.dataManager.load();
        
        // 音效管理器
        this.soundManager = new SoundManager();
        this.soundManager.load();
        
        // 网络管理器
        this.networkManager = new NetworkManager();
        
        // UI管理器 - 延迟初始化
        this.scheduleOnce(() => {
            this.ui = this.getComponent(UIManager) || this.addComponent(UIManager);
            this.ui.init();
        }, 0);
    }

    private setupEventListeners() {
        // 游戏事件
        this.node.on(GAME_EVENTS.GAME_START, this.onGameStart, this);
        this.node.on(GAME_EVENTS.GAME_PAUSE, this.onGamePause, this);
        this.node.on(GAME_EVENTS.GAME_RESUME, this.onGameResume, this);
        this.node.on(GAME_EVENTS.GAME_END, this.onGameEnd, this);
        
        // 战斗事件
        this.node.on(GAME_EVENTS.PLAYER_HIT, this.onPlayerHit, this);
        this.node.on(GAME_EVENTS.PLAYER_DEATH, this.onPlayerDeath, this);
        
        // 网络事件
        this.node.on(GAME_EVENTS.NET_SYNC, this.onNetSync, this);
        this.node.on(GAME_EVENTS.NET_DISCONNECT, this.onNetDisconnect, this);
    }

    // ==================== 游戏流程控制 ====================

    /**
     * 开始新游戏
     * @param mode 游戏模式 (solo/pvp)
     * @param mapId 地图ID
     * @param characterId 角色ID
     */
    public startGame(mode: 'solo' | 'pvp', mapId: number, characterId: number) {
        cc.log(`[Game] 开始游戏 - mode: ${mode}, map: ${mapId}, character: ${characterId}`);
        
        this.state = GameState.LOADING;
        this.stateMachine.setState(GameState.LOADING);
        
        // 显示加载界面
        if (this.ui) {
            this.ui.showLoading('正在加载游戏资源...');
        }
        
        // 加载资源
        this.loadResources(mapId, characterId, () => {
            // 初始化游戏场景
            this.initGameScene(mapId, characterId);
            
            if (mode === 'solo') {
                // 单人模式 - 创建AI敌人
                this.initAIEnemy();
            }
            
            // 连接网络 (如果是PVP)
            if (mode === 'pvp') {
                this.connectToServer(() => {
                    this.startMatchmaking();
                });
            } else {
                // 单人模式直接开始
                this.beginCountdown();
            }
        });
    }

    private loadResources(mapId: number, characterId: number, callback: Function) {
        // 模拟资源加载
        this.scheduleOnce(() => {
            cc.log('[Game] 资源加载完成');
            callback();
        }, 0.5);
    }

    private initGameScene(mapId: number, characterId: number) {
        // 创建玩家
        this.createLocalPlayer(characterId);
        
        // 创建地图
        this.createMap(mapId);
        
        // 创建投射物管理器
        this.createProjectileManager();
        
        // 隐藏加载界面
        if (this.ui) {
            this.ui.hideLoading();
            this.ui.showGameHUD();
        }
        
        cc.log('[Game] 游戏场景初始化完成');
    }

    private createLocalPlayer(characterId: number) {
        // 从预制体创建玩家节点
        const playerNode = new cc.Node('Player');
        playerNode.setPosition(100, 0);
        this.node.addChild(playerNode);
        
        this.player = playerNode.addComponent(Player);
        this.player.init({
            id: 1,
            characterId: characterId,
            isLocal: true
        });
        
        this.localPlayerId = 1;
        this.player.node.on(GAME_EVENTS.PLAYER_ATTACK, this.onPlayerAttack, this);
        this.player.node.on(GAME_EVENTS.PLAYER_MOVE, this.onPlayerMove, this);
    }

    private createAIEnemy() {
        const enemyNode = new cc.Node('Enemy');
        enemyNode.setPosition(-100, 0);
        this.node.addChild(enemyNode);
        
        this.enemy = enemyNode.addComponent(Player);
        this.enemy.init({
            id: 2,
            characterId: 1, // 默认角色
            isLocal: false,
            isAI: true
        });
        
        this.enemyPlayerId = 2;
    }

    private createMap(mapId: number) {
        const mapNode = new cc.Node('Map');
        this.node.addChild(mapNode, -1);
        
        this.map = mapNode.addComponent(MapController);
        this.map.init(mapId);
    }

    private createProjectileManager() {
        const pmNode = new cc.Node('ProjectileManager');
        this.node.addChild(pmNode);
        
        this.projectileManager = pmNode.addComponent(ProjectileManager);
        this.projectileManager.init();
    }

    private beginCountdown() {
        this.state = GameState.READY;
        this.stateMachine.setState(GameState.READY);
        
        if (this.ui) {
            this.ui.showCountdown(3, () => {
                this.startPlaying();
            });
        }
    }

    private startPlaying() {
        this.state = GameState.PLAYING;
        this.stateMachine.setState(GameState.PLAYING);
        this.gameTime = 0;
        
        // 重置战斗统计
        this.stats = {
            myDamage: 0,
            myKill: 0,
            myDeath: 0,
            skillUsed: 0,
            weaponUsed: 0
        };
        
        // 播放BGM
        this.soundManager.playBGM('battle');
        
        // 通知游戏开始
        this.node.emit(GAME_EVENTS.GAME_START, { time: this.gameTime });
        
        cc.log('[Game] 游戏开始！');
    }

    // ==================== AI敌人 ====================
    
    private initAIEnemy() {
        this.createAIEnemy();
    }

    private updateAI(dt: number) {
        if (!this.enemy || !this.enemy.isAlive) return;
        
        // 简单的AI行为
        const playerPos = this.player.node.position;
        const enemyPos = this.enemy.node.position;
        
        // 计算距离
        const distance = cc.Vec2.distance(playerPos, enemyPos);
        
        // 根据距离决定行为
        if (distance > 300) {
            // 远离时 - 接近玩家
            this.enemy.moveTo(playerPos);
        } else if (distance > 150) {
            // 中距离 - 随机移动并攻击
            if (Math.random() < 0.02) {
                this.enemy.attack();
            }
            if (Math.random() < 0.5) {
                const offset = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
                this.enemy.moveTo(cc.v2(playerPos.x + offset.x, playerPos.y + offset.y));
            }
        } else {
            // 近距离 - 持续攻击
            if (Math.random() < 0.05) {
                this.enemy.attack();
            }
            
            // 偶尔使用技能
            if (Math.random() < 0.005 && this.enemy.canUseSkill) {
                this.enemy.useSkill();
            }
        }
    }

    // ==================== 战斗系统 ====================

    private onPlayerAttack(event: any) {
        const { weaponType, position, direction } = event;
        
        // 通知投射物管理器创建投射物
        if (this.projectileManager) {
            this.projectileManager.createProjectile({
                type: weaponType,
                ownerId: this.localPlayerId,
                position: position,
                direction: direction
            });
        }
        
        this.stats.weaponUsed++;
        
        // 播放音效
        this.soundManager.playSFX('throw');
    }

    private onPlayerMove(event: any) {
        // 网络同步移动
        if (this.networkManager && this.networkManager.isConnected) {
            this.networkManager.sendMove({
                id: this.localPlayerId,
                position: event.position,
                direction: event.direction,
                timestamp: Date.now()
            });
        }
    }

    private onPlayerHit(event: any) {
        const { targetId, damage, weaponType } = event;
        
        // 更新统计
        if (targetId === this.enemyPlayerId) {
            this.stats.myDamage += damage;
        }
        
        // 更新UI
        if (this.ui) {
            this.ui.showDamageNumber(event.position, damage);
        }
        
        // 播放命中音效
        this.soundManager.playHitSound(weaponType);
    }

    private onPlayerDeath(event: any) {
        const { playerId, killerId } = event;
        
        if (playerId === this.localPlayerId) {
            this.stats.myDeath++;
        } else if (killerId === this.localPlayerId) {
            this.stats.myKill++;
        }
        
        // 检查游戏结束
        this.checkGameEnd();
    }

    // ==================== 网络同步 ====================

    private connectToServer(callback: Function) {
        this.networkManager.connect(() => {
            cc.log('[Game] 连接服务器成功');
            callback();
        }, (error) => {
            cc.log('[Game] 连接服务器失败:', error);
            // 降级为单人模式
            this.initAIEnemy();
            callback();
        });
    }

    private startMatchmaking() {
        this.networkManager.matchmake((matchData) => {
            cc.log('[Game] 匹配成功:', matchData);
            
            // 创建对手
            this.createRemotePlayer(matchData.enemy);
            
            // 开始倒计时
            this.beginCountdown();
        });
    }

    private createRemotePlayer(enemyData: any) {
        const enemyNode = new cc.Node('Enemy');
        enemyNode.setPosition(enemyData.position.x, enemyData.position.y);
        this.node.addChild(enemyNode);
        
        this.enemy = enemyNode.addComponent(Player);
        this.enemy.init({
            id: enemyData.id,
            characterId: enemyData.characterId,
            isLocal: false,
            isAI: false
        });
        
        this.enemyPlayerId = enemyData.id;
    }

    private onNetSync(event: any) {
        const { players } = event;
        
        // 更新玩家位置
        players.forEach((playerData: any) => {
            if (playerData.id === this.enemyPlayerId && this.enemy) {
                this.enemy.setNetworkState(playerData);
            }
        });
    }

    private onNetDisconnect(event: any) {
        cc.log('[Game] 网络断开');
        
        // 显示重连提示
        if (this.ui) {
            this.ui.showReconnecting();
        }
    }

    // ==================== 游戏状态检查 ====================

    private checkGameEnd() {
        if (this.state !== GameState.PLAYING) return;
        
        // 检查玩家死亡
        if (!this.player || !this.player.isAlive) {
            this.endGame(this.enemyPlayerId);
            return;
        }
        
        if (!this.enemy || !this.enemy.isAlive) {
            this.endGame(this.localPlayerId);
            return;
        }
        
        // 检查时间耗尽
        if (this.gameTime >= this.matchDuration) {
            // 时间结束，血量高者获胜
            const winner = this.player.health > this.enemy.health 
                ? this.localPlayerId 
                : this.enemyPlayerId;
            this.endGame(winner);
        }
    }

    private endGame(winnerId: number) {
        this.state = GameState.RESULT;
        this.stateMachine.setState(GameState.RESULT);
        
        const isWinner = winnerId === this.localPlayerId;
        
        // 停止所有声音
        this.soundManager.stopBGM();
        
        // 播放结束音效
        this.soundManager.playSFX(isWinner ? 'win' : 'lose');
        
        // 计算奖励
        const rewards = this.calculateRewards(isWinner);
        
        // 显示结算界面
        if (this.ui) {
            this.ui.showResult({
                isWinner: isWinner,
                myHealth: this.player ? this.player.health : 0,
                enemyHealth: this.enemy ? this.enemy.health : 0,
                myDamage: this.stats.myDamage,
                myKill: this.stats.myKill,
                myDeath: this.stats.myDeath,
                duration: this.gameTime,
                rewards: rewards
            });
        }
        
        // 保存战绩
        this.dataManager.saveGameRecord({
            mode: 'solo',
            result: isWinner ? 'win' : 'lose',
            damage: this.stats.myDamage,
            kill: this.stats.myKill,
            death: this.stats.myDeath,
            duration: this.gameTime,
            time: Date.now()
        });
        
        cc.log(`[Game] 游戏结束 - 获胜者: ${winnerId}`);
        
        this.node.emit(GAME_EVENTS.GAME_END, { winner: winnerId });
    }

    private calculateRewards(isWinner: boolean) {
        const baseGold = 50;
        const baseExp = 30;
        
        const bonusGold = isWinner ? 30 : 10;
        const bonusExp = isWinner ? 20 : 10;
        
        // 击杀奖励
        const killBonus = this.stats.myKill * 5;
        
        return {
            gold: baseGold + bonusGold + killBonus,
            exp: baseExp + bonusExp
        };
    }

    // ==================== 游戏控制 ====================

    private onGameStart(event: any) {
        cc.log('[Game] 游戏已开始');
    }

    private onGamePause(event: any) {
        cc.log('[Game] 游戏暂停');
        this.state = GameState.PAUSED;
    }

    private onGameResume(event: any) {
        cc.log('[Game] 游戏继续');
        this.state = GameState.PLAYING;
    }

    private onGameEnd(event: any) {
        cc.log('[Game] 游戏结束事件');
    }

    /**
     * 暂停游戏
     */
    public pauseGame() {
        if (this.state !== GameState.PLAYING) return;
        
        cc.game.pause();
        this.node.emit(GAME_EVENTS.GAME_PAUSE);
        
        if (this.ui) {
            this.ui.showPauseMenu();
        }
    }

    /**
     * 继续游戏
     */
    public resumeGame() {
        if (this.state !== GameState.PAUSED) return;
        
        cc.game.resume();
        this.node.emit(GAME_EVENTS.GAME_RESUME);
        
        if (this.ui) {
            this.ui.hidePauseMenu();
        }
    }

    /**
     * 退出游戏
     */
    public exitGame() {
        // 断开网络
        if (this.networkManager) {
            this.networkManager.disconnect();
        }
        
        // 停止音效
        if (this.soundManager) {
            this.soundManager.stopAll();
        }
        
        // 切换场景
        cc.director.loadScene('home');
    }

    /**
     * 重新开始
     */
    public restartGame() {
        // 清理场景
        this.cleanup();
        
        // 重新开始
        this.startGame('solo', 1, 1);
    }

    /**
     * 清理游戏对象
     */
    private cleanup() {
        // 清理玩家
        if (this.player) {
            this.player.node.destroy();
            this.player = null;
        }
        
        // 清理敌人
        if (this.enemy) {
            this.enemy.node.destroy();
            this.enemy = null;
        }
        
        // 清理地图
        if (this.map) {
            this.map.node.destroy();
            this.map = null;
        }
        
        // 清理投射物
        if (this.projectileManager) {
            this.projectileManager.destroy();
            this.projectileManager = null;
        }
        
        // 重置状态
        this.state = GameState.MENU;
        this.gameTime = 0;
    }

    // ==================== 公开方法 ====================

    /**
     * 获取当前游戏状态
     */
    public getState(): GameState {
        return this.state;
    }

    /**
     * 获取游戏时间
     */
    public getGameTime(): number {
        return this.gameTime;
    }

    /**
     * 获取剩余时间
     */
    public getRemainingTime(): number {
        return Math.max(0, this.matchDuration - this.gameTime);
    }

    /**
     * 是否在游戏中
     */
    public isPlaying(): boolean {
        return this.state === GameState.PLAYING;
    }
}

// ==================== 状态机 ====================

export class GameStateMachine {
    private currentState: GameState = GameState.MENU;
    private previousState: GameState = GameState.MENU;
    private stateTime: number = 0;

    public setState(newState: GameState) {
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateTime = 0;
        
        cc.log(`[StateMachine] 状态切换: ${GameState[this.previousState]} -> ${GameState[newState]}`);
    }

    public getState(): GameState {
        return this.currentState;
    }

    public isState(state: GameState): boolean {
        return this.currentState === state;
    }
}