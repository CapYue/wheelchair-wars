# AI 资源生成指南 v1.0

> 使用 AI 工具生成轮椅大作战的所有美术和音频资源

---

## 📋 资源清单

### 图像资源

| 类型 | 数量 | 用途 | 工具推荐 |
|------|------|------|----------|
| 角色立绘 | 6个 × 4表情 = 24张 | 游戏内显示 | 垫图 + 细节控制 |
| 角色头像 | 6个 × 2尺寸 = 12张 | UI列表、排行榜 | 直接生成 |
| 武器图标 | 8个 | 武器选择、商城 | 统一风格 |
| 技能图标 | 6个 | 技能按钮 | 半透明风格 |
| 地图背景 | 4张 | 游戏场景 | 分层生成 |
| UI图标 | ~20个 | 按钮、状态 | 简单图标 |
| 特效图 | ~15张 | 攻击、命中 | 序列帧 |
| 皮肤图 | 6个角色 × 2皮肤 = 12张 | 皮肤展示 | 角色变体 |

### 音频资源

| 类型 | 数量 | 时长 | 工具推荐 |
|------|------|------|----------|
| BGM | 4首 | 各60-180秒 | Suno / Udio |
| 音效 | 10种 | 各0.1-2秒 | 机器自带TTS |
| 角色语音 | 6角色 × 10句 = 60句 | 各1-3秒 | 机器TTS |

---

## 🎨 图像生成方案

### 工具选择

| 工具 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Midjourney** | 质量高、风格多样 | 费用高、需要英文 | 角色立绘、地图 |
| **Stable Diffusion** | 免费、可本地部署 | 需配置、有门槛 | 批量生成、变体 |
| **DALL-E 3** | 细节准确、中文支持 | 版权限制 | 快速原型 |
| **通义万相/文心一格** | 中文友好、免费额度 | 质量参差 | 国内使用 |

### 推荐工作流

**方案：Midjourney + Photoshop**

1. 用 Midjourney 生成高质量素材
2. 用 Photoshop + AI 修图
3. 用 TinyPNG 压缩

---

## 1️⃣ 角色立绘生成

### 基础提示词模板

```
A cute chibi-style elderly Chinese man/woman sitting in a wheelchair, 
wearing [outfit], holding [accessory], with [hair_style] and thick glasses, 
big golden tooth smile, cartoon style, bright colors, transparent background, 
isolated on white, high quality, game character sprite, 128x128 pixels
```

### 角色详细提示词

#### 李大爷 - 广场舞之王

```prompt
A cute chibi-style elderly Chinese man in wheelchair, wearing colorful 
Latin dance outfit with golden patterns, holding a fan, spiky gray hair, 
thick black glasses, big golden tooth smile, cartoon style, bright colors, 
transparent background, isolated on white, high quality, game character sprite
```

#### 王大妈 - 买菜砍价王

```prompt
A cute chibi-style elderly Chinese woman in wheelchair, wearing floral 
print shirt with large sunglasses on head, holding shopping bag, curly perm 
hair dyed reddish-brown, thick eyebrows, cartoon style, bright colors, 
transparent background, isolated on white, high quality, game character sprite
```

#### 张爷爷 - 养生专家

```prompt
A cute chibi-style elderly Chinese man in wheelchair, wearing traditional 
white Tang suit, holding a jade necklace, bald head with wispy hair, 
magnifying glass as glasses, gentle smile, cartoon style, bright colors, 
transparent background, isolated on white, high quality, game character sprite
```

#### 赵奶奶 - 暴走团长

```prompt
A cute chibi-style elderly Chinese woman in wheelchair, wearing bright 
yellow暴走团 jacket with reflective strips, holding a whistle, big curly perm 
hair, oversized sunglasses, confident smirk, cartoon style, bright colors, 
transparent background, isolated on white, high quality, game character sprite
```

#### 老刘头 - 象棋大师

```prompt
A cute chibi-style elderly Chinese man in wheelchair, wearing traditional 
Chinese tunic suit, holding a fan, neat white beard, intellectual expression, 
round rimless glasses, cartoon style, bright colors, transparent background, 
isolated on white, high quality, game character sprite
```

#### 孙老太太 - 织毛衣高手

```prompt
A cute chibi-style elderly Chinese woman in wheelchair, wearing colorful 
hand-knitted sweater with patterns, holding knitting needles, gray bun hair 
with flower pin, kind grandmotherly smile, large round glasses, cartoon style, 
bright colors, transparent background, isolated on white, high quality, game character sprite
```

### 角色变体提示词

```prompt
# 变体1 - 攻击姿态
[基础提示词], attacking pose, throwing motion, arm raised, dynamic pose

# 变体2 - 受伤姿态
[基础提示词], hurt expression, slightly tilted, wincing face, arms up defensively

# 变体3 - 胜利姿态
[基础提示词], victory pose, arms raised, big smile, jumping slightly, happy expression

# 变体4 - 技能释放
[基础提示词], casting spell, glowing effect around, dramatic pose, energy aura
```

### 统一风格参数

```yaml
风格控制:
  - 艺术风格: cartoon, chibi, vibrant colors
  - 画质: high quality, detailed, 8k
  - 背景: transparent, white background, isolated
  - 尺寸: 128x128, 256x256, 512x512
  - 角色比例: chibi (大头小身)
  
颜色板:
  - 主色: #FFD700 (金色)
  - 辅色: #FF6666 (红色)
  - 强调色: #66CCFF (蓝色)
  - 背景色: #333366 (深蓝)
```

---

## 2️⃣ 武器图标生成

### 提示词模板

```
Simple flat icon of [weapon_name] on transparent background, 
cartoon style, bold outline, bright game UI colors, 
centered composition, no shadow, icon style, 64x64 pixels
```

### 详细提示词

```yaml
鸡蛋: "Simple flat icon of a white egg with yellow yolk visible, cartoon style, bold outline, bright game UI colors, transparent background"
铁蛋蛋: "Simple flat icon of a metallic gray egg, shiny surface, cartoon style, bold outline, transparent background"
拐杖: "Simple flat icon of a wooden walking stick, brown wood texture, cartoon style, bold outline, transparent background"
药罐子: "Simple flat icon of a medicine bottle with cross symbol, green color, cartoon style, transparent background"
假牙: "Simple flat icon of upper false teeth with white color, cartoon style, transparent background"
老年糕: "Simple flat icon of a round cookie with chocolate chips, brown color, cartoon style, transparent background"
听诊器: "Simple flat icon of a doctor stethoscope, gray metal, cartoon style, transparent background"
购物车: "Simple flat icon of a shopping cart, gray metal frame, cartoon style, transparent background"
```

---

## 3️⃣ 地图背景生成

### 提示词模板

```
Top-down view of [location_name] park/game level, flat 2D style, 
bright cartoon colors, few obstacles (benches, trees), 
open area for gameplay, seamless tileable, game background, 
no characters, detailed textures
```

### 详细提示词

```yaml
社区广场: 
  "Top-down view of a community park square, green grass ground, 
  fitness equipment scattered around, wooden benches, tall trees, 
  flat 2D cartoon style, bright sunny day, game background, no characters"

菜市场:
  "Top-down view of a busy Chinese market, stalls with colorful 
  awnings, vegetables and fruits displayed, narrow walkways, 
  flat 2D cartoon style, warm lighting, game background"

公园湖边:
  "Top-down view of a park lakeside, blue water with slight reflections, 
  walking paths, trees along shore, benches, flat 2D cartoon style, 
  beautiful scenery, game background"

医院门口:
  "Top-down view of hospital entrance area, white tiles, green cross 
  symbol visible, wheelchair ramps, benches, flat 2D cartoon style, 
  clean and bright, game background"
```

---

## 4️⃣ UI图标生成

```yaml
# 虚拟摇杆
"Simple flat icon of a circular joystick, game controller style, 
transparent background, bold outline"

# 攻击按钮
"Simple flat icon of a hand throwing motion, red color, 
cartoon style, transparent background, game UI button"

# 暂停按钮
"Simple flat icon of pause symbol (two vertical bars), 
gray color, transparent background"

# 血条
"Simple flat icon of a health bar, red fill, heart symbol, 
game UI style, transparent background"

# 技能按钮
"Simple flat icon of lightning bolt, yellow color, 
glowing effect, cartoon style, transparent background"

# 金币图标
"Simple flat icon of a gold coin with ¥ symbol, 
shiny gold color, cartoon style"

# 钻石图标
"Simple flat icon of a blue diamond gem, sparkling, 
cartoon style, transparent background"
```

---

## 5️⃣ 特效图生成

```yaml
# 鸡蛋爆炸
"Explosion effect of yellow egg yolk splashing, cartoon style, 
frame 1 of animation sequence, transparent background, game effect"

# 鸡蛋飞行轨迹
"Motion blur trail of an egg flying, speed lines, yellow color, 
cartoon style, game effect sprite"

# 技能光环
"Circular energy aura, golden glowing effect, spinning particles, 
magical spell effect, transparent background, game sprite"

# 命中星星
"Impact stars burst effect, white and yellow, spinning animation frame, 
cartoon style, transparent background"
```

---

## 6️⃣ 皮肤图生成

### 提示词模板

```
Same character as [base_character], wearing [new_outfit], 
same pose and style as reference, consistent with base design,
cartoon game character, transparent background
```

### 具体示例 - 李大爷皮肤

```yaml
拉丁舞服:
  "Same chibi elderly Chinese man character as before, wearing 
  shiny red Latin dance outfit with golden trim, dancing pose, 
  holding a fan, same style and quality, transparent background"

太极服:
  "Same chibi elderly Chinese man character as before, wearing 
  traditional white Tai Chi uniform with blue trim, serene pose, 
  hands in Qi stance, same style, transparent background"
```

---

## 🔊 音频生成方案

### 工具选择

| 类型 | 推荐工具 | 说明 |
|------|----------|------|
| **BGM** | Suno / Udio | 输入提示词生成音乐 |
| **音效** | 机器自带TTS + 音频处理 | 用系统自带工具 |
| **语音** | Azure TTS / 阿里语音合成 | 选择声音 |

---

## 7️⃣ BGM 生成

### Suno 提示词

```yaml
社区广场BGM:
  "Chinese community park ambient music, cheerful, upbeat tempo, 
  featuring traditional Chinese instruments like erhu and guzheng, 
  happy vibes, suitable for mobile game background music, 2 minutes loop"

菜市场BGM:
  "Bustling Chinese market background music, energetic, fast tempo, 
  mix of traditional and modern Chinese instruments, lively atmosphere, 
  mobile game background, loopable"

公园湖边BGM:
  "Peaceful park lakeside music, calm, slow tempo, gentle guzheng 
  and bamboo flute melody, relaxing vibes, mobile game ambient, 
  3 minutes loop"

战斗BGM:
  "Epic Chinese style battle music, high energy, fast tempo, 
  drums and Chinese strings, intense fighting game background, 
  3 minutes, builds up excitement"

胜利BGM:
  "Victory fanfare music, triumphant, uplifting, Chinese style 
  celebration, drums and cymbals, happy ending feel, 15 seconds"

失败BGM:
  "Slightly melancholic Chinese instrumental, slow tempo, 
  gentle erhu melody, reflective mood, 10 seconds"
```

### BGM 技术参数

```yaml
格式: MP3
采样率: 44.1kHz
比特率: 192kbps
时长: 
  - 背景循环: 60-180秒
  - 胜利: 15-20秒
  - 失败: 10-15秒
```

---

## 8️⃣ 音效生成

### 音效列表

| 音效 | 描述 | 时长 |
|------|------|------|
| throw | 投掷嗖嗖声 | 0.2s |
| hit_light | 轻微命中"啪" | 0.1s |
| hit_heavy | 重击中"砰" | 0.2s |
| wheel_roll | 轮椅滚动 | 循环 |
| skill_charge | 技能充能嗡嗡声 | 1s |
| skill_use | 技能释放"叮" | 0.5s |
| ui_click | UI点击咔哒 | 0.1s |
| ui_popup | 弹窗弹出 | 0.3s |
| game_start | 游戏开始号角 | 2s |
| win | 胜利欢呼 | 3s |
| lose | 失败叹息 | 2s |

### 音效生成方法

**方法1: 机器自带音效库**
```
使用系统自带的声音生成功能录制
```

**方法2: 在线音效库**
- [Freesound](https://freesound.org/) - 免费音效
- [Pixabay Music](https://pixabay.com/music/) - 免费音乐音效

**方法3: 用TTS + 音频编辑**
```
1. 用TTS生成语音片段
2. 用Audacity裁剪处理
3. 添加混响和音效
```

---

## 9️⃣ 角色语音生成

### 语音风格

| 角色 | 声音 | 语气 | 例子 |
|------|------|------|------|
| 李大爷 | 中老年男声 | 洪亮、得意 | "哈哈哈哈！老夫天下无敌！" |
| 王大妈 | 中老年女声 | 泼辣、犀利 | "你这小毛孩，还嫩了点！" |
| 张爷爷 | 老爷爷声音 | 温和、悠哉 | "不急不急，慢慢来..." |
| 赵奶奶 | 老奶奶声音 | 霸气、暴走 | "都给老娘让开！" |
| 老刘头 | 老爷爷声音 | 稳重、淡然 | "胜负已定，不必再争" |
| 孙老太太 | 老奶奶声音 | 和蔼、慈祥 | "乖孩子，慢慢打" |

### TTS 推荐配置

```yaml
Azure TTS:
  角色:
    - zh-CN-YunxiNeural (男)
    - zh-CN-XiaoxiaoNeural (女年轻)
    - zh-CN-YunyangNeural (男新闻)
    
参数:
  语速: 1.0 - 1.2
  音调: 0.9 - 1.1 (男声低一些)
  
阿里语音:
  选择: 活泼女声、成熟男声
```

### 台词列表

```yaml
李大爷:
  攻击: ["接招！", "看老夫的手段！", "吃我一招！"]
  受伤: ["哎呦！", "大意了！", "年轻人不讲武德！"]
  胜利: ["哈哈哈哈！天下无敌！", "老夫宝刀未老！"]
  失败: ["唉...老了...", "下次再战！"]
  
王大妈:
  攻击: ["看我的！", "你敢接吗？", "砍死你！"]
  受伤: ["哎呀妈呀！", "疼死老娘了！"]
  胜利: ["还是老娘厉害吧！", "哼哼，服不服！"]
  失败: ["不算不算！再来！", "你等着！"]
  
张爷爷:
  攻击: ["来吧", "不慌不忙", "稳如泰山"]
  受伤: ["无妨", "小伤而已", "淡定淡定"]
  胜利: ["善", "胜负已分", "承让"]
  失败: ["罢了", "修身养性", "下次吧"]
  
赵奶奶:
  攻击: ["滚开！", "老娘来了！", "让路！"]
  受伤: ["谁敢碰我！", "暴走团出动！"]
  胜利: ["哼！小意思！", "暴走团最强！"]
  失败: ["你们等着！", "暴走团不会输！"]
  
老刘头:
  攻击: ["落子无悔", "将军", "步步为营"]
  受伤: ["兵家常事", "无妨", "静观其变"]
  胜利: ["棋高一着", "承让承让", "姜还是老的辣"]
  失败: ["胜负乃兵家常事", "静待时机", "下次再来"]
  
孙老太太:
  攻击: ["乖，接好", "慢慢来", "别急别急"]
  受伤: ["哎哟喂", "小心点啊", "吓死老太太了"]
  胜利: ["哎呀，过奖过奖", "都是运气好", "孩子们真棒"]
  失败: ["没关系没关系", "重在参与", "下次会更好"
```

---

## 📂 输出规范

### 文件命名

```
角色立绘: char_{角色名}_{动作}_{序号}.png
  例: char_li_idle_01.png, char_wang_attack_01.png

武器图标: weapon_{武器名}.png
  例: weapon_egg.png, weapon_crutch.png

技能图标: skill_{技能名}.png
  例: skill_square_dance.png

地图背景: map_{地图名}.png
  例: map_community.png

UI图标: ui_{功能}_{状态}.png
  例: ui_btn_attack.png, ui_btn_pause.png

BGM: bgm_{场景}.mp3
  例: bgm_community.mp3, bgm_battle.mp3

音效: sfx_{名称}.mp3
  例: sfx_throw.mp3, sfx_hit.mp3

语音: voice_{角色}_{类型}_{序号}.mp3
  例: voice_li_attack_01.mp3, voice_wang_win_01.mp3
```

### 技术规格

```yaml
图片:
  - 格式: PNG (透明), JPG (背景)
  - 角色: 128x128 (主), 64x64 (小), 256x256 (大)
  - 图标: 64x64
  - 地图: 1920x1280
  - 单图大小: < 200KB

音频:
  - BGM格式: MP3
  - 采样率: 44.1kHz
  - 比特率: 192kbps
  - BGM大小: < 5MB
  - 音效大小: < 100KB
  - 语音大小: < 50KB
```

---

## ⏱️ 时间估算

| 资源类型 | 数量 | 生成时间 | 处理时间 | 总计 |
|----------|------|----------|----------|------|
| 角色立绘 | 24张 | 4小时 | 2小时 | 6小时 |
| 角色头像 | 12张 | 2小时 | 1小时 | 3小时 |
| 武器图标 | 8个 | 1小时 | 0.5小时 | 1.5小时 |
| 技能图标 | 6个 | 1小时 | 0.5小时 | 1.5小时 |
| 地图背景 | 4张 | 2小时 | 1小时 | 3小时 |
| UI图标 | 20个 | 2小时 | 1小时 | 3小时 |
| 特效图 | 15张 | 2小时 | 1小时 | 3小时 |
| 皮肤图 | 12张 | 3小时 | 1.5小时 | 4.5小时 |
| BGM | 4首 | 1小时 | 0.5小时 | 1.5小时 |
| 音效 | 10个 | 1小时 | 1小时 | 2小时 |
| 语音 | 60句 | 2小时 | 1小时 | 3小时 |
| **总计** | - | **~21小时** | **~11小时** | **~32小时** |

---

## 🛠️ 工具推荐汇总

| 类型 | 推荐工具 | 费用 | 链接 |
|------|----------|------|------|
| 图片生成 | Midjourney | $10-30/月 | midjourney.com |
| 图片生成 | 通义万相 | 免费额度 | wandb.alibaba.com |
| 图片生成 | 文心一格 | 免费额度 | yige.baidu.com |
| BGM生成 | Suno | $8-30/月 | suno.com |
| BGM生成 | Udio | $10-30/月 | udio.com |
| 语音合成 | Azure TTS | 按量付费 | azure.microsoft.com |
| 语音合成 | 阿里语音 | 按量付费 | nls.alibaba.com |
| 图片压缩 | TinyPNG | 免费 | tinypng.com |
| 音频处理 | Audacity | 免费 | audacityteam.org |

---

## 📝 注意事项

1. **风格统一**: 所有角色使用相同的比例和风格 (chibi大头)
2. **透明背景**: 角色和图标必须PNG透明背景
3. **版权**: Suno生成的音乐可商用，注意保留元数据
4. **测试**: 生成后用游戏引擎测试效果
5. **迭代**: AI生成可能需要多次尝试，准备好调整提示词

---

**文档版本**: v1.0
**创建日期**: 2024年

如需我帮你生成任何具体的提示词或资源清单，请随时告诉我！