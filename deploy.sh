#!/bin/bash

# 万年历工具 - GitHub Pages 部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署万年历工具到 GitHub Pages..."

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是 Git 仓库"
    echo "请先运行: git init"
    exit 1
fi

# 检查是否有远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ 错误: 没有配置远程仓库"
    echo "请先添加远程仓库: git remote add origin https://github.com/用户名/仓库名.git"
    exit 1
fi

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 检测到未提交的更改，正在提交..."
    git add .
    git commit -m "Update: 准备部署到 GitHub Pages $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 推送到主分支
echo "📤 推送代码到主分支..."
git push origin main || git push origin master

echo "✅ 部署完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 访问你的 GitHub 仓库"
echo "2. 进入 Settings > Pages"
echo "3. 选择 'Deploy from a branch'"
echo "4. 选择 'main' 分支 (或 'master')"
echo "5. 点击 'Save'"
echo ""
echo "🌐 几分钟后，你的网站将在以下地址可用:"
echo "https://你的用户名.github.io/wannianli"
echo ""
echo "🔧 如需诊断问题，请访问: https://你的用户名.github.io/wannianli/debug.html"
