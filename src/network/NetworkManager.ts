/**
 * 网络管理器
 * 轮椅大作战 - 处理网络通信
 */

export class NetworkManager {
    private static instance: NetworkManager = null;
    
    // 连接状态
    public isConnected: boolean = false;
    public isConnecting: boolean = false;
    
    // WebSocket连接
    private ws: any = null;
    private url: string = '';
    
    // 重连配置
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 3;
    private reconnectDelay: number = 3000;
    
    // 回调函数
    private onConnectSuccess: Function = null;
    private onConnectFailed: Function = null;
    private onMatchSuccess: Function = null;
    private onMessage: Function = null;

    constructor() {
        NetworkManager.instance = this;
    }

    public static getInstance(): NetworkManager {
        return NetworkManager.instance;
    }

    /**
     * 连接服务器
     */
    connect(onSuccess: Function, onFailed: Function) {
        this.onConnectSuccess = onSuccess;
        this.onConnectFailed = onFailed;
        
        // 检查是否微信环境
        if (typeof wx !== 'undefined') {
            this.connectWechat();
        } else {
            // 开发环境模拟
            this.connectMock();
        }
    }

    /**
     * 微信小程序连接
     */
    private connectWechat() {
        this.isConnecting = true;
        
        // 使用微信云开发
        wx.cloud.init({
            env: 'wheelchair-wars',
            traceUser: true
        });
        
        // 模拟连接成功
        this.scheduleOnce(() => {
            this.isConnecting = false;
            this.isConnected = true;
            
            if (this.onConnectSuccess) {
                this.onConnectSuccess();
            }
        }, 1);
    }

    /**
     * 开发环境模拟连接
     */
    private connectMock() {
        this.isConnecting = true;
        
        // 模拟网络延迟
        this.scheduleOnce(() => {
            this.isConnecting = false;
            this.isConnected = true;
            
            cc.log('[NetworkManager] 连接成功 (Mock)');
            
            if (this.onConnectSuccess) {
                this.onConnectSuccess();
            }
        }, 0.5);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.isConnecting = false;
    }

    /**
     * 匹配对手
     */
    matchmake(onSuccess: Function) {
        this.onMatchSuccess = onSuccess;
        
        if (typeof wx !== 'undefined') {
            this.matchmakeWechat();
        } else {
            this.matchmakeMock();
        }
    }

    private matchmakeWechat() {
        // 使用微信云函数进行匹配
        wx.cloud.callFunction({
            name: 'matchmaking',
            data: {
                playerId: this.getPlayerId()
            },
            success: (res: any) => {
                cc.log('[NetworkManager] 匹配成功:', res);
                if (this.onMatchSuccess) {
                    this.onMatchSuccess({
                        roomId: res.result.roomId,
                        enemy: res.result.enemy
                    });
                }
            },
            fail: (err: any) => {
                cc.error('[NetworkManager] 匹配失败:', err);
                // 降级为AI对战
                this.onMatchSuccess({
                    isAI: true
                });
            }
        });
    }

    private matchmakeMock() {
        // 模拟匹配延迟
        this.scheduleOnce(() => {
            cc.log('[NetworkManager] 匹配成功 (Mock)');
            
            if (this.onMatchSuccess) {
                this.onMatchSuccess({
                    isAI: true,
                    roomId: 'mock_room_001'
                });
            }
        }, 1.5);
    }

    /**
     * 发送移动数据
     */
    sendMove(data: MoveData) {
        this.send({
            type: 'move',
            data: data
        });
    }

    /**
     * 发送攻击数据
     */
    sendAttack(data: AttackData) {
        this.send({
            type: 'attack',
            data: data
        });
    }

    /**
     * 发送技能使用
     */
    sendSkill(data: SkillData) {
        this.send({
            type: 'skill',
            data: data
        });
    }

    /**
     * 发送消息
     */
    private send(message: any) {
        if (!this.isConnected) {
            cc.warn('[NetworkManager] 未连接，无法发送消息');
            return;
        }
        
        const jsonStr = JSON.stringify(message);
        
        if (this.ws) {
            this.ws.send({
                data: jsonStr
            });
        } else {
            cc.log('[NetworkManager] 发送消息:', message.type);
        }
    }

    /**
     * 处理接收到的消息
     */
    private handleMessage(message: any) {
        switch (message.type) {
            case 'sync':
                this.handleSync(message.data);
                break;
            case 'hit':
                this.handleHit(message.data);
                break;
            case 'game_end':
                this.handleGameEnd(message.data);
                break;
            default:
                cc.log('[NetworkManager] 未知消息类型:', message.type);
        }
    }

    private handleSync(data: any) {
        // 触发同步事件
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        if (game) {
            game.node.emit('net_sync', data);
        }
    }

    private handleHit(data: any) {
        // 处理命中事件
        cc.log('[NetworkManager] 命中事件:', data);
    }

    private handleGameEnd(data: any) {
        // 处理游戏结束
        cc.log('[NetworkManager] 游戏结束:', data);
    }

    /**
     * 获取玩家ID
     */
    private getPlayerId(): string {
        // 从本地存储获取
        const userData = cc.sys.localStorage.getItem('ww_user_data');
        if (userData) {
            const data = JSON.parse(userData);
            return data.openid || 'mock_player_001';
        }
        return 'mock_player_001';
    }

    /**
     * 尝试重连
     */
    private tryReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            cc.error('[NetworkManager] 重连次数用尽');
            return;
        }
        
        this.reconnectAttempts++;
        cc.log(`[NetworkManager] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.scheduleOnce(() => {
            this.connect(
                () => {
                    cc.log('[NetworkManager] 重连成功');
                    this.reconnectAttempts = 0;
                    
                    const Game = require('../Game').Game;
                    const game = Game.getInstance();
                    if (game) {
                        game.node.emit('net_reconnect');
                    }
                },
                () => {
                    this.tryReconnect();
                }
            );
        }, this.reconnectDelay);
    }
}

// 类型定义
interface MoveData {
    id: number;
    position: { x: number; y: number };
    direction: number;
    timestamp: number;
}

interface AttackData {
    id: number;
    weaponType: number;
    position: { x: number; y: number };
    direction: number;
    timestamp: number;
}

interface SkillData {
    id: number;
    skillId: number;
    timestamp: number;
}