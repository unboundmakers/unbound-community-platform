# Generic Google Cloud Integration Guide

本包公开 Firestore 文档适配器、运行配置和部署模板，不包含应用服务或页面。
模板使用在接入方自己的项目中，不能把本目录直接当作完整应用部署。

## Modules

| 文件 | 作用 |
| --- | --- |
| [firestore-documents.js](../modules/firestore-documents.js) | 通用文档读取、事务型首次创建 |
| [runtime-config.js](../modules/runtime-config.js) | 显式云访问、项目与集合配置 |
| [firebase.template.json](../config/firebase.template.json) | 静态缓存和可选 Cloud Run 转发 |
| [cloudbuild.template.yaml](../config/cloudbuild.template.yaml) | 镜像构建、Artifact Registry 与构建身份 |
| [Dockerfile](../config/Dockerfile) | 接入方应用的容器参考 |

## Local Inspection

需要 Node.js 22+。不安装依赖也能检查语法：

```sh
npm run check
```

模块没有默认启动命令、HTTP 服务、后台进程或自动部署行为。真实访问 Firestore
才需要安装 package.json 中声明的依赖，并由操作者配置授权 ADC。

## Firestore Adapter

```js
const {readCloudConfig} = require('./modules/runtime-config');
const {createDocumentStore} = require('./modules/firestore-documents');
const store = createDocumentStore(readCloudConfig());
```

这段初始化仅在明确配置 ENABLE_GOOGLE_CLOUD=true、GOOGLE_CLOUD_PROJECT 和
DOCUMENT_COLLECTION 后使用。模块不会自动读取 .env 文件；.env.example 只列占位符。
Cloud Run 使用关联运行账号的 ADC，本地使用操作者授权的开发凭据。

| 方法 | 行为 |
| --- | --- |
| get(id) | 获取文档，缺失时返回 null |
| createOnce(id, document) | 事务内检查存在性；首次创建返回 created=true，否则返回既有文档且不覆盖 |

集合名限定为单个简单标识，文档 ID 不允许空值、路径分隔符或超过长度限制。
适配器不定义业务字段，不做业务校验或聚合。相同 key 的不同内容也不会覆盖既有值，
调用方需自行选择 key、决定冲突策略与处理 SDK 错误。Firestore 事务可能重跑回调，
不要在回调里加入外部副作用。

## Hosting Template

复制并调整 config/firebase.template.json 到自己的 Firebase 项目，提供自己的
site/ 静态内容。模板不包含任何网站文件，也没有构建或发布钩子。
HTML 使用 no-cache，脚本、样式和图片缓存一小时。根页面也要求重新验证。
若不需要 Cloud Run 转发，删除 rewrites 与对应 /services/** 响应头规则。
需要时填写自己的 serviceId 和 region，并审核服务访问策略；不能直接使用占位服务名。

模板的缓存策略不代替资源版本管理。修改过的非哈希资源可能继续命中缓存；
应用需要自行选择文件版本、失效策略和安全响应头。

## Build and Container Templates

构建针对接入方自己的应用源码目录，不是本模块目录：

1. 在自己的应用中整合所需模块和依赖，准备已审核的 package-lock.json。
2. 按需复制 config/Dockerfile 到应用根目录并调整为自己的 Dockerfile。
3. 模板假定应用提供 app/server.js，监听 0.0.0.0 和环境 PORT；实际入口由应用方修改。
4. 将 config/cloudbuild.template.yaml 作为外部构建配置，填写区域、仓库、镜像名与构建身份。

例如，以下命令会上传自己的应用源码并触发构建，可能产生费用：

```sh
gcloud builds submit '<your-application-directory>' \
  --project '<google-cloud-project-id>' \
  --config '<integration-repository>/config/cloudbuild.template.yaml' \
  --substitutions='_REGION=<region>,_REPOSITORY=<repository>,_IMAGE_NAME=<image-name>,_BUILD_SA=<build-service-account-resource>'
```

构建配置只创建镜像并推送 Artifact Registry，不执行 Cloud Run 部署。
应用源码上传规则与 Docker 忽略规则应分别审核，不能把私有工作区整体上传。

## IAM and Runtime Configuration

- 构建身份：限定目标 Artifact Registry 仓库写入、所需构建源读取与日志写入权限。
- 部署身份：服务部署权限，以及对运行服务账号的 actAs 权限。
- 运行身份：按应用需要配置 Firestore 数据访问，例如 roles/datastore.user。
- 平台服务代理：负责 Cloud Run 平台操作及同项目镜像读取，不等同于运行身份。

Firestore Server SDK 由 IAM 授权，不使用浏览器安全规则。集合参数只是代码配置，
不是对服务账号的权限隔离；更小的边界需要在项目、数据库和 IAM 设计中落实。
避免将服务账号 key 提交到源码、容器或静态站点。

## Secret Manager Injection

通过 Cloud Run 部署配置注入应用自己的 secret，不在本包保存值或读取业务凭据。
管理员先创建 secret，并只在对应 secret 上向运行身份授予 secretAccessor。
部署参考如下，需要应用镜像、身份和 secret 已由操作者准备：

```sh
gcloud run deploy '<service-name>' --project '<project-id>' --region '<region>' \
  --image '<artifact-registry-image>' --service-account '<runtime-service-account>' \
  --set-env-vars='ENABLE_GOOGLE_CLOUD=true,GOOGLE_CLOUD_PROJECT=<project-id>,DOCUMENT_COLLECTION=<collection>' \
  --set-secrets='APP_SECRET=<secret-name>:<version>'
```

应用自行决定如何使用 APP_SECRET，不应将其写进日志或返回对象。本模块的运行配置
只返回项目、集合与开关，不返回 secret。实际访问策略、配额、保留策略和依赖锁定
由接入方在自己的环境配置。上述命令是参考，不是本包已执行的操作。

## Rights

原创部分未授予使用或商用许可，见 [RIGHTS.md](../RIGHTS.md)。依赖声明见
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。
