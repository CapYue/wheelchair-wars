/**
 * 常量定义
 * 轮椅大作战 - 全局常量与枚举
 */

// ==================== 武器类型 ====================
export enum WeaponType {
    EGG = 1,           // 普通鸡蛋
    IRON_EGG = 2,      // 铁蛋蛋
    CRUTCH = 3,        // 拐杖投掷
    MEDICINE = 4,      // 药罐子
    FALSE_TEETH = 5,   // 假牙飞弹
    BISCUIT = 6,       // 老年糕
    STETHOSCOPE = 7,   // 听诊器
    SHOPPING_CART = 8  // 购物车
}

// ==================== 武器名称 ====================
export const WeaponNames: Record<WeaponType, string> = {
    [WeaponType.EGG]: '普通鸡蛋',
    [WeaponType.IRON_EGG]: '铁蛋蛋',
    [WeaponType.CRUTCH]: '拐杖投掷',
    [WeaponType.MEDICINE]: '药罐子',
    [WeaponType.FALSE_TEETH]: '假牙飞弹',
    [WeaponType.BISCUIT]: '老年糕',
    [WeaponType.STELTHOSCOPE]: '听诊器',
    [WeaponType.SHOPPING_CART]: '购物车'
};

// ==================== 角色类型 ====================
export enum CharacterType {
    LI_DAYE = 1,       // 李大爷 - 广场舞之王
    WANG_DAMA = 2,     // 王大妈 - 买菜砍价王
    ZHANG_YEYE = 3,    // 张爷爷 - 养生专家
    ZHAO_NAINAI = 4,   // 赵奶奶 - 暴走团长
    LAO_LIU = 5,       // 老刘头 - 象棋大师
    SUN_LAOTAI = 6     // 孙老太太 - 织毛衣高手
}

// ==================== 角色名称 ====================
export const CharacterNames: Record<CharacterType, string> = {
    [CharacterType.LI_DAYE]: '李大爷',
    [CharacterType.WANG_DAMA]: '王大妈',
    [CharacterType.ZHANG_YEYE]: '张爷爷',
    [CharacterType.ZHAO_NAINAI]: '赵奶奶',
    [CharacterType.LAO_LIU]: '老刘头',
    [CharacterType.SUN_LAOTAI]: '孙老太太'
};

// ==================== 游戏状态 ====================
export enum GameState {
    MENU = 0,          // 菜单
    LOADING = 1,       // 加载
    READY = 2,         // 准备
    PLAYING = 3,       // 游戏中
    PAUSED = 4,        // 暂停
    RESULT = 5         // 结算
}

// ==================== 方向 ====================
export enum Direction {
    LEFT = -1,
    RIGHT = 1,
    NONE = 0
}

// ==================== Buff类型 ====================
export enum BuffType {
    SLOW = 1,          // 减速
    STUN = 2,          // 眩晕
    SILENCE = 3,       // 沉默
    SHIELD = 4,        // 护盾
    INVINCIBLE = 5,    // 无敌
    POISON = 6         // 中毒
}

// ==================== 大招类型 ====================
export enum SkillType {
    SQUARE_DANCE = 1,  // 广场舞音波
    GOLD_BELL = 2,     // 金钟罩
    DASH = 3,          // 轮椅冲刺
    EXTORT = 4,        // 集体讹人
    PHOENIX = 5,       // 凤凰传奇
    RESCUE = 6         // 呼叫急救
}

// ==================== 大招名称 ====================
export const SkillNames: Record<SkillType, string> = {
    [SkillType.SQUARE_DANCE]: '广场舞音波',
    [SkillType.GOLD_BELL]: '金钟罩',
    [SkillType.DASH]: '轮椅冲刺',
    [SkillType.EXTORT]: '集体讹人',
    [SkillType.PHOENIX]: '凤凰传奇',
    [SkillType.RESCUE]: '呼叫急救'
};

// ==================== 游戏配置 ====================
export const GAME_CONFIG = {
    // 基础数值
    BASE_HEALTH: 100,
    BASE_SPEED: 5,
    BASE_DAMAGE: 10,
    BASE_ATTACK_SPEED: 1,

    // 战斗数值
    MAX_PROJECTILES: 20,           // 最大同屏投射物
    PROJECTILE_POOL_SIZE: 30,      // 投射物对象池大小
    HIT_FEEDBACK_TIME: 0.1,        // 命中反馈时间

    // 时间配置
    MATCH_DURATION: 180,           // 对战时长(秒)
    LOADING_TIMEOUT: 30,           // 加载超时
    RECONNECT_TIME: 30,            // 重连时间

    // 网络配置
    SYNC_INTERVAL: 33,             // 同步间隔(ms) 约30FPS
    INPUT_DELAY_TOLERANCE: 100,    // 输入延迟容忍(ms)

    // UI配置
    JOYSTICK_SIZE: 120,            // 摇杆大小
    ATTACK_BUTTON_SIZE: 80,        // 攻击按钮大小

    // 地图尺寸
    MAP_WIDTH: 960,
    MAP_HEIGHT: 640,
    MAP_BOUNDARY_MARGIN: 50        // 边界留白
};

// ==================== 武器数据 ====================
export const WEAPON_DATA: Record<WeaponType, WeaponConfig> = {
    [WeaponType.EGG]: {
        id: WeaponType.EGG,
        name: '普通鸡蛋',
        damage: 5,
        cooldown: 0.5,
        speed: 8,
        range: 500,
        splashRadius: 30,
        effect: 'splash'
    },
    [WeaponType.IRON_EGG]: {
        id: WeaponType.IRON_EGG,
        name: '铁蛋蛋',
        damage: 15,
        cooldown: 2,
        speed: 10,
        range: 600,
        splashRadius: 0,
        effect: 'pierce'
    },
    [WeaponType.CRUTCH]: {
        id: WeaponType.CRUTCH,
        name: '拐杖投掷',
        damage: 20,
        cooldown: 3,
        speed: 6,
        range: 400,
        splashRadius: 0,
        effect: 'knockback',
        knockbackForce: 100
    },
    [WeaponType.MEDICINE]: {
        id: WeaponType.MEDICINE,
        name: '药罐子',
        damage: 10,
        cooldown: 1,
        speed: 7,
        range: 450,
        splashRadius: 20,
        effect: 'slow',
        slowDuration: 2,
        slowRate: 0.3
    },
    [WeaponType.FALSE_TEETH]: {
        id: WeaponType.FALSE_TEETH,
        name: '假牙飞弹',
        damage: 25,
        cooldown: 4,
        speed: 5,
        range: 400,
        splashRadius: 0,
        effect: 'tracking',
        trackingStrength: 0.05
    },
    [WeaponType.BISCUIT]: {
        id: WeaponType.BISCUIT,
        name: '老年糕',
        damage: 8,
        cooldown: 1,
        speed: 9,
        range: 300,
        splashRadius: 60,
        effect: 'stun',
        stunDuration: 1
    },
    [WeaponType.STELTHOSCOPE]: {
        id: WeaponType.STELTHOSCOPE,
        name: '听诊器',
        damage: 15,
        cooldown: 2,
        speed: 8,
        range: 550,
        splashRadius: 0,
        effect: 'silence',
        silenceDuration: 1
    },
    [WeaponType.SHOPPING_CART]: {
        id: WeaponType.SHOPPING_CART,
        name: '购物车',
        damage: 40,
        cooldown: 8,
        speed: 4,
        range: 0,
        splashRadius: 200,
        effect: 'aoe'
    }
};

// ==================== 角色数据 ====================
export const CHARACTER_DATA: Record<CharacterType, CharacterConfig> = {
    [CharacterType.LI_DAYE]: {
        id: CharacterType.LI_DAYE,
        name: '李大爷',
        title: '广场舞之王',
        speedBonus: 0.1,
        damageBonus: 0,
        skillCDBonus: 0,
        shieldBonus: 0,
        skill: SkillType.SQUARE_DANCE,
        icon: 'char_li_01',
        color: '#FFD700'
    },
    [CharacterType.WANG_DAMA]: {
        id: CharacterType.WANG_DAMA,
        name: '王大妈',
        title: '买菜砍价王',
        speedBonus: 0,
        damageBonus: 0.15,
        skillCDBonus: 0,
        shieldBonus: 0,
        skill: SkillType.GOLD_BELL,
        icon: 'char_wang_01',
        color: '#FF69B4'
    },
    [CharacterType.ZHANG_YEYE]: {
        id: CharacterType.ZHANG_YEYE,
        name: '张爷爷',
        title: '养生专家',
        speedBonus: 0,
        damageBonus: 0,
        skillCDBonus: -0.2,
        shieldBonus: 0,
        skill: SkillType.DASH,
        icon: 'char_zhang_01',
        color: '#90EE90'
    },
    [CharacterType.ZHAO_NAINAI]: {
        id: CharacterType.ZHAO_NAINAI,
        name: '赵奶奶',
        title: '暴走团长',
        speedBonus: 0,
        damageBonus: 0,
        skillCDBonus: 0,
        shieldBonus: 0.2,
        skill: SkillType.EXTORT,
        icon: 'char_zhao_01',
        color: '#FF4500'
    },
    [CharacterType.LAO_LIU]: {
        id: CharacterType.LAO_LIU,
        name: '老刘头',
        title: '象棋大师',
        speedBonus: 0,
        damageBonus: 0,
        skillCDBonus: 0,
        shieldBonus: 0,
        critRate: 0.25,
        skill: SkillType.PHOENIX,
        icon: 'char_liu_01',
        color: '#4169E1'
    },
    [CharacterType.SUN_LAOTAI]: {
        id: CharacterType.SUN_LAOTAI,
        name: '孙老太太',
        title: '织毛衣高手',
        speedBonus: 0.05,
        damageBonus: 0,
        skillCDBonus: 0,
        shieldBonus: 0,
        attackSpeedBonus: 0.2,
        skill: SkillType.RESCUE,
        icon: 'char_sun_01',
        color: '#9370DB'
    }
};

// ==================== Buff持续时间 ====================
export const BUFF_DURATION: Record<BuffType, number> = {
    [BuffType.SLOW]: 2,
    [BuffType.STUN]: 1,
    [BuffType.SILENCE]: 1,
    [BuffType.SHIELD]: 3,
    [BuffType.INVINCIBLE]: 3,
    [BuffType.POISON]: 3
};

// ==================== 音效定义 ====================
export const SOUND_EFFECTS = {
    // 投掷
    THROW: 'sfx_throw',
    
    // 命中
    HIT_LIGHT: 'sfx_hit_light',
    HIT_HEAVY: 'sfx_hit_heavy',
    
    // 移动
    WHEEL_ROLL: 'sfx_wheel_roll',
    
    // 技能
    SKILL_CHARGE: 'sfx_skill_charge',
    SKILL_USE: 'sfx_skill_use',
    
    // UI
    UI_CLICK: 'sfx_ui_click',
    UI_POPUP: 'sfx_ui_popup',
    
    // 游戏
    GAME_START: 'bgm_game_start',
    GAME_OVER_WIN: 'bgm_win',
    GAME_OVER_LOSE: 'bgm_lose'
};

// ==================== 存储Key ====================
export const STORAGE_KEY = {
    USER_DATA: 'ww_user_data',
    SETTINGS: 'ww_settings',
    GAME_RECORD: 'ww_game_record',
    CACHE: 'ww_cache',
    LAST_LOGIN: 'ww_last_login',
    TOTAL_PLAY_TIME: 'ww_total_play_time'
};

// ==================== 通知事件 ====================
export const GAME_EVENTS = {
    // 角色事件
    PLAYER_MOVE: 'player_move',
    PLAYER_ATTACK: 'player_attack',
    PLAYER_HIT: 'player_hit',
    PLAYER_DEATH: 'player_death',
    PLAYER_RESPAWN: 'player_respawn',
    
    // 游戏事件
    GAME_START: 'game_start',
    GAME_PAUSE: 'game_pause',
    GAME_RESUME: 'game_resume',
    GAME_END: 'game_end',
    GAME_COUNTDOWN: 'game_countdown',
    
    // UI事件
    UI_UPDATE_HEALTH: 'ui_update_health',
    UI_UPDATE_SKILL: 'ui_update_skill',
    UI_SHOW_DAMAGE: 'ui_show_damage',
    UI_SHOW_BUFF: 'ui_show_buff',
    
    // 网络事件
    NET_SYNC: 'net_sync',
    NET_DISCONNECT: 'net_disconnect',
    NET_RECONNECT: 'net_reconnect',
    
    // 道具事件
    ITEM_SPAWN: 'item_spawn',
    ITEM_COLLECT: 'item_collect'
};

// ==================== 接口 ====================
export interface WeaponConfig {
    id: WeaponType;
    name: string;
    damage: number;
    cooldown: number;
    speed: number;
    range: number;
    splashRadius: number;
    effect: string;
    knockbackForce?: number;
    slowDuration?: number;
    slowRate?: number;
    trackingStrength?: number;
    stunDuration?: number;
    silenceDuration?: number;
}

export interface CharacterConfig {
    id: CharacterType;
    name: string;
    title: string;
    speedBonus: number;
    damageBonus: number;
    skillCDBonus: number;
    shieldBonus: number;
    critRate?: number;
    attackSpeedBonus?: number;
    skill: SkillType;
    icon: string;
    color: string;
}

export interface PlayerData {
    id: number;
    characterType: CharacterType;
    position: { x: number; y: number };
    health: number;
    maxHealth: number;
    shield: number;
    direction: Direction;
    isAlive: boolean;
    buffs: Buff[];
    weapon: WeaponType;
    skillCharge: number;
    skillMaxCharge: number;
}

export interface Buff {
    type: BuffType;
    remainingTime: number;
    value: number;
}

export interface ProjectileData {
    id: number;
    type: WeaponType;
    ownerId: number;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    damage: number;
    effect: string;
    startTime: number;
}

export interface MatchResult {
    winner: number;
    myHealth: number;
    enemyHealth: number;
    myDamage: number;
    myKill: number;
    myDeath: number;
    duration: number;
    rewards: {
        gold: number;
        exp: number;
    };
}