# 万年历 - 天干地支查询工具

一个基于万年历的五行穿衣推荐系统，提供天干地支查询和五行穿衣指导功能。

## 功能特性

- 📅 **天干地支查询**：支持公历日期转换为农历天干地支
- 🎨 **五行穿衣推荐**：基于五行理论的智能穿衣指导
- 🔍 **详细分析**：提供完整的穿衣推荐推导过程
- 📱 **响应式设计**：支持桌面端和移动端
- 🎯 **专业算法**：基于传统五行理论的科学计算

## 项目结构

```
wannianli/
├── public/                 # 公共文件
│   └── index.html         # 主页面
├── src/                   # 源代码
│   ├── js/               # JavaScript文件
│   │   └── script.js     # 主要逻辑
│   ├── css/              # 样式文件
│   │   └── style.css     # 主样式
│   └── assets/           # 静态资源
│       └── lib/          # 第三方库
├── docs/                 # 文档
├── config/               # 配置文件
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **库依赖**：lunisolar.js, @lunisolar/plugin-takesound
- **部署**：支持 Netlify, Vercel 等静态网站托管

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/yourusername/wannianli.git
cd wannianli
```

2. 启动开发服务器
```bash
npm start
# 或
python3 -m http.server 8000
```

3. 打开浏览器访问 `http://localhost:8000/public/`

### 部署

项目支持多种部署方式：

- **Netlify**：直接拖拽项目文件夹到 Netlify
- **Vercel**：使用 Vercel CLI 或 GitHub 集成
- **GitHub Pages**：推送到 GitHub 仓库并启用 Pages

## 使用说明

1. 选择或输入要查询的日期
2. 点击"查询"按钮获取天干地支信息
3. 查看五行穿衣推荐和详细分析
4. 根据推荐选择合适的服装颜色

## 五行穿衣理论

基于传统五行理论，系统会分析：
- 日主强弱
- 用神确定
- 五行生克关系
- 颜色等级评定

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持天干地支查询
- 实现五行穿衣推荐
- 添加详细分析功能
