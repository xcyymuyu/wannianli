# GitHub Pages 部署指南

## 已完成的修改

### 1. 修改了 `package.json`
- 添加了 `homepage` 字段（需要替换为您的实际GitHub用户名和仓库名）
- 添加了构建脚本 `build` 和 `copy-deps`
- 构建脚本会将 lunisolar 依赖复制到 `lib/` 目录

### 2. 修改了 `script.js`
- 将模块导入路径从 `./node_modules/lunisolar/dist/lunisolar.esm.js` 改为 `./lib/lunisolar.esm.js`
- 这样GitHub Pages可以正确加载依赖

### 3. 创建了 GitHub Actions 工作流
- 文件位置：`.github/workflows/deploy.yml`
- 自动构建和部署到GitHub Pages
- 支持 main 和 master 分支

### 4. 创建了 `.gitignore` 文件
- 排除 node_modules 等不必要的文件
- 保留 lib 目录用于部署

## 部署步骤

### 1. 更新 package.json 中的 homepage
将 `package.json` 中的：
```json
"homepage": "https://YOUR_USERNAME.github.io/wannianli"
```
替换为您的实际GitHub用户名，例如：
```json
"homepage": "https://muyu.github.io/wannianli"
```

### 2. 推送到GitHub
```bash
git add .
git commit -m "配置GitHub Pages部署"
git push origin main
```

### 3. 启用GitHub Pages
1. 进入GitHub仓库设置页面
2. 找到 "Pages" 选项
3. 在 "Source" 中选择 "GitHub Actions"
4. 工作流会自动运行并部署

### 4. 访问网站
部署完成后，您的网站将在以下地址可用：
`https://YOUR_USERNAME.github.io/REPOSITORY_NAME`

## 注意事项

1. **首次部署**：可能需要几分钟时间
2. **自动部署**：每次推送到main/master分支都会自动重新部署
3. **依赖管理**：lib目录包含必要的JavaScript依赖，会被包含在部署中
4. **HTTPS**：GitHub Pages默认支持HTTPS

## 故障排除

如果部署失败，请检查：
1. GitHub Actions 工作流日志
2. 确保 package.json 中的 homepage 字段正确
3. 确保 lib 目录包含 lunisolar.esm.js 文件
4. 检查是否有语法错误

## 本地测试

在推送到GitHub之前，可以本地测试：
```bash
npm run build
npm start
```
然后访问 http://localhost:3000 验证功能正常。
