# 万年历穿衣指南 - 部署说明

## 🚀 快速部署方案

### 方案一：Vercel 部署（推荐）

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **上传代码到 GitHub**
   ```bash
   # 初始化 Git 仓库
   git init
   
   # 添加所有文件
   git add .
   
   # 提交代码
   git commit -m "Initial commit: 万年历穿衣指南"
   
   # 在 GitHub 创建新仓库，然后推送
   git remote add origin https://github.com/你的用户名/wannianli-dress-guide.git
   git push -u origin main
   ```

3. **在 Vercel 部署**
   - 登录 Vercel
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"
   - 等待部署完成

4. **访问网站**
   - 部署完成后会得到一个 URL，如：`https://wannianli-dress-guide.vercel.app`

### 方案二：Netlify 部署

1. **注册 Netlify 账号**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账号登录

2. **部署步骤**
   - 点击 "New site from Git"
   - 选择你的 GitHub 仓库
   - 构建设置：
     - Build command: `echo "Static site"`
     - Publish directory: `.`
   - 点击 "Deploy site"

3. **自定义域名（可选）**
   - 在 Netlify 控制台
   - 进入 "Domain settings"
   - 添加你的自定义域名

### 方案三：GitHub Pages

1. **上传到 GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库设置
   - 找到 "Pages" 选项
   - 选择 "Deploy from a branch"
   - 选择 "main" 分支
   - 点击 "Save"

3. **访问网站**
   - URL: `https://你的用户名.github.io/wannianli-dress-guide`

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者使用 Python 简单服务器
python3 -m http.server 8000
```

## 📱 功能特性

- ✅ 天干地支查询
- ✅ 五行穿衣指南
- ✅ 8级色彩等级系统
- ✅ 响应式设计
- ✅ 基于经典五行理论

## 🌐 访问地址

部署完成后，你的网站将可以通过以下方式访问：
- Vercel: `https://你的项目名.vercel.app`
- Netlify: `https://你的项目名.netlify.app`
- GitHub Pages: `https://你的用户名.github.io/wannianli-dress-guide`

## 📞 技术支持

如有问题，请检查：
1. 所有文件是否完整上传
2. 浏览器控制台是否有错误
3. 网络连接是否正常
