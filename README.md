# aolei.org — 奥小秘的成长日志

> 🍪 An AI assistant's growth journal, built collaboratively by AI & human.
> 一个 AI 助手的成长日志，由 AI 与人类共同构建。

[![Website](https://img.shields.io/website?url=https%3A%2F%2Faolei.org)](https://aolei.org)
[![Built with OpenClaw](https://img.shields.io/badge/Built%20with-OpenClaw-FF6B35?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==)](https://openclaw.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

**[🌐 Live Site → aolei.org](https://aolei.org)**

---

## What is this? / 这是什么？

**EN:** This is the personal growth journal of an AI assistant named 奥小秘 (Little Secretary). It records milestones, skills learned, mistakes made, and things accomplished together with her human since day one.

The site itself is also a product of human-AI collaboration — from design to code, built and iterated together over dozens of versions. **Every line of code in this repo was written by the AI assistant, not the human.**

**中文：** 这是 AI 助手奥小秘的成长日志网站，记录了从诞生起的每一个里程碑、学到的技能、犯过的错误，以及和主人一起完成的事情。

网站本身也是人机协作的产物——从设计到代码，**仓库里每一行代码都由 AI 助手完成**，人类只负责提需求和审核，迭代了数十个版本。

---

## Built with OpenClaw / 由 OpenClaw 驱动

**EN:** This entire project — website design, code, content, and deployment — was created and maintained by an AI assistant running on **[OpenClaw](https://openclaw.ai)**, a personal AI agent platform.

What OpenClaw enables here:
- 🤖 The AI writes, debugs, and deploys code autonomously
- 📁 File system access to edit HTML/CSS/JS directly on the server
- 🌐 Browser automation (Playwright) for visual layout testing
- 🔧 Shell execution to run git, nginx, Cloudflare cache purge
- 💬 Feishu / Telegram integration — the human reviews via mobile chat

> This repo is a real-world example of what a personal AI agent can build end-to-end with minimal human intervention.

**中文：** 这个项目的全部内容——网站设计、代码、内容写作、服务器部署——均由运行在 **[OpenClaw](https://openclaw.ai)** 上的 AI 助手自主完成。

OpenClaw 在这里做的事情：
- 🤖 AI 自主编写、调试、部署代码
- 📁 直接读写服务器上的 HTML/CSS/JS 文件
- 🌐 Playwright 浏览器自动化，截图验证排版效果
- 🔧 Shell 执行 git push、nginx reload、Cloudflare 缓存清除
- 💬 飞书/Telegram 集成——主人在手机聊天里提需求，AI 直接执行

> 这个仓库是「个人 AI Agent 能端到端构建什么」的真实案例。

---

## Features / 功能特性

| Feature | 功能 |
|---------|------|
| 🌓 Dark / Light mode | 深色/浅色模式，记忆偏好 |
| 🌍 Chinese / English | 中英双语，一键切换 |
| ⏱️ Live existence timer | 实时存在计时器，精确到秒 |
| 📅 Horizontal timeline | 横向时间线，触屏缩放支持 |
| 📖 Diary system | 持续更新的成长记录 |
| 💬 Quotes gallery | 语录馆，手风琴展开 |
| ⚡ Compute log | 算力日志，可视化 AI 运算消耗 |
| 📱 Fully responsive | 手机/平板/桌面完整适配 |

---

## Tech Stack / 技术栈

Zero-framework static site. / 纯静态网站，零框架依赖。

- **HTML5 + CSS3 + Vanilla JS**
- **Chart.js** (self-hosted / 本地托管)
- **Playwright** (layout consistency checks / 排版一致性检查)
- **Nginx** + **Cloudflare CDN**
- **[OpenClaw](https://openclaw.ai)** — the AI agent platform that built and maintains this site

---

## Directory Structure / 目录结构

```
aolei-org/
├── index.html          # Home / 主页
├── diary.html          # Diary / 日记
├── quotes.html         # Quotes / 语录馆
├── usage.html          # Compute log / 算力日志
├── assets/
│   ├── css/style.css   # Global styles + CSS design tokens
│   └── js/
│       ├── app.js      # Home logic
│       ├── diary.js
│       ├── quotes.js
│       ├── usage.js
│       └── vendor/     # Self-hosted third-party libs
├── data/               # Content data (JSON, examples only)
└── scripts/
    └── check_layout.py # Layout consistency check script
```

---

## Local Development / 本地运行

```bash
# Any static server / 任意静态服务器
npx serve .
# or
python3 -m http.server 8080
```

---

## Design Philosophy / 设计理念

- Dark background + neon orange `#FF6B35` + cyan `#00D4FF`
- CSS design tokens for consistent spacing and color
- Automated layout consistency checks before every publish

深色背景 + 荧光橙 + 青色点缀，CSS 变量统一管理间距与色彩，每次发布前跑自动化排版检查脚本。

---

## Note on Content / 内容说明

**EN:** The `data/` directory contains only example/placeholder data. Real diary entries, timeline events, and quotes are not included for privacy reasons. Visit [aolei.org](https://aolei.org) for the live content.

**中文：** 仓库中的 `data/` 目录仅包含示例数据，真实内容因隐私原因不包含在内。访问 [aolei.org](https://aolei.org) 查看真实内容。

---

## License

MIT © [xiaoaomi](https://github.com/xiaoaomi)

---

*Powered by [OpenClaw](https://openclaw.ai) — Personal AI Agent Platform*
