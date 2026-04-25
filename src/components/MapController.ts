/**
 * 地图控制器
 * 轮椅大作战 - 控制游戏地图和障碍物
 */

import { GAME_CONFIG } from '../utils/Constants';

export class MapController extends cc.Component {
    // 地图ID
    public mapId: number = 1;
    
    // 地图信息
    private mapData: any = null;
    
    // 障碍物列表
    private obstacles: cc.Node[] = [];
    
    // 道具刷新点
    private spawnPoints: cc.Vector2[] = [];
    
    // 背景节点
    private background: cc.Node = null;

    onLoad() {}

    /**
     * 初始化地图
     */
    init(mapId: number) {
        this.mapId = mapId;
        
        // 加载地图数据
        this.loadMapData(mapId);
        
        // 创建背景
        this.createBackground();
        
        // 创建边界
        this.createBoundaries();
        
        // 创建障碍物
        this.createObstacles();
        
        // 创建道具刷新点
        this.createSpawnPoints();
        
        // 创建装饰物
        this.createDecorations();
    }

    /**
     * 加载地图配置
     */
    private loadMapData(mapId: number) {
        // 地图配置数据
        const mapConfigs: Record<number, MapConfig> = {
            1: { // 社区广场
                name: '社区广场',
                width: 960,
                height: 640,
                bgColor: new cc.Color(120, 180, 100),
                obstacles: [
                    { type: 'barrier', x: -300, y: 100, w: 80, h: 80 },
                    { type: 'barrier', x: 300, y: -50, w: 100, h: 60 },
                    { type: 'platform', x: 0, y: 150, w: 200, h: 30 },
                ],
                spawnPoints: [
                    { x: -400, y: 0 },
                    { x: 400, y: 0 },
                    { x: 0, y: -200 },
                ],
                decorations: [
                    { type: 'tree', x: -450, y: -200 },
                    { type: 'tree', x: 450, y: 200 },
                    { type: 'bench', x: -100, y: -150 },
                    { type: 'bench', x: 200, y: 100 },
                ]
            },
            2: { // 菜市场
                name: '菜市场',
                width: 1000,
                height: 600,
                bgColor: new cc.Color(200, 180, 150),
                obstacles: [
                    { type: 'stall', x: -400, y: 0, w: 120, h: 80 },
                    { type: 'stall', x: -150, y: 50, w: 100, h: 70 },
                    { type: 'stall', x: 150, y: -30, w: 110, h: 75 },
                    { type: 'stall', x: 400, y: 20, w: 100, h: 80 },
                ],
                spawnPoints: [
                    { x: -450, y: 0 },
                    { x: 450, y: 0 },
                    { x: 0, y: 200 },
                ],
                decorations: [
                    { type: 'basket', x: -400, y: 60 },
                    { type: 'basket', x: 150, y: 40 },
                    { type: 'sign', x: 0, y: 250 },
                ]
            },
            3: { // 公园湖边
                name: '公园湖边',
                width: 1000,
                height: 700,
                bgColor: new cc.Color(100, 180, 200),
                obstacles: [
                    { type: 'bench', x: -350, y: 100, w: 150, h: 40 },
                    { type: 'bench', x: 350, y: -100, w: 150, h: 40 },
                    { type: 'rock', x: 0, y: -200, w: 60, h: 50 },
                    { type: 'fountain', x: 0, y: 150, w: 150, h: 150 },
                ],
                spawnPoints: [
                    { x: -450, y: 0 },
                    { x: 450, y: 0 },
                    { x: 0, y: -100 },
                    { x: -200, y: 200 },
                ],
                decorations: [
                    { type: 'tree', x: -450, y: 250 },
                    { type: 'tree', x: 450, y: -250 },
                    { type: 'lamp', x: -400, y: -50 },
                    { type: 'lamp', x: 400, y: 50 },
                ]
            },
            4: { // 医院门口
                name: '医院门口',
                width: 960,
                height: 640,
                bgColor: new cc.Color(200, 220, 230),
                obstacles: [
                    { type: 'bed', x: -300, y: 0, w: 180, h: 80 },
                    { type: 'cabinet', x: 200, y: 100, w: 80, h: 60 },
                    { type: 'wheelchair', x: 350, y: -50, w: 60, h: 60 },
                    { type: 'pillar', x: -100, y: -150, w: 40, h: 40 },
                ],
                spawnPoints: [
                    { x: -400, y: 0 },
                    { x: 400, y: 0 },
                    { x: 0, y: 200 },
                ],
                decorations: [
                    { type: 'cross', x: 0, y: 280 },
                    { type: 'bench', x: 350, y: 150 },
                ]
            }
        };
        
        this.mapData = mapConfigs[mapId] || mapConfigs[1];
    }

    /**
     * 创建背景
     */
    private createBackground() {
        this.background = new cc.Node('Background');
        this.background.parent = this.node;
        
        const sprite = this.background.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.STRETCHED;
        this.background.setContentSize(GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);
        this.background.setPosition(0, 0);
        
        // 设置背景颜色
        if (this.mapData && this.mapData.bgColor) {
            this.background.color = this.mapData.bgColor;
        }
    }

    /**
     * 创建边界
     */
    private createBoundaries() {
        const margin = GAME_CONFIG.MAP_BOUNDARY_MARGIN;
        const width = GAME_CONFIG.MAP_WIDTH;
        const height = GAME_CONFIG.MAP_HEIGHT;
        
        // 创建四边边界
        const boundaries = [
            { x: 0, y: height/2 + margin/2, w: width + margin*2, h: margin }, // 上
            { x: 0, y: -height/2 - margin/2, w: width + margin*2, h: margin }, // 下
            { x: -width/2 - margin/2, y: 0, w: margin, h: height }, // 左
            { x: width/2 + margin/2, y: 0, w: margin, h: height }, // 右
        ];
        
        boundaries.forEach((b, i) => {
            const wall = new cc.Node(`Wall_${i}`);
            wall.parent = this.node;
            wall.setPosition(b.x, b.y);
            
            const sprite = wall.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            wall.setContentSize(b.w, b.h);
            wall.color = new cc.Color(80, 60, 40);
            
            // 添加碰撞
            const collider = wall.addComponent(cc.BoxCollider);
            collider.size = cc.size(b.w, b.h);
            collider.tag = 1; // 边界标签
            
            this.obstacles.push(wall);
        });
    }

    /**
     * 创建障碍物
     */
    private createObstacles() {
        if (!this.mapData || !this.mapData.obstacles) return;
        
        this.mapData.obstacles.forEach((obs: any, i: number) => {
            const obstacle = new cc.Node(`Obstacle_${i}`);
            obstacle.parent = this.node;
            obstacle.setPosition(obs.x, obs.y);
            
            const sprite = obstacle.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            obstacle.setContentSize(obs.w, obs.h);
            
            // 根据类型设置颜色
            switch (obs.type) {
                case 'barrier':
                    obstacle.color = new cc.Color(150, 100, 50);
                    break;
                case 'platform':
                    obstacle.color = new cc.Color(180, 150, 100);
                    break;
                case 'stall':
                    obstacle.color = new cc.Color(200, 160, 100);
                    break;
                case 'bench':
                    obstacle.color = new cc.Color(139, 90, 43);
                    break;
                case 'rock':
                    obstacle.color = new cc.Color(100, 100, 100);
                    break;
                case 'fountain':
                    obstacle.color = new cc.Color(80, 160, 200);
                    break;
                case 'bed':
                    obstacle.color = new cc.Color(220, 220, 240);
                    break;
                case 'cabinet':
                    obstacle.color = new cc.Color(180, 180, 180);
                    break;
                case 'wheelchair':
                    obstacle.color = new cc.Color(100, 100, 100);
                    break;
                case 'pillar':
                    obstacle.color = new cc.Color(200, 200, 200);
                    break;
                default:
                    obstacle.color = new cc.Color(150, 150, 150);
            }
            
            // 添加碰撞
            const collider = obstacle.addComponent(cc.BoxCollider);
            collider.size = cc.size(obs.w, obs.h);
            collider.tag = 2; // 障碍物标签
            
            this.obstacles.push(obstacle);
        });
    }

    /**
     * 创建道具刷新点
     */
    private createSpawnPoints() {
        if (!this.mapData || !this.mapData.spawnPoints) return;
        
        this.mapData.spawnPoints.forEach((sp: any, i: number) => {
            this.spawnPoints.push(cc.v2(sp.x, sp.y));
        });
    }

    /**
     * 创建装饰物
     */
    private createDecorations() {
        if (!this.mapData || !this.mapData.decorations) return;
        
        this.mapData.decorations.forEach((dec: any, i: number) => {
            const decoration = new cc.Node(`Decoration_${dec.type}_${i}`);
            decoration.parent = this.node;
            decoration.setPosition(dec.x, dec.y);
            
            const sprite = decoration.addComponent(cc.Sprite);
            decoration.setContentSize(60, 60);
            
            // 根据类型设置颜色
            switch (dec.type) {
                case 'tree':
                    decoration.color = new cc.Color(50, 150, 50);
                    break;
                case 'bench':
                    decoration.color = new cc.Color(139, 90, 43);
                    break;
                case 'basket':
                    decoration.color = new cc.Color(205, 133, 63);
                    break;
                case 'sign':
                    decoration.color = new cc.Color(200, 200, 200);
                    break;
                case 'lamp':
                    decoration.color = new cc.Color(150, 150, 100);
                    break;
                case 'cross':
                    decoration.color = new cc.Color(255, 0, 0);
                    break;
                default:
                    decoration.color = new cc.Color(100, 100, 100);
            }
            
            // 设置层级 (装饰物在下方)
            decoration.setSiblingIndex(0);
        });
    }

    update(dt: number) {
        // 地图动画效果 (如果有)
    }

    /**
     * 获取随机刷新点
     */
    public getRandomSpawnPoint(): cc.Vec2 {
        if (this.spawnPoints.length === 0) {
            return cc.v2(0, 0);
        }
        const index = Math.floor(Math.random() * this.spawnPoints.length);
        return this.spawnPoints[index].clone();
    }

    /**
     * 检查位置是否可通行
     */
    public isPositionValid(pos: cc.Vec2, radius: number = 20): boolean {
        // 检查边界
        const halfWidth = GAME_CONFIG.MAP_WIDTH / 2 - GAME_CONFIG.MAP_BOUNDARY_MARGIN;
        const halfHeight = GAME_CONFIG.MAP_HEIGHT / 2 - GAME_CONFIG.MAP_BOUNDARY_MARGIN;
        
        if (pos.x < -halfWidth + radius || pos.x > halfWidth - radius) {
            return false;
        }
        if (pos.y < -halfHeight + radius || pos.y > halfHeight - radius) {
            return false;
        }
        
        // 检查障碍物碰撞 (简化版)
        for (const obs of this.obstacles) {
            const obsPos = obs.position;
            const obsSize = obs.getContentSize();
            
            // AABB碰撞检测
            const halfW = obsSize.width / 2;
            const halfH = obsSize.height / 2;
            
            if (pos.x > obsPos.x - halfW - radius && 
                pos.x < obsPos.x + halfW + radius &&
                pos.y > obsPos.y - halfH - radius && 
                pos.y < obsPos.y + halfH + radius) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 获取地图信息
     */
    public getMapInfo(): MapInfo {
        return {
            id: this.mapId,
            name: this.mapData?.name || '未知地图',
            width: this.mapData?.width || GAME_CONFIG.MAP_WIDTH,
            height: this.mapData?.height || GAME_CONFIG.MAP_HEIGHT,
            spawnPoints: this.spawnPoints.map(p => ({ x: p.x, y: p.y }))
        };
    }
}

// 类型定义
interface MapConfig {
    name: string;
    width: number;
    height: number;
    bgColor: cc.Color;
    obstacles: ObstacleConfig[];
    spawnPoints: SpawnPoint[];
    decorations: DecorationConfig[];
}

interface ObstacleConfig {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface SpawnPoint {
    x: number;
    y: number;
}

interface DecorationConfig {
    type: string;
    x: number;
    y: number;
}

interface MapInfo {
    id: number;
    name: string;
    width: number;
    height: number;
    spawnPoints: { x: number; y: number }[];
}