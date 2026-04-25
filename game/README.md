# Cocos Creator 项目配置

## 项目说明

这是「轮椅大作战」游戏的 Cocos Creator 项目文件。

## 运行方法

### 方法1: 微信小程序（已完成，可直接运行）

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 克隆本仓库: `git clone https://github.com/CapYue/wheelchair-wars.git`
3. 打开微信开发者工具，选择 `miniprogram` 目录
4. 填入你的 AppID
5. 点击「预览」或「真机调试」

### 方法2: Cocos Creator 编辑器（需要安装 Cocos Creator）

1. 下载并安装 [Cocos Creator 3.7+](https://www.cocos.com/creator)
2. 克隆本仓库
3. 用 Cocos Creator 打开 `game` 目录
4. 打开场景文件 `assets/scenes/` 下的场景
5. 点击「运行」预览

## 项目结构

```
game/
├── package.json              # 项目配置
├── settings/
│   └── project.json          # Cocos 项目设置
└── assets/
    ├── scenes/              # 场景文件
    │   ├── Boot.scene        # 启动场景
    │   ├── Home.scene       # 主界面场景
    │   ├── Battle.scene      # 战斗场景
    │   └── Result.scene      # 结算场景
    ├── prefabs/             # 预制体
    │   ├── Player.prefab    # 玩家预制体
    │   ├── Projectile.prefab # 投射物预制体
    │   └── Obstacle.prefab  # 障碍物预制体
    └── scripts/             # TypeScript 脚本（存放于仓库根目录 src/）
        ├── Game.ts          # 游戏主控制器
        ├── components/       # 游戏组件
        ├── ui/              # UI组件
        ├── utils/           # 工具类
        └── network/          # 网络模块
```

## 游戏资源

AI生成的资源存放在 `resources/` 目录：

```
resources/
├── audio/                   # 音频资源
│   ├── bgm_*.mp3            # BGM音乐 (4首)
│   └── voice_*.mp3          # 角色语音 (60句)
├── images/
│   ├── weapons/             # 武器图标 (8个)
│   ├── characters/          # 角色立绘 (6个)
│   └── skills/             # 技能图标 (6个)
```

## 导入资源到 Cocos Creator

1. 在 Cocos Creator 中打开项目
2. 将 `resources/` 目录下的图片拖入 `assets/images/` 目录
3. 将 `resources/` 目录下的音频拖入 `assets/audio/` 目录
4. 更新预制体和场景中的引用

## 编译发布

### 发布到微信小游戏

1. 在 Cocos Creator 中点击「项目」→「构建发布」
2. 选择「微信小游戏」
3. 配置 AppID
4. 点击「构建」
5. 用微信开发者工具打开构建后的目录

## 开发说明

- 引擎版本: Cocos Creator 3.7.0+
- 语言: TypeScript
- 目标平台: 微信小游戏

## 常见问题

Q: Cocos Creator 打开报错？
A: 确保安装的是 Cocos Creator 3.7.0 或更高版本

Q: 资源不显示？
A: 需要将 `resources/` 目录下的资源导入到 Cocos Creator 的 `assets/` 目录

Q: 微信小程序无法运行？
A: 检查 app.json 配置，确保 pages 路径正确