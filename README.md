# 天干地支查询工具

一个基于万年历插件的天干地支查询工具，可以输入年月日显示对应的天干地支信息。

## 功能特点

- 🗓️ 输入公历日期查询天干地支
- 📅 显示对应的农历日期
- 🔮 显示年柱、月柱、日柱的天干地支
- 🐉 显示生肖信息
- ⚡ 显示五行属性
- 📱 响应式设计，支持移动端
- 🎨 现代化UI界面

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **万年历插件**: lunisolar.js
- **构建工具**: npm + http-server

## 🚀 快速部署

### GitHub Pages 部署（推荐）

#### 方法一：自动化脚本部署
```bash
# 1. 克隆或下载项目
git clone https://github.com/你的用户名/wannianli.git
cd wannianli

# 2. 运行部署脚本
./deploy.sh
```

#### 方法二：手动部署
```bash
# 1. 初始化 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 2. 添加远程仓库
git remote add origin https://github.com/你的用户名/wannianli.git

# 3. 推送代码
git push -u origin main

# 4. 在 GitHub 仓库设置中启用 Pages
# Settings > Pages > Deploy from a branch > main
```

#### 方法三：GitHub Actions 自动部署
项目已配置 GitHub Actions，推送代码后会自动部署到 GitHub Pages。

### 本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发服务器

```bash
npm start
```

或者使用开发模式（自动打开浏览器）：

```bash
npm run dev
```

#### 3. 访问应用

在浏览器中打开 `http://localhost:3000`

## 使用方法

1. 在输入框中输入要查询的年月日
2. 点击"查询天干地支"按钮
3. 查看显示的结果，包括：
   - 公历日期
   - 农历日期
   - 年柱天干地支
   - 月柱天干地支
   - 日柱天干地支
   - 生肖
   - 五行属性

## 项目结构

```
wannianli/
├── index.html          # 主页面
├── script.js           # JavaScript逻辑
├── style.css           # 样式文件
├── package.json        # 项目配置
├── README.md           # 说明文档
└── node_modules/       # 依赖包
```

## 万年历插件说明

本项目使用 `lunisolar.js` 作为万年历插件，这是一个专业的JavaScript农历工具库，具有以下特点：

- 支持公历与农历转换
- 提供天干地支计算
- 支持生肖、五行等传统信息
- 体积小，性能好
- 无需自己计算，直接调用API

## 🔧 部署后问题排查

如果部署后网页显示与本地不一致，请按以下步骤排查：

### 1. 使用诊断工具
访问 `你的域名/debug.html` 进行自动诊断

### 2. 常见问题及解决方案

**问题：显示"功能受限提示"**
- 原因：lunisolar.js库加载失败
- 解决：检查网络连接，尝试刷新页面，或点击"重新加载库"按钮

**问题：样式显示异常**
- 原因：CSS文件加载失败或缓存问题
- 解决：清除浏览器缓存，硬刷新页面（Ctrl+F5）

**问题：功能完全不工作**
- 原因：JavaScript文件加载失败
- 解决：检查浏览器控制台错误，确保所有文件正确部署

### 3. 技术细节

本项目使用了以下容错机制：
- 多CDN源加载lunisolar.js库
- 自动降级到备用计算方案
- 智能错误检测和用户提示
- 资源加载失败时的重试机制

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License
