/**
 * 玩家控制器
 * 轮椅大作战 - 控制玩家角色
 */

import { 
    CharacterType, 
    CharacterConfig,
    CHARACTER_DATA,
    WeaponType,
    WEAPON_DATA,
    Direction,
    BuffType,
    BUFF_DURATION,
    GameState,
    GAME_EVENTS
} from '../utils/Constants';
import { PoolManager } from '../utils/PoolManager';
import { SoundManager } from '../utils/SoundManager';

export interface PlayerConfig {
    id: number;
    characterId: CharacterType;
    isLocal: boolean;
    isAI?: boolean;
}

export class Player extends cc.Component {
    // 玩家ID
    public id: number = 0;
    
    // 角色类型
    public characterType: CharacterType = CharacterType.LI_DAYE;
    
    // 是否本地玩家
    public isLocal: boolean = false;
    
    // 是否AI
    public isAI: boolean = false;

    // 基础属性
    public health: number = 100;
    public maxHealth: number = 100;
    public shield: number = 0;
    public baseSpeed: number = 5;
    
    // 当前武器
    public currentWeapon: WeaponType = WeaponType.EGG;
    
    // 移动
    public moveSpeed: number = 5;
    public direction: Direction = Direction.NONE;
    public velocity: cc.Vec2 = cc.v2(0, 0);
    
    // 攻击冷却
    private attackCooldown: number = 0;
    private attackTimer: number = 0;
    
    // 技能
    private skillCharge: number = 0;
    private skillMaxCharge: number = 100;
    private skillCD: number = 0;
    private isCasting: boolean = false;
    
    // Buff列表
    private buffs: Buff[] = [];
    
    // 状态
    public isAlive: boolean = true;
    public isStunned: boolean = false;
    public isInvincible: boolean = false;
    
    // 动画状态
    private animState: string = 'idle';
    
    // 组件引用
    private sprite: cc.Sprite = null;
    private anim: cc.Animation = null;
    private healthBar: cc.Node = null;
    
    // 角色配置
    private config: CharacterConfig = null;
    
    // 移动目标 (AI用)
    private moveTarget: cc.Vec2 = null;

    onLoad() {
        // 获取组件
        this.sprite = this.getComponent(cc.Sprite);
        this.anim = this.getComponent(cc.Animation);
        
        // 创建血条
        this.createHealthBar();
    }

    /**
     * 初始化玩家
     */
    init(config: PlayerConfig) {
        this.id = config.id;
        this.characterType = config.characterId;
        this.isLocal = config.isLocal;
        this.isAI = config.isAI || false;
        
        // 获取角色配置
        this.config = CHARACTER_DATA[this.characterType];
        
        // 应用角色加成
        this.applyCharacterBonus();
        
        // 设置初始位置
        this.reset();
    }

    /**
     * 应用角色属性加成
     */
    private applyCharacterBonus() {
        if (!this.config) return;
        
        // 速度加成
        this.baseSpeed = GAME_CONFIG.BASE_SPEED * (1 + this.config.speedBonus);
        this.moveSpeed = this.baseSpeed;
        
        // 血量加成
        this.maxHealth = GAME_CONFIG.BASE_HEALTH;
        
        // 护盾加成
        if (this.config.shieldBonus > 0) {
            this.shield = this.maxHealth * this.config.shieldBonus;
        }
        
        // 技能冷却加成
        this.skillMaxCharge = 100;
    }

    /**
     * 重置玩家状态
     */
    reset() {
        this.health = this.maxHealth;
        this.direction = Direction.NONE;
        this.velocity = cc.v2(0, 0);
        this.attackTimer = 0;
        this.skillCharge = 0;
        this.skillCD = 0;
        this.buffs = [];
        this.isAlive = true;
        this.isStunned = false;
        this.isInvincible = false;
        
        this.updateHealthBar();
    }

    update(dt: number) {
        if (!this.isAlive) return;
        
        // 更新攻击冷却
        if (this.attackTimer > 0) {
            this.attackTimer -= dt;
        }
        
        // 更新技能充能
        this.updateSkillCharge(dt);
        
        // 更新Buff
        this.updateBuffs(dt);
        
        // AI行为
        if (this.isAI && this.isLocal === false) {
            this.updateAI(dt);
        }
        
        // 更新位置
        this.updatePosition(dt);
        
        // 更新动画
        this.updateAnimation();
    }

    // ==================== 移动控制 ====================

    /**
     * 设置移动方向
     */
    public setDirection(dir: Direction) {
        if (this.isStunned) return;
        this.direction = dir;
    }

    /**
     * 移动到目标位置 (AI用)
     */
    public moveTo(target: cc.Vec2) {
        this.moveTarget = target;
    }

    /**
     * 停止移动
     */
    public stopMove() {
        this.direction = Direction.NONE;
        this.moveTarget = null;
    }

    /**
     * 更新位置
     */
    private updatePosition(dt: number) {
        let targetVelocity = cc.v2(0, 0);
        
        if (this.moveTarget && this.isAI) {
            // AI移动到目标
            const dir = this.moveTarget.sub(this.node.position);
            const distance = dir.mag();
            
            if (distance > 10) {
                dir.normalize();
                targetVelocity = dir.mul(this.moveSpeed);
                
                // 面向移动方向
                this.direction = dir.x > 0 ? Direction.RIGHT : Direction.LEFT;
            } else {
                this.moveTarget = null;
            }
        } else if (this.direction !== Direction.NONE && !this.isStunned) {
            // 正常移动
            targetVelocity = cc.v2(this.direction * this.moveSpeed, 0);
        }
        
        // 应用减速效果
        const slowDebuff = this.getBuff(BuffType.SLOW);
        if (slowDebuff) {
            targetVelocity = targetVelocity.mul(1 - slowDebuff.value);
        }
        
        // 更新速度
        this.velocity = targetVelocity;
        
        // 更新位置
        const newPos = this.node.position.add(this.velocity.mul(dt));
        
        // 边界检测
        const margin = GAME_CONFIG.MAP_BOUNDARY_MARGIN;
        const halfWidth = GAME_CONFIG.MAP_WIDTH / 2;
        newPos.x = cc.misc.clampf(newPos.x, -halfWidth + margin, halfWidth - margin);
        
        this.node.setPosition(newPos);
        
        // 触发移动事件
        if (this.isLocal) {
            this.node.emit(GAME_EVENTS.PLAYER_MOVE, {
                playerId: this.id,
                position: this.node.position.clone(),
                direction: this.direction
            });
        }
    }

    // ==================== 攻击系统 ====================

    /**
     * 攻击
     */
    public attack() {
        if (!this.isAlive || this.isStunned) return;
        if (this.attackTimer > 0) return;
        
        // 检查沉默
        if (this.hasBuff(BuffType.SILENCE)) return;
        
        // 获取武器配置
        const weaponConfig = WEAPON_DATA[this.currentWeapon];
        if (!weaponConfig) return;
        
        // 设置冷却
        this.attackTimer = weaponConfig.cooldown;
        
        // 计算伤害
        let damage = weaponConfig.damage;
        
        // 应用角色伤害加成
        if (this.config && this.config.damageBonus > 0) {
            damage *= (1 + this.config.damageBonus);
        }
        
        // 触发攻击事件
        this.node.emit(GAME_EVENTS.PLAYER_ATTACK, {
            playerId: this.id,
            weaponType: this.currentWeapon,
            position: this.node.position.clone(),
            direction: this.direction,
            damage: damage
        });
        
        // 播放投掷音效
        if (SoundManager.getInstance()) {
            SoundManager.getInstance().playSFX('throw');
        }
    }

    /**
     * 受到伤害
     */
    public takeDamage(damage: number, sourceId: number, weaponType: WeaponType) {
        if (!this.isAlive) return;
        if (this.isInvincible) return;
        
        // 计算实际伤害
        let actualDamage = damage;
        
        // 护盾吸收
        if (this.shield > 0) {
            if (this.shield >= damage) {
                this.shield -= damage;
                actualDamage = 0;
            } else {
                actualDamage = damage - this.shield;
                this.shield = 0;
            }
        }
        
        // 减少生命
        this.health -= actualDamage;
        
        // 触发命中事件
        this.node.emit(GAME_EVENTS.PLAYER_HIT, {
            targetId: this.id,
            sourceId: sourceId,
            damage: actualDamage,
            weaponType: weaponType,
            position: this.node.position.clone()
        });
        
        // 更新血条
        this.updateHealthBar();
        
        // 检查死亡
        if (this.health <= 0) {
            this.health = 0;
            this.die(sourceId);
        }
        
        // 播放受伤音效
        if (SoundManager.getInstance()) {
            SoundManager.getInstance().playSFX('hit');
        }
        
        // 受伤动画
        this.playHitEffect();
    }

    /**
     * 治愈
     */
    public heal(amount: number) {
        if (!this.isAlive) return;
        
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    /**
     * 添加护盾
     */
    public addShield(amount: number) {
        this.shield += amount;
    }

    /**
     * 死亡
     */
    private die(killerId: number) {
        this.isAlive = false;
        
        // 触发死亡事件
        this.node.emit(GAME_EVENTS.PLAYER_DEATH, {
            playerId: this.id,
            killerId: killerId
        });
        
        // 播放死亡动画
        this.playDeathEffect();
        
        // 隐藏血条
        if (this.healthBar) {
            this.healthBar.active = false;
        }
    }

    // ==================== 技能系统 ====================

    /**
     * 使用技能
     */
    public useSkill() {
        if (!this.isAlive) return;
        if (this.isStunned) return;
        if (this.isCasting) return;
        if (this.skillCharge < this.skillMaxCharge) return;
        
        // 消耗充能
        this.skillCharge = 0;
        this.isCasting = true;
        
        // 获取技能配置
        const skillId = this.config?.skill;
        if (!skillId) return;
        
        // 执行技能效果
        this.executeSkill(skillId);
        
        // 重置施法状态
        this.scheduleOnce(() => {
            this.isCasting = false;
        }, 0.5);
        
        // 触发技能使用事件
        this.node.emit(GAME_EVENTS.SKILL_USE, {
            playerId: this.id,
            skillId: skillId
        });
    }

    /**
     * 执行技能效果
     */
    private executeSkill(skillId: number) {
        const Game = require('../Game').Game;
        
        switch (skillId) {
            case SkillType.SQUARE_DANCE:
                // 广场舞音波 - 全屏伤害
                this.castSquareDance();
                break;
            case SkillType.GOLD_BELL:
                // 金钟罩 - 无敌3秒
                this.castGoldBell();
                break;
            case SkillType.DASH:
                // 轮椅冲刺 - 位移+伤害
                this.castDash();
                break;
            case SkillType.EXTORT:
                // 集体讹人 - 敌人强制后退
                this.castExtort();
                break;
            case SkillType.PHOENIX:
                // 凤凰传奇 - 回复血量
                this.castPhoenix();
                break;
            case SkillType.RESCUE:
                // 呼叫急救 - 回复50%血量
                this.castRescue();
                break;
        }
    }

    private castSquareDance() {
        // 全屏伤害
        const game = Game.getInstance();
        if (game && game.enemy) {
            game.enemy.takeDamage(30, this.id, -1);
        }
        
        // 播放特效
        this.showSkillEffect('square_dance');
    }

    private castGoldBell() {
        // 无敌3秒
        this.addBuff(BuffType.INVINCIBLE, 3, 1);
        this.showSkillEffect('gold_bell');
    }

    private castDash() {
        // 位移冲刺
        const dashDir = this.direction === Direction.RIGHT ? 1 : -1;
        const dashTarget = this.node.position.add(cc.v2(dashDir * 200, 0));
        
        const tween = cc.tween(this.node)
            .to(0.3, { position: dashTarget }, { easing: 'sineOut' })
            .call(() => {
                // 冲刺伤害
                const game = Game.getInstance();
                if (game && game.enemy) {
                    const distance = cc.Vec2.distance(this.node.position, game.enemy.node.position);
                    if (distance < 100) {
                        game.enemy.takeDamage(25, this.id, -1);
                    }
                }
            })
            .start();
        
        this.showSkillEffect('dash');
    }

    private castExtort() {
        // 强制敌人后退
        const game = Game.getInstance();
        if (game && game.enemy && game.enemy.isAlive) {
            const pushDir = game.enemy.node.position.sub(this.node.position).normalize();
            const pushTarget = game.enemy.node.position.add(pushDir.mul(150));
            pushTarget.x = cc.misc.clampf(pushTarget.x, -GAME_CONFIG.MAP_WIDTH/2 + 50, GAME_CONFIG.MAP_WIDTH/2 - 50);
            
            cc.tween(game.enemy.node)
                .to(0.5, { position: pushTarget }, { easing: 'sineOut' })
                .start();
        }
        
        this.showSkillEffect('extort');
    }

    private castPhoenix() {
        // 回复血量
        this.heal(this.maxHealth * 0.3);
        this.showSkillEffect('phoenix');
    }

    private castRescue() {
        // 回复50%血量
        this.heal(this.maxHealth * 0.5);
        this.showSkillEffect('rescue');
    }

    /**
     * 技能充能
     */
    private updateSkillCharge(dt: number) {
        if (this.skillCharge >= this.skillMaxCharge) return;
        
        // 基础充能速度
        let chargeRate = 10; // 每秒10%
        
        // 应用角色加成
        if (this.config && this.config.skillCDBonus < 0) {
            chargeRate *= (1 - this.config.skillCDBonus);
        }
        
        this.skillCharge = Math.min(this.skillMaxCharge, this.skillCharge + chargeRate * dt);
    }

    /**
     * 检查是否可以释放技能
     */
    public get canUseSkill(): boolean {
        return this.isAlive && 
               this.skillCharge >= this.skillMaxCharge && 
               !this.isCasting && 
               !this.isStunned;
    }

    /**
     * 获取技能充能进度
     */
    public getSkillProgress(): number {
        return this.skillCharge / this.skillMaxCharge;
    }

    // ==================== Buff系统 ====================

    /**
     * 添加Buff
     */
    public addBuff(type: BuffType, duration: number, value: number = 0) {
        // 检查是否已有同类Buff
        const existing = this.buffs.find(b => b.type === type);
        if (existing) {
            existing.remainingTime = duration;
            existing.value = value;
        } else {
            this.buffs.push({
                type: type,
                remainingTime: duration,
                value: value
            });
        }
    }

    /**
     * 获取Buff
     */
    public getBuff(type: BuffType): Buff | null {
        return this.buffs.find(b => b.type === type) || null;
    }

    /**
     * 是否有某种Buff
     */
    public hasBuff(type: BuffType): boolean {
        return this.buffs.some(b => b.type === type);
    }

    /**
     * 移除Buff
     */
    public removeBuff(type: BuffType) {
        const index = this.buffs.findIndex(b => b.type === type);
        if (index >= 0) {
            this.buffs.splice(index, 1);
        }
    }

    /**
     * 更新Buff
     */
    private updateBuffs(dt: number) {
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            const buff = this.buffs[i];
            buff.remainingTime -= dt;
            
            if (buff.remainingTime <= 0) {
                this.buffs.splice(i, 1);
            }
        }
        
        // 检查眩晕状态
        this.isStunned = this.hasBuff(BuffType.STUN);
        
        // 检查无敌状态
        this.isInvincible = this.hasBuff(BuffType.INVINCIBLE);
    }

    // ==================== 网络同步 ====================

    /**
     * 设置网络同步状态
     */
    public setNetworkState(data: any) {
        if (!this.isLocal) {
            // 更新位置 (插值)
            const targetPos = cc.v2(data.x, data.y);
            this.node.setPosition(targetPos);
            
            // 更新状态
            this.health = data.health;
            this.updateHealthBar();
        }
    }

    // ==================== AI行为 ====================

    private updateAI(dt: number) {
        if (!this.isAlive) return;
        
        const Game = require('../Game').Game;
        const player = Game.getInstance()?.player;
        
        if (!player) return;
        
        // 计算与玩家的距离
        const distance = cc.Vec2.distance(this.node.position, player.node.position);
        
        // 决策
        if (distance > 300) {
            // 远离 - 接近玩家
            this.moveTo(player.node.position);
        } else if (distance > 150) {
            // 中距离 - 边移动边攻击
            if (Math.random() < 0.02) {
                this.attack();
            }
            if (Math.random() < 0.3) {
                const offset = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
                this.moveTo(cc.v2(player.node.position.x + offset.x, 0));
            }
        } else {
            // 近距离 - 持续攻击
            if (Math.random() < 0.05) {
                this.attack();
            }
            
            // 使用技能
            if (this.canUseSkill && Math.random() < 0.01) {
                this.useSkill();
            }
        }
    }

    // ==================== 视觉效果 ====================

    private createHealthBar() {
        this.healthBar = new cc.Node('HealthBar');
        this.healthBar.parent = this.node;
        this.healthBar.setPosition(0, 50);
        
        // 背景
        const bg = new cc.Node('Bg');
        bg.parent = this.healthBar;
        bg.addComponent(cc.Sprite);
        bg.setContentSize(80, 8);
        bg.setPosition(0, 0);
        
        // 血条
        const bar = new cc.Node('Bar');
        bar.parent = this.healthBar;
        bar.addComponent(cc.Sprite);
        bar.setContentSize(76, 4);
        bar.setPosition(-2, 0);
        bar.color = cc.Color.GREEN;
    }

    private updateHealthBar() {
        const bar = this.healthBar?.getChildByName('Bar')?.getComponent(cc.Sprite);
        if (bar) {
            const ratio = this.health / this.maxHealth;
            bar.node.setContentSize(76 * ratio, 4);
            
            // 颜色变化
            if (ratio > 0.6) {
                bar.node.color = cc.Color.GREEN;
            } else if (ratio > 0.3) {
                bar.node.color = cc.Color.YELLOW;
            } else {
                bar.node.color = cc.Color.RED;
            }
        }
    }

    private playHitEffect() {
        // 闪烁效果
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            sprite.node.color = cc.Color.RED;
            this.scheduleOnce(() => {
                sprite.node.color = cc.Color.WHITE;
            }, 0.1);
        }
        
        // 屏幕震动
        cc.tween(this.node)
            .by(0.05, { position: cc.v2(-5, 0) })
            .by(0.05, { position: cc.v2(10, 0) })
            .by(0.05, { position: cc.v2(-5, 0) })
            .start();
    }

    private playDeathEffect() {
        // 淡出动画
        cc.tween(this.node)
            .to(0.5, { opacity: 0 })
            .start();
        
        // 旋转
        cc.tween(this.node)
            .by(0.5, { angle: 180 })
            .start();
    }

    private showSkillEffect(effectName: string) {
        // 创建特效节点
        const effect = new cc.Node(effectName);
        effect.parent = this.node;
        effect.setPosition(0, 0);
        
        // 播放动画后销毁
        this.scheduleOnce(() => {
            effect.destroy();
        }, 1.0);
    }

    private updateAnimation() {
        // 根据移动状态更新动画
        const isMoving = this.velocity.mag() > 0;
        
        if (isMoving && this.animState !== 'move') {
            this.animState = 'move';
            // 播放移动动画
        } else if (!isMoving && this.animState !== 'idle') {
            this.animState = 'idle';
            // 播放待机动画
        }
    }

    // ==================== 公开方法 ====================

    /**
     * 获取当前状态信息
     */
    public getStatus(): PlayerData {
        return {
            id: this.id,
            characterType: this.characterType,
            position: { x: this.node.position.x, y: this.node.position.y },
            health: this.health,
            maxHealth: this.maxHealth,
            shield: this.shield,
            direction: this.direction,
            isAlive: this.isAlive,
            buffs: this.buffs,
            weapon: this.currentWeapon,
            skillCharge: this.skillCharge,
            skillMaxCharge: this.skillMaxCharge
        };
    }
}

// 导入需要的枚举
import { SkillType, GAME_CONFIG } from '../utils/Constants';
import { Game } from '../Game';