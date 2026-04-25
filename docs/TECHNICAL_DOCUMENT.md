# 技术架构文档 v1.0

---

## 1. 技术选型

### 1.1 游戏引擎
**Cocos Creator 3.x** (首选)
- 官方微信小游戏支持完善
- 3D/2D 混合支持
- 高性能渲染
- 成熟的生态系统

**备选: LayaAir 2.x**
- 国内团队开发，文档中文友好
- 适配微信小程序

### 1.2 后端技术
- **微信云开发** (首选): 免费额度，弹性扩容，无需服务器维护
- **Node.js + MySQL** (备选): 适合高并发场景

### 1.3 实时通信
- **微信云开发实时推送**: 适合多人匹配
- **WebSocket**: 适合1v1实时对战

---

## 2. 项目结构

```
wheelchair_wars/
├── miniprogram/                    # 微信小程序代码
│   ├── app.js                      # 入口
│   ├── app.json                    # 全局配置
│   ├── app.wxss                    # 全局样式
│   ├── pages/                      # 页面
│   │   ├── index/                  # 首页/加载
│   │   ├── home/                   # 主界面
│   │   ├── game/                   # 游戏场景
│   │   ├── result/                 # 结算界面
│   │   ├── character/              # 角色选择
│   │   └── shop/                   # 商城
│   ├── components/                 # 通用组件
│   └── utils/                      # 工具函数
│
├── game/                          # Cocos 游戏项目
│   ├── assets/
│   │   ├── scenes/                 # 场景文件
│   │   ├── prefabs/               # 预制体
│   │   ├── scripts/               # 脚本
│   │   └── resources/              # 资源
│   │       ├── images/            # 图片资源
│   │       ├── audio/             # 音频资源
│   │       └── data/              # 配置数据
│   ├── build/                      # 构建输出
│   └── settings/                   # 构建配置
│
├── docs/                           # 文档
│   ├── GAME_DESIGN_DOCUMENT.md    # 游戏设计
│   ├── TECHNICAL_DOCUMENT.md      # 本文档
│   ├── ART_REQUIREMENTS.md        # 美术需求
│   └── API_DOCUMENT.md            # 接口文档
│
└── tools/                          # 工具脚本
    └── build.py                    # 构建脚本
```

---

## 3. Cocos Creator 项目结构 (src/)

```
src/
├── main.ts                         # 游戏入口
├── Game.ts                         # 游戏主控制器
│
├── scenes/                         # 场景
│   ├── BootScene.ts               # 加载场景
│   ├── HomeScene.ts               # 主界面场景
│   ├── BattleScene.ts             # 战斗场景
│   └── ResultScene.ts             # 结算场景
│
├── components/                     # 游戏组件
│   ├── Player.ts                  # 玩家控制
│   ├── Enemy.ts                   # 敌人AI
│   ├── Weapon.ts                  # 武器组件
│   ├── Projectile.ts              # 投射物
│   ├── HealthBar.ts               # 血条
│   ├── BuffSystem.ts              # Buff系统
│   └── Map.ts                     # 地图控制
│
├── ui/                            # UI组件
│   ├── MainMenu.ts                # 主菜单
│   ├── Joystick.ts                # 虚拟摇杆
│   ├── AttackButton.ts            # 攻击按钮
│   ├── PauseMenu.ts               # 暂停菜单
│   └── HUD.ts                     # HUD界面
│
├── utils/                         # 工具类
│   ├── Constants.ts               # 常量定义
│   ├── Config.ts                  # 配置
│   ├── PoolManager.ts             # 对象池管理
│   ├── SoundManager.ts            # 音效管理
│   ├── DataManager.ts             # 数据管理
│   └── Utils.ts                   # 通用工具
│
├── data/                          # 数据
│   ├── CharacterData.ts           # 角色数据
│   ├── WeaponData.ts              # 武器数据
│   ├── MapData.ts                 # 地图数据
│   └── GameConfig.ts              # 游戏配置
│
└── network/                       # 网络
    ├── NetworkManager.ts          # 网络管理
    ├── MatchManager.ts            # 匹配管理
    └── SyncManager.ts             # 同步管理
```

---

## 4. 核心类设计

### 4.1 常量定义 (Constants.ts)

```typescript
// 武器枚举
export enum WeaponType {
    EGG = 1,           // 普通鸡蛋
    IRON_EGG = 2,      // 铁蛋蛋
    CRUTCH = 3,        // 拐杖
    MEDICINE = 4,      // 药罐子
    FALSE_TEETH = 5,   // 假牙飞弹
    BISCUIT = 6,       // 老年糕
    STETHOSCOPE = 7,   // 听诊器
    SHOPPING_CART = 8  // 购物车
}

// 角色枚举
export enum CharacterType {
    LI_DAYE = 1,       // 李大爷 - 广场舞之王
    WANG_DAMA = 2,     // 王大妈 - 买菜砍价王
    ZHANG_YEYE = 3,    // 张爷爷 - 养生专家
    ZHAO_NAINAI = 4,   // 赵奶奶 - 暴走团长
    LAO_LIU = 5,       // 老刘头 - 象棋大师
    SUN_LAOTAI = 6     // 孙老太太 - 织毛衣高手
}

// 游戏状态
export enum GameState {
    MENU = 0,          // 菜单
    LOADING = 1,       // 加载
    READY = 2,         // 准备
    PLAYING = 3,       // 游戏中
    PAUSED = 4,        // 暂停
    RESULT = 5         // 结算
}

// 移动方向
export enum Direction {
    LEFT = -1,
    RIGHT = 1,
    NONE = 0
}
```

### 4.2 武器数据配置

| 武器ID | 名称 | 伤害 | 冷却(s) | 速度 | 特效 | 弹道 |
|--------|------|------|---------|------|------|------|
| 1 | 普通鸡蛋 | 5 | 0.5 | 8 | 溅射(小) | 直线 |
| 2 | 铁蛋蛋 | 15 | 2 | 10 | 穿透护盾 | 直线 |
| 3 | 拐杖投掷 | 20 | 3 | 6 | 击退 | 弧线 |
| 4 | 药罐子 | 10 | 1 | 7 | 减速30% | 直线 |
| 5 | 假牙飞弹 | 25 | 4 | 5 | 追踪 | 追踪 |
| 6 | 老年糕 | 8 | 1 | 9 | 眩晕 | 范围 |
| 7 | 听诊器 | 15 | 2 | 8 | 禁锢1s | 直线 |
| 8 | 购物车 | 40 | 8 | 4 | 全屏AOE | 全屏 |

### 4.3 角色属性配置

| 角色ID | 名称 | 移速加成 | 伤害加成 | 大招CD | 初始血量 | 初始护盾 |
|--------|------|---------|---------|--------|---------|---------|
| 1 | 李大爷 | +10% | 0% | 0% | 100 | 0 |
| 2 | 王大妈 | 0% | +15% | 0% | 100 | 0 |
| 3 | 张爷爷 | 0% | 0% | -20% | 100 | 0 |
| 4 | 赵奶奶 | 0% | 0% | 0% | 100 | +20% |
| 5 | 老刘头 | 0% | 0% | 0% | 100 | 0 |
| 6 | 孙老太太 | +5% | 0% | 0% | 100 | 0 |

---

## 5. 网络架构

### 5.1 实时对战流程

```
玩家A                    服务器                   玩家B
  │                         │                       │
  │──── 发起匹配 ──────────>│                       │
  │                         │<───── 发起匹配 ──────│
  │                         │                       │
  │<──── 匹配成功 ──────────│                       │
  │    (房间号+对手信息)     │                       │
  │                         │──── 匹配成功 ───────>│
  │                         │                       │
  │──── 游戏开始 ─────────>│<──── 游戏开始 ───────│
  │    (随机数种子)         │     (随机数种子)      │
  │                         │                       │
  │──── 移动数据 ─────────>│                       │
  │ (位置+方向+时间戳)      │                       │
  │                         │<──── 移动数据 ───────│
  │                         │                       │
  │──── 攻击数据 ─────────>│                       │
  │ (武器+位置+方向+时间戳) │                       │
  │                         │<──── 攻击数据 ───────│
  │                         │                       │
  │<──── 同步数据 ──────────│                       │
  │  (双方位置+状态)        │                       │
  │                         │                       │
  │                         │                       │
  │                         │<──── 战斗结束 ──────│
  │<──── 战斗结束 ──────────│                       │
  │    (结算+奖励)          │                       │
  │                         │──── 结算 ──────────>│
```

### 5.2 帧同步方案

- **固定帧率**: 30 FPS
- **输入延迟容忍**: 3帧 (100ms)
- **断线重连**: 保存最近30帧状态
- **反外挂**: 客户端预测 + 服务器校验

### 5.3 消息协议

| 消息类型 | 格式 | 说明 |
|----------|------|------|
| C2S_MOVE | {x, y, dir, timestamp} | 移动信息 |
| C2S_ATTACK | {weaponId, x, y, dir, timestamp} | 攻击信息 |
| C2S_USE_SKILL | {skillId, timestamp} | 技能使用 |
| S2C_SYNC | {players: [...]} | 状态同步 |
| S2C_HIT | {targetId, damage} | 命中判定 |
| S2C_END | {winner, rewards} | 游戏结束 |

---

## 6. 性能优化策略

### 6.1 渲染优化
- 使用对象池，避免频繁创建销毁
- 批量绘制相同材质节点
- 合理使用 Camera Culling
- 限制同屏投射物数量 (最多20个)

### 6.2 内存优化
- 延迟加载非核心资源
- 及时释放不在使用的纹理
- 使用 Atlas 图集，减少 DrawCall
- 控制音频文件大小 (<100KB)

### 6.3 网络优化
- 合并小数据包
- 使用增量更新
- 合理使用压缩
- 本地预测减少等待

### 6.4 包体优化
- 使用分包，按需加载
- 图片使用 WebP 格式
- 图集合并减少请求
- 代码混淆压缩

---

## 7. 微信小程序适配

### 7.1 适配要点
- 触摸区域至少 44x44 px
- 使用虚拟摇杆替代物理键盘
- 合理使用屏幕空间
- 支持不同屏幕比例

### 7.2 性能限制
- 内存限制: 200MB
- 代码包限制: 主包4MB + 分包8MB
- 帧率: 最高60FPS
- 加载时间: 首屏<3秒

### 7.3 适配方案

```typescript
// 屏幕适配
const designWidth = 750;
const designHeight = 1334;

function adaptScreen() {
    const screenWidth = wx.getSystemInfoSync().screenWidth;
    const screenHeight = wx.getSystemInfoSync().screenHeight;
    
    const scaleX = screenWidth / designWidth;
    const scaleY = screenHeight / designHeight;
    
    // 设置 Canvas 适配
    game.setFrameSize(screenWidth, screenHeight);
}
```

### 7.4 分包策略

| 分包 | 大小限制 | 内容 |
|------|---------|------|
| 主包 | 4MB | 核心玩法、首页、角色选择 |
| 地图分包 | 2MB | 4张地图资源 |
| 皮肤分包 | 3MB | 角色皮肤资源 |
| 音效分包 | 3MB | 背景音乐、音效 |

---

## 8. 数据存储

### 8.1 本地存储
- 用户设置 (音效、音量、操作偏好)
- 缓存数据 (减少网络请求)
- 离线数据 (断线重连)

### 8.2 云端存储
- 用户信息 (微信登录)
- 角色数据 (解锁、等级)
- 战绩记录 (胜率、段位)
- 排行榜数据

### 8.3 存储结构

```javascript
// 本地存储 Key
const STORAGE_KEY = {
    USER_DATA: 'ww_user_data',
    SETTINGS: 'ww_settings',
    GAME_RECORD: 'ww_game_record',
    CACHE: 'ww_cache'
};

// 云端数据结构
const USER_SCHEMA = {
    openid: String,
    nickname: String,
    avatar: String,
    characters: [{
        id: Number,
        level: Number,
        skin: Number
    }],
    weapons: [{
        id: Number,
        level: Number,
        count: Number
    }],
    rank: {
        score: Number,
        level: Number,
        star: Number
    },
    stats: {
        total_games: Number,
        wins: Number,
        kill: Number,
        death: Number
    }
};
```

---

## 9. 安全方案

### 9.1 反作弊措施
- 服务器校验所有操作
- 关键逻辑服务器执行
- 异常行为检测
- 数据加密传输

### 9.2 防护策略
- 请求签名验证
- 频率限制
- 异常 IP 封禁
- 举报机制

### 9.3 敏感信息
- 不存储用户敏感信息
- 微信登录自动获取
- 加密存储本地数据

---

## 10. 运营支持

### 10.1 数据埋点

| 事件 | 触发时机 | 参数 |
|------|---------|------|
| game_start | 开始游戏 | mode, mapId |
| game_end | 结束游戏 | result, duration, kill |
| weapon_use | 使用武器 | weaponId, hit |
| skill_use | 使用技能 | skillId |
| item_collect | 拾取道具 | itemId |
| purchase | 购买 | itemId, price |
| share | 分享 | type, success |

### 10.2 监控指标
- DAU/MAU
- 留存率
- 付费率
- ARPU
- 对局时长
- 崩溃率

### 10.3 运营活动
- 签到奖励
- 节日活动
- 排行榜奖励
- 新手礼包

---

## 11. 开发规范

### 11.1 代码规范
- 使用 TypeScript
- 组件化开发
- 统一命名规范
- 注释完整

### 11.2 命名规范
```
类名: PascalCase (如: PlayerController)
函数名: camelCase (如: onAttack)
变量名: camelCase (如: moveSpeed)
常量名: UPPER_SNAKE_CASE (如: MAX_HEALTH)
枚举名: PascalCase (如: WeaponType)
枚举值: UPPER_SNAKE_CASE (如: EGG)
```

### 11.3 Git 规范
- 分支: feature/xxx, fix/xxx, release/xxx
- 提交: type(scope): message
- 合并: Pull Request + Code Review

### 11.4 资源规范
- 图片格式: WebP (优先), PNG (备选)
- 音频格式: MP3, 采样率 44.1kHz
- 命名: 资源类型_名称_序号 (如: char_li_01.png)
- 尺寸: 必须是 2 的幂次方

---

## 12. 测试计划

### 12.1 测试类型
- 单元测试: 核心逻辑
- 集成测试: 模块交互
- 功能测试: 完整流程
- 性能测试: 帧率、内存
- 适配测试: 不同机型

### 12.2 测试用例
| 模块 | 用例数 | 优先级 |
|------|--------|--------|
| 战斗系统 | 50 | 高 |
| 道具系统 | 30 | 高 |
| UI交互 | 40 | 中 |
| 网络对战 | 30 | 高 |
| 性能 | 20 | 中 |

---

**文档版本**: v1.0
**创建日期**: 2024年
**最后更新**: 待定
**文档状态**: 初稿