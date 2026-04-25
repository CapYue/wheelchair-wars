/**
 * 投射物管理器
 * 轮椅大作战 - 管理所有投射物
 */

import { 
    WeaponType, 
    WEAPON_DATA, 
    GAME_CONFIG, 
    GAME_EVENTS 
} from '../utils/Constants';
import { PoolManager } from '../utils/PoolManager';

export interface ProjectileConfig {
    type: WeaponType;
    ownerId: number;
    position: cc.Vec2;
    direction: number;
}

export class ProjectileManager extends cc.Component {
    // 投射物列表
    private projectiles: Projectile[] = [];
    
    // 对象池
    private pool: PoolManager = null;
    
    // 投射物预制体引用
    private projectilePrefab: cc.Prefab = null;

    onLoad() {
        this.pool = new PoolManager();
    }

    /**
     * 初始化
     */
    init() {
        // 创建投射物预制体
        this.createProjectilePrefab();
        
        // 初始化对象池
        this.initPool();
        
        // 监听事件
        this.node.on(GAME_EVENTS.PLAYER_ATTACK, this.onPlayerAttack, this);
    }

    private createProjectilePrefab() {
        // 创建投射物预制体
        const node = new cc.Node('Projectile');
        node.addComponent(cc.Sprite);
        
        // 添加碰撞组件
        const collider = node.addComponent(cc.CircleCollider);
        collider.radius = 10;
        
        this.projectilePrefab = node;
    }

    private initPool() {
        // 预创建投射物
        for (let i = 0; i < GAME_CONFIG.PROJECTILE_POOL_SIZE; i++) {
            const proj = cc.instantiate(this.projectilePrefab);
            proj.parent = this.node;
            proj.active = false;
            this.pool.put(proj);
        }
    }

    /**
     * 创建投射物
     */
    public createProjectile(config: ProjectileConfig) {
        if (this.projectiles.length >= GAME_CONFIG.MAX_PROJECTILES) {
            // 移除最早的投射物
            this.removeOldestProjectile();
        }
        
        // 获取或创建投射物
        let node = this.pool.get();
        if (!node) {
            node = cc.instantiate(this.projectilePrefab);
            node.parent = this.node;
        }
        
        // 获取武器配置
        const weaponConfig = WEAPON_DATA[config.type];
        if (!weaponConfig) {
            node.destroy();
            return;
        }
        
        // 设置投射物属性
        node.active = true;
        node.setPosition(config.position);
        
        // 创建投射物组件
        const projectile = node.getComponent(Projectile) || node.addComponent(Projectile);
        projectile.init({
            type: config.type,
            ownerId: config.ownerId,
            config: weaponConfig,
            direction: config.direction
        });
        
        // 添加到列表
        this.projectiles.push(projectile);
    }

    /**
     * 移除最旧的投射物
     */
    private removeOldestProjectile() {
        if (this.projectiles.length > 0) {
            const oldest = this.projectiles.shift();
            if (oldest && oldest.node) {
                oldest.node.active = false;
                this.pool.put(oldest.node);
            }
        }
    }

    /**
     * 移除投射物
     */
    public removeProjectile(projectile: Projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index >= 0) {
            this.projectiles.splice(index, 1);
        }
        
        if (projectile && projectile.node) {
            projectile.node.active = false;
            this.pool.put(projectile.node);
        }
    }

    update(dt: number) {
        // 更新所有投射物
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            if (!projectile || !projectile.isActive) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // 更新位置
            projectile.update(dt);
            
            // 检查边界
            if (this.isOutOfBounds(projectile.node.position)) {
                this.removeProjectile(projectile);
                continue;
            }
            
            // 检查碰撞
            if (projectile.checkCollision()) {
                this.onProjectileHit(projectile);
            }
        }
    }

    /**
     * 检查是否超出边界
     */
    private isOutOfBounds(pos: cc.Vec2): boolean {
        const halfWidth = GAME_CONFIG.MAP_WIDTH / 2;
        const halfHeight = GAME_CONFIG.MAP_HEIGHT / 2;
        
        return pos.x < -halfWidth || pos.x > halfWidth ||
               pos.y < -halfHeight || pos.y > halfHeight;
    }

    /**
     * 投射物命中
     */
    private onProjectileHit(projectile: Projectile) {
        // 获取游戏实例
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        // 命中效果
        projectile.playHitEffect();
        
        // 根据武器类型处理
        switch (projectile.config.effect) {
            case 'splash':
                this.handleSplashHit(projectile);
                break;
            case 'aoe':
                this.handleAOEHit(projectile);
                break;
            case 'stun':
                this.handleStunHit(projectile);
                break;
            case 'slow':
                this.handleSlowHit(projectile);
                break;
            default:
                this.handleNormalHit(projectile);
        }
        
        // 移除投射物
        this.removeProjectile(projectile);
    }

    /**
     * 普通命中
     */
    private handleNormalHit(projectile: Projectile) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        const target = this.findTarget(projectile.ownerId);
        if (target) {
            target.takeDamage(
                projectile.config.damage, 
                projectile.ownerId,
                projectile.type
            );
            
            // 击退效果
            if (projectile.config.knockbackForce) {
                this.applyKnockback(target, projectile.direction, projectile.config.knockbackForce);
            }
        }
    }

    /**
     * 溅射命中
     */
    private handleSplashHit(projectile: Projectile) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        const hitRadius = projectile.config.splashRadius || 30;
        
        // 检查范围内所有玩家
        [game.player, game.enemy].forEach(target => {
            if (!target || target.id === projectile.ownerId) return;
            
            const distance = cc.Vec2.distance(projectile.node.position, target.node.position);
            if (distance <= hitRadius) {
                target.takeDamage(
                    projectile.config.damage,
                    projectile.ownerId,
                    projectile.type
                );
            }
        });
    }

    /**
     * AOE命中
     */
    private handleAOEHit(projectile: Projectile) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        const aoeRadius = projectile.config.splashRadius || 200;
        
        // 对所有敌人造成伤害
        [game.player, game.enemy].forEach(target => {
            if (!target || target.id === projectile.ownerId) return;
            
            const distance = cc.Vec2.distance(this.node.position, target.node.position);
            if (distance <= aoeRadius) {
                target.takeDamage(
                    projectile.config.damage,
                    projectile.ownerId,
                    projectile.type
                );
            }
        });
        
        // 播放AOE特效
        this.playAOEEffect(this.node.position, aoeRadius);
    }

    /**
     * 眩晕命中
     */
    private handleStunHit(projectile: Projectile) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        const target = this.findTarget(projectile.ownerId);
        if (target) {
            target.takeDamage(
                projectile.config.damage,
                projectile.ownerId,
                projectile.type
            );
            
            // 添加眩晕buff
            target.addBuff(BuffType.STUN, projectile.config.stunDuration || 1, 0);
        }
    }

    /**
     * 减速命中
     */
    private handleSlowHit(projectile: Projectile) {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return;
        
        const target = this.findTarget(projectile.ownerId);
        if (target) {
            target.takeDamage(
                projectile.config.damage,
                projectile.ownerId,
                projectile.type
            );
            
            // 添加减速buff
            target.addBuff(
                BuffType.SLOW, 
                projectile.config.slowDuration || 2, 
                projectile.config.slowRate || 0.3
            );
        }
    }

    /**
     * 应用击退
     */
    private applyKnockback(target: any, direction: number, force: number) {
        const knockbackTarget = target.node.position.add(cc.v2(direction * force, 0));
        
        // 限制边界
        const halfWidth = GAME_CONFIG.MAP_WIDTH / 2 - 50;
        knockbackTarget.x = cc.misc.clampf(knockbackTarget.x, -halfWidth, halfWidth);
        
        cc.tween(target.node)
            .to(0.2, { position: knockbackTarget }, { easing: 'sineOut' })
            .start();
    }

    /**
     * 播放AOE特效
     */
    private playAOEOffect(position: cc.Vec2, radius: number) {
        // 创建特效节点
        const effect = new cc.Node('AOEEffect');
        effect.parent = this.node;
        effect.setPosition(position);
        
        // 添加圆形精灵
        const sprite = effect.addComponent(cc.Sprite);
        // 可以添加扩散动画
        
        // 移除特效
        this.scheduleOnce(() => {
            effect.destroy();
        }, 1.0);
    }

    /**
     * 查找目标
     */
    private findTarget(ownerId: number): any {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return null;
        
        if (ownerId === game.localPlayerId) {
            return game.enemy;
        } else {
            return game.player;
        }
    }

    /**
     * 玩家攻击事件
     */
    private onPlayerAttack(event: any) {
        this.createProjectile({
            type: event.weaponType,
            ownerId: event.playerId,
            position: event.position,
            direction: event.direction === 1 ? 1 : -1
        });
    }

    /**
     * 清理所有投射物
     */
    public clearAll() {
        this.projectiles.forEach(p => {
            if (p && p.node) {
                p.node.active = false;
                this.pool.put(p.node);
            }
        });
        this.projectiles = [];
    }

    onDestroy() {
        this.node.off(GAME_EVENTS.PLAYER_ATTACK, this.onPlayerAttack, this);
    }
}

// 导入需要的类型
import { BuffType } from '../utils/Constants';

export class Projectile extends cc.Component {
    // 投射物属性
    public type: WeaponType = WeaponType.EGG;
    public ownerId: number = 0;
    public config: any = null;
    public direction: number = 1;
    public isActive: boolean = true;
    
    // 移动
    private velocity: cc.Vec2 = cc.v2(0, 0);
    private distance: number = 0;
    
    // 追踪 (假牙飞弹)
    private trackingStrength: number = 0;
    private trackTarget: any = null;

    /**
     * 初始化
     */
    init(config: any) {
        this.type = config.type;
        this.ownerId = config.ownerId;
        this.config = config.config;
        this.direction = config.direction;
        this.isActive = true;
        this.distance = 0;
        
        // 设置速度
        const speed = this.config.speed || 8;
        this.velocity = cc.v2(this.direction * speed, 0);
        
        // 检查追踪效果
        if (this.config.trackingStrength) {
            this.trackingStrength = this.config.trackingStrength;
            const Game = require('../Game').Game;
            const game = Game.getInstance();
            if (game) {
                this.trackTarget = this.direction > 0 ? game.enemy : game.player;
            }
        }
        
        // 更新外观
        this.updateAppearance();
    }

    /**
     * 更新外观
     */
    private updateAppearance() {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            // 根据武器类型设置颜色或图片
            switch (this.type) {
                case WeaponType.EGG:
                case WeaponType.IRON_EGG:
                    sprite.node.color = new cc.Color(255, 255, 200);
                    break;
                case WeaponType.CRUTCH:
                    sprite.node.color = new cc.Color(139, 90, 43);
                    break;
                case WeaponType.MEDICINE:
                    sprite.node.color = new cc.Color(100, 200, 100);
                    break;
                case WeaponType.FALSE_TEETH:
                    sprite.node.color = new cc.Color(255, 255, 255);
                    break;
                case WeaponType.BISCUIT:
                    sprite.node.color = new cc.Color(205, 133, 63);
                    break;
                case WeaponType.STELTHOSCOPE:
                    sprite.node.color = new cc.Color(100, 100, 100);
                    break;
                case WeaponType.SHOPPING_CART:
                    sprite.node.color = new cc.Color(128, 128, 128);
                    break;
            }
        }
    }

    update(dt: number) {
        if (!this.isActive) return;
        
        // 追踪逻辑
        if (this.trackingStrength && this.trackTarget && this.trackTarget.isAlive) {
            const targetPos = this.trackTarget.node.position;
            const toTarget = targetPos.sub(this.node.position).normalize();
            
            // 调整速度方向
            const currentDir = this.velocity.clone().normalize();
            const newDir = currentDir.add(toTarget.mul(this.trackingStrength)).normalize();
            this.velocity = newDir.mul(this.velocity.mag());
        }
        
        // 更新位置
        const movement = this.velocity.mul(dt * 60);
        const newPos = this.node.position.add(movement);
        this.node.setPosition(newPos);
        
        // 更新飞行距离
        this.distance += movement.mag();
        
        // 检查是否超出射程
        if (this.distance >= this.config.range) {
            this.isActive = false;
        }
    }

    /**
     * 检查碰撞
     */
    checkCollision(): boolean {
        const Game = require('../Game').Game;
        const game = Game.getInstance();
        
        if (!game) return false;
        
        // 获取目标
        let target: any = null;
        if (this.ownerId === game.localPlayerId) {
            target = game.enemy;
        } else {
            target = game.player;
        }
        
        if (!target || !target.isAlive) return false;
        
        // 碰撞检测
        const distance = cc.Vec2.distance(this.node.position, target.node.position);
        const hitRadius = this.config.splashRadius > 0 ? this.config.splashRadius : 20;
        
        return distance <= hitRadius;
    }

    /**
     * 播放命中效果
     */
    playHitEffect() {
        // 爆炸效果
        const effect = new cc.Node('HitEffect');
        effect.parent = this.node.parent;
        effect.setPosition(this.node.position);
        
        // 扩散动画
        cc.tween(effect)
            .to(0.2, { scale: 2, opacity: 0 })
            .call(() => effect.destroy())
            .start();
    }
}