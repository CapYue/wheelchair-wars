# 打包与发布指南 v1.0

---

## 1. 环境准备

### 1.1 开发环境要求

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | >= 16.0 | 项目构建 |
| npm | >= 8.0 | 包管理 |
| 微信开发者工具 | 最新版 | 调试与发布 |

### 1.2 安装步骤

```bash
# 1. 克隆项目
git clone <repository_url>
cd wheelchair_wars

# 2. 安装依赖
npm install

# 3. 安装微信开发者工具 CLI (可选)
npm install -g wechat-devtools-cli
```

### 1.3 微信公众平台准备

1. 注册微信公众平台账号 (https://mp.weixin.qq.com/)
2. 选择「小游戏」类型注册
3. 完成主体信息认证
4. 获取 AppID

---

## 2. 项目配置

### 2.1 配置文件

编辑 `project.config.json`:
```json
{
  "appid": "你的AppID",
  "projectname": "wheelchair_wars",
  "compileType": "miniprogram"
}
```

### 2.2 环境变量

创建 `.env` 文件:
```bash
# 开发环境
NODE_ENV=development
API_URL=https://dev-api.wheelchair-wars.com

# 生产环境
# NODE_ENV=production
# API_URL=https://api.wheelchair-wars.com
```

### 2.3 云开发配置

在 `miniprogram/app.js` 中更新云环境ID:
```javascript
wx.cloud.init({
  env: '你的云环境ID',
  traceUser: true
})
```

---

## 3. 构建流程

### 3.1 开发构建

```bash
# 启动开发服务器
npm run dev

# 监听模式构建
npm run watch
```

### 3.2 生产构建

```bash
# 构建生产版本
npm run build

# 构建并压缩
npm run build:minify
```

### 3.3 构建输出

构建完成后，资源会输出到 `build/` 目录:
```
build/
├── images/          # 图片资源
├── audio/           # 音频资源
├── game.js          # 游戏主代码 (压缩)
├── game.json        # 游戏配置
└── assets/          # 其他资源
```

---

## 4. 微信开发者工具配置

### 4.1 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择项目根目录 `wheelchair_wars`
4. 填入 AppID
5. 点击「确认」

### 4.2 编译设置

在项目设置中:
- ✓ ES6 转 ES5
- ✓ 压缩代码
- ✓ 增强编译
- ✓ 开启匿名 Game 赞助

### 4.3 调试技巧

| 功能 | 快捷键 | 用途 |
|------|--------|------|
| 模拟器 | Ctrl+M | 切换模拟器 |
| 真机调试 | Ctrl+D | 连接真机 |
| 预览 | Ctrl+P | 生成预览码 |
| 上传 | Ctrl+U | 上传代码 |

---

## 5. 分包配置

### 5.1 分包策略

根据微信小程序限制，合理分配分包:

| 分包 | 大小限制 | 内容 |
|------|---------|------|
| 主包 | 4MB | 核心玩法、首页 |
| map-community | 1MB | 社区广场地图资源 |
| map-market | 1MB | 菜市场地图资源 |
| map-park | 1MB | 公园湖边地图资源 |
| map-hospital | 1MB | 医院门口地图资源 |
| skins | 2MB | 角色皮肤资源 |
| audio | 2MB | 音效资源 |

### 5.2 分包配置 (app.json)

```json
{
  "subPackages": [
    {
      "root": "subPackages/maps/",
      "pages": [
        "community/index",
        "market/index",
        "park/index",
        "hospital/index"
      ]
    },
    {
      "root": "subPackages/skins/",
      "pages": ["list/index"]
    }
  ]
}
```

### 5.3 按需加载

在代码中使用分包:
```javascript
// 加载地图资源
if (typeof wx.requireMiniProgram !== 'undefined') {
  wx.requireMiniProgram([
    'subPackages/maps/community/index.js'
  ]);
}
```

---

## 6. 代码上传

### 6.1 上传前检查

- [ ] 代码完整性检查
- [ ] 所有资源路径正确
- [ ] 分包大小合规
- [ ] 云函数已部署
- [ ] 测试用例通过

### 6.2 上传步骤

1. 在微信开发者工具中点击「上传」
2. 填写版本号 (如: 1.0.0)
3. 填写版本备注
4. 点击「确认」

### 6.3 版本管理

| 版本号 | 说明 | 规则 |
|--------|------|------|
| 1.0.0 | 正式版本 | 主版本.次版本.修订号 |
| 1.0.1 | Bug修复 | 修订号+1 |
| 1.1.0 | 新功能 | 次版本+1 |
| 2.0.0 | 大版本 | 主版本+1 |

---

## 7. 云函数部署

### 7.1 云函数列表

| 函数名 | 用途 |
|--------|------|
| login | 用户登录 |
| matchmaking | 匹配对手 |
| sync | 游戏数据同步 |
| ranking | 排行榜数据 |

### 7.2 部署步骤

```bash
# 进入云函数目录
cd cloudfunctions/

# 部署单个函数
npm run deploy:function -- --name login

# 部署所有函数
npm run deploy:all
```

### 7.3 云开发控制台

1. 登录微信公众平台
2. 进入「开发」→「云开发」
3. 监控云函数调用
4. 查看数据库操作

---

## 8. 审核与发布

### 8.1 提交审核前检查

- [ ] 完成所有页面功能测试
- [ ] 无明显Bug
- [ ] 符合微信审核规范
- [ ] 用户隐私协议已添加
- [ ] 苹果付费说明（如有）

### 8.2 审核规范要点

**必须避免的内容:**
- 血腥暴力画面
- 政治敏感元素
- 赌博相关玩法
- 诱导分享/关注
- 虚假宣传

**必须包含的内容:**
- 用户隐私政策
- 未成年人保护说明
- 版权信息

### 8.3 提交流程

1. 在开发者工具点击「提交审核」
2. 选择「体验版」
3. 填写版本信息
4. 提交审核
5. 等待审核结果 (通常1-7天)

### 8.4 审核失败处理

收到审核反馈后:
1. 查看具体原因
2. 修复问题
3. 重新提交审核

---

## 9. 运营配置

### 9.1 分享配置

在 `app.js` 中配置:
```javascript
// 监听分享
wx.onShareAppMessage(() => {
  return {
    title: '轮椅大作战 - 年轻人的轮椅Battle!',
    imageUrl: '/images/share.jpg',
    query: 'from=share'
  };
});
```

### 9.2 订阅消息

如需消息通知，在小程序后台配置:
- 订阅消息模板
- 消息发送权限

### 9.3 举报与反馈

添加用户反馈入口:
- 设置页面添加「反馈与投诉」
- 链接到小程序内的反馈表单

---

## 10. 监控与维护

### 10.1 性能监控

使用微信小程序自带监控:
- 性能面板 (Profiles)
- 内存监控
- FPS监控

### 10.2 错误监控

```javascript
// 捕获全局错误
App({
  onError: function(err) {
    // 上报错误日志
    wx.cloud.callFunction({
      name: 'reportError',
      data: { error: err }
    });
  }
});
```

### 10.3 数据分析

接入微信数据分析:
- 用户画像
- 行为分析
- 漏斗分析
- 留存分析

### 10.4 常见问题

| 问题 | 解决方案 |
|------|----------|
| 包体超限 | 使用分包、压缩资源 |
| 加载慢 | 懒加载、CDN加速 |
| 卡顿 | 优化渲染、使用对象池 |
| 登录失败 | 检查云开发配置 |
| 审核被拒 | 查看具体原因，修改后重提 |

---

## 11. 更新流程

### 11.1 迭代流程

```
开发 → 测试 → 体验版 → 提交审核 → 发布
  ↑__________________________________|
```

### 11.2 热更新 (可选)

如需支持热更新:
```javascript
// 检查更新
const updateManager = wx.getUpdateManager();
updateManager.onCheckForUpdate((res) => {
  if (res.hasUpdate) {
    updateManager.onUpdateReady(() => {
      // 提示用户更新
    });
  }
});
```

---

## 12. 联系方式

如有问题，请联系:
- 技术支持: support@wheelchair-wars.com
- 商务合作: business@wheelchair-wars.com

---

**文档版本**: v1.0
**创建日期**: 2024年
**最后更新**: 待定