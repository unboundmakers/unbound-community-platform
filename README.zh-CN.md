# Unbound 社区 Google Cloud 集成模块

从 AI 造物社区发布项目中整理出的通用 GCP 集成参考，公开的是云服务接入方式，
不是社区应用本身。

[项目叙述](docs/PROJECT_CONTEXT.zh-CN.md) | [English](README.md) |
[Google Cloud 工程案例](docs/GOOGLE_CLOUD_CASE_STUDY.md) |
[技术指南](docs/TECHNICAL_GUIDE.md)

## 公开模块

- Firestore 文档适配器：通用读取和事务型首次创建，不包含业务字段或统计逻辑。
- 运行配置：显式项目、集合和云访问开关，通过运行环境使用 ADC。
- Firebase Hosting 模板：缓存响应头和可选 Cloud Run 转发。
- Cloud Build / Artifact Registry 模板：镜像构建、存储与构建身份配置。
- 容器参考：由接入方提供应用代码、入口和锁文件，以非 root 身份运行。
- 技术文档：架构、IAM 身份分工与 Secret Manager 部署注入。

本包不包含业务 API、事件模型、看板、浏览器互动、网站内容或演示页面。
Hosting 模板需要接入方自己的 site/ 内容和 Cloud Run 服务，构建模板用于接入方
自己的应用源码目录；这里没有一个可以直接启动或部署的完整社区应用。

## 本地查看

Node.js 22 或更高版本可以直接检查模块语法，无需安装 SDK 或访问云端：

```sh
npm run check
```

模块导入不会初始化云客户端。真实接入需安装依赖、提供项目与集合、显式开启云访问，
并配置授权 ADC。详细接口和模板使用方式见[技术指南](docs/TECHNICAL_GUIDE.md)。

## 项目关系

社区发布项目解决内容如何稳定交付的问题；Strategic Signal Scanner 支持前面的
技术研究准备。我在研究、编辑和社区活动中将两者衔接，本仓库只公开其中通用的
Google Cloud 集成部分。

## 权利说明

原创部分未授予使用或商用许可，商业使用须事先书面授权。第三方组件仍遵守各自
条款。见 [RIGHTS.md](RIGHTS.md) 和[第三方声明](THIRD_PARTY_NOTICES.md)。
