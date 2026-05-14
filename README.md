<h1 align="center">ChatGPT2API</h1>

<p align="center">
  ChatGPT2API 是一个面向自托管场景的 ChatGPT 官网能力封装服务，提供 OpenAI 兼容图片 API、在线创作台、账号池调度、图片库、日志治理和 RBAC 权限管理。
</p>

> [!WARNING]
> 本项目涉及对 ChatGPT 官网文本生成、图片生成、图片编辑等接口的逆向研究，仅供个人学习、技术研究与非商业性技术交流使用。
>
> - 严禁用于商业用途、盈利性使用、批量操作、自动化滥用、规模化调用、倒卖服务或恶意竞争。
> - 严禁用于违反 OpenAI 服务条款、当地法律法规或平台规则的行为。
> - 严禁用于生成、传播或协助生成违法、暴力、色情、未成年人相关内容，以及诈骗、欺诈、骚扰等非法或不当用途。
> - 使用者需自行承担账号受限、临时封禁、永久封禁、数据损失和法律责任等全部风险。
> - 使用本项目即表示你已理解并同意本声明；因滥用、违规或违法使用造成的后果均由使用者自行承担。

> [!CAUTION]
> 公网部署时请务必添加外部访问控制，不要暴露敏感配置、账号 Token、数据库连接串或管理端入口。旧版本可能存在已知漏洞，请尽快升级到最新版本。

## 目录

- [快速入口](#快速入口)
- [项目能力](#项目能力)
- [serv00 部署](#serv00-部署)
- [升级说明](#升级说明)
- [deploy 目录说明](#deploy-目录说明)
- [配置说明](#配置说明)
- [本地开发](#本地开发)
- [发布流程](#发布流程)
- [API 接入](#api-接入)
- [截图](#截图)
- [技术研究文档](#技术研究文档)

## 快速入口

| 目标 | 入口 |
| --- | --- |
| 在 serv00 上部署 | [serv00 部署](#serv00-部署) |
| 理解 `deploy/` 目录用途 | [deploy 目录说明](#deploy-目录说明) |
| 配置管理员、代理、存储 | [配置说明](#配置说明) |
| 本地开发和验证 | [本地开发](#本地开发) |
| 手动发布新版本 | [发布流程](#发布流程) |
| 查看生图接口 | [API 接入](#api-接入) |
| 查看协议研究资料 | [技术研究文档](#技术研究文档) / [jshook 索引](./jshook/README.md) |

## 项目能力

### 后端服务

- Go 单体服务，前端构建产物直接嵌入 Go 二进制。
- 支持 SQLite、PostgreSQL、MySQL 存储后端。
- 支持全局 `http`、`https`、`socks5`、`socks5h` 代理。
- 支持 Release 二进制在线更新和回滚。

### 管理端

- React 19 + Vite 管理端。
- 登录页、创作台、号池管理、图片库、用户管理、角色权限、日志管理和设置页。
- 首次启动自动初始化管理员；未配置密码时会生成一次性管理员密码并输出到日志。
- 支持 LinuxDo OAuth 登录与本地账号共存。
- 支持个人 API 令牌管理。

### 创作与兼容接口

- OpenAI 兼容图片生成接口：`POST /v1/images/generations`
- OpenAI 兼容图片编辑接口：`POST /v1/images/edits`
- 面向图片场景的 Chat Completions：`POST /v1/chat/completions`
- 面向图片工具调用场景的 Responses：`POST /v1/responses`
- Anthropic Messages 风格入口：`POST /v1/messages`
- 异步创作任务资源：`/api/creation-tasks`

## serv00 部署

下面按你当前的发布方式说明，也就是直接使用 GitHub Release 里的 `freebsd amd64` 二进制文件部署到 serv00。

### 1. 准备目录

建议在 serv00 家目录下准备一个固定目录：

```bash
mkdir -p ~/chatgpt2api
cd ~/chatgpt2api
mkdir -p data logs
```

推荐目录结构：

```text
~/chatgpt2api/
├── chatgpt2api
├── .env
├── data/
└── logs/
```

### 2. 下载 Release 文件

当前仓库的 Release 产物只保留 `freebsd amd64` 单个二进制文件。进入 GitHub Releases 页面，下载对应版本的 `chatgpt2api_<version>_freebsd_amd64` 文件。

下载后重命名为 `chatgpt2api`：

```bash
mv chatgpt2api_*_freebsd_amd64 chatgpt2api
chmod +x chatgpt2api
```

如果你是本地上传到 serv00，也保持最终文件名为 `chatgpt2api`。

### 3. 写 `.env`

从仓库根目录的 [.env.example](E:\codex\codex\chatgpt2api\.env.example) 复制一份，至少先配置管理员密码和基础 URL。

最小示例：

```env
CHATGPT2API_ADMIN_USERNAME=admin
CHATGPT2API_ADMIN_PASSWORD=change_me_please
CHATGPT2API_BASE_URL=https://your-domain.serv00.net
STORAGE_BACKEND=sqlite
DATABASE_URL=sqlite:////home/your-user/chatgpt2api/data/chatgpt2api.db
```

如果需要代理：

```env
CHATGPT2API_PROXY=http://127.0.0.1:7890
CHATGPT2API_UPDATE_PROXY_URL=http://127.0.0.1:7890
```

如果要启用 LinuxDo 登录：

```env
CHATGPT2API_LINUXDO_ENABLED=true
CHATGPT2API_LINUXDO_CLIENT_ID=your-client-id
CHATGPT2API_LINUXDO_CLIENT_SECRET=your-client-secret
CHATGPT2API_LINUXDO_REDIRECT_URL=https://your-domain.serv00.net/auth/linuxdo/oauth/callback
CHATGPT2API_LINUXDO_FRONTEND_REDIRECT_URL=/auth/linuxdo/callback
```

### 4. 启动服务

先在 SSH 里前台验证一次：

```bash
cd ~/chatgpt2api
PORT=3000 ./chatgpt2api
```

如果正常，浏览器访问：

```text
http://127.0.0.1:3000
```

第一次前台跑通后，再改成后台方式。最简单可以先用 `nohup`：

```bash
cd ~/chatgpt2api
nohup env PORT=3000 ./chatgpt2api > logs/app.log 2>&1 &
```

查看日志：

```bash
tail -f ~/chatgpt2api/logs/app.log
```

查看进程：

```bash
ps -ef | grep chatgpt2api
```

停止进程：

```bash
pkill -f chatgpt2api
```

### 5. 绑定 serv00 域名

在 serv00 面板里把你的域名或二级域名反代到本地监听端口，例如 `3000`。

部署时要注意两点：

- `CHATGPT2API_BASE_URL` 必须填外部真实访问地址。
- 反代后的域名要能直接访问 `/health` 和首页。

建议验证：

```text
https://your-domain.serv00.net/health
https://your-domain.serv00.net/
```

### 6. 首次登录

如果 `.env` 已设置：

```env
CHATGPT2API_ADMIN_USERNAME=admin
CHATGPT2API_ADMIN_PASSWORD=change_me_please
```

那就直接用这组账号登录后台。

如果没设置 `CHATGPT2API_ADMIN_PASSWORD`，服务首次启动会生成一次性密码，并输出到日志。查看方式：

```bash
grep "bootstrap admin password generated" ~/chatgpt2api/logs/app.log
```

### 7. 常见问题

#### 端口能起来，但外网打不开

优先检查：

- serv00 面板里的域名转发或反代端口是否配置正确
- `PORT` 是否和面板转发目标一致
- `CHATGPT2API_BASE_URL` 是否填成了外网地址

#### 页面能打开，但图片 URL 不对

通常是 `CHATGPT2API_BASE_URL` 没填或者填错。

示例：

```env
CHATGPT2API_BASE_URL=https://your-domain.serv00.net
```

#### 升级后后台打不开

先回滚二进制：

```bash
cd ~/chatgpt2api
mv chatgpt2api chatgpt2api.bad
mv chatgpt2api.backup chatgpt2api
chmod +x chatgpt2api
pkill -f chatgpt2api
nohup env PORT=3000 ./chatgpt2api > logs/app.log 2>&1 &
```

如果没有 `.backup`，就重新下载上一个 Release 版本覆盖。

## 升级说明

### serv00 升级步骤

后续上游有新 Release 时，这个仓库会跟着同步 tag，并自动跑自己的 `Release` workflow。你在 serv00 上只需要替换二进制：

```bash
cd ~/chatgpt2api
pkill -f chatgpt2api
mv chatgpt2api chatgpt2api.backup.$(date +%Y%m%d-%H%M%S)
mv chatgpt2api_<new-version>_freebsd_amd64 chatgpt2api
chmod +x chatgpt2api
nohup env PORT=3000 ./chatgpt2api > logs/app.log 2>&1 &
```

如果你使用的是程序内的在线更新：

- 非 Docker 的 release 构建会检查 GitHub Release
- 下载当前平台匹配的二进制
- 替换当前 `chatgpt2api`
- 保留 `.backup` 以支持回滚

### 当前仓库的 Release 产物

当前仓库只保留一个主要发布资产：

```text
chatgpt2api_<version>_freebsd_amd64
```

也就是给 serv00 这类 FreeBSD `amd64` 环境直接使用的单文件二进制。

## deploy 目录说明

`deploy/` 目录是给 Docker 部署和源码构建准备的，不是给 serv00 直接跑二进制用的。

目录内容：

- [docker-compose.yml](E:\codex\codex\chatgpt2api\deploy\docker-compose.yml)
  Docker Compose 启动文件，使用现成镜像运行服务。
- [Dockerfile](E:\codex\codex\chatgpt2api\deploy\Dockerfile)
  从源码构建镜像时使用的多阶段 Dockerfile，会先构建前端，再构建 Go 二进制。
- [Dockerfile.release](E:\codex\codex\chatgpt2api\deploy\Dockerfile.release)
  给 GoReleaser / Release 流程打包容器镜像用的运行时 Dockerfile。
- [docker-build-limited.sh](E:\codex\codex\chatgpt2api\deploy\docker-build-limited.sh)
  服务器资源有限时，从源码构建 Docker 镜像的辅助脚本，会限制 CPU 和内存，避免 OOM。
- [Dockerfile.dockerignore](E:\codex\codex\chatgpt2api\deploy\Dockerfile.dockerignore)
  Docker 构建上下文过滤规则。

结论：

- 你现在如果是 `serv00 + freebsd 二进制` 部署，`deploy/` 目录基本不用碰。
- 只有你打算改成 Docker 部署，或者在 Linux 服务器上自己构建容器镜像时，才需要它。

## 配置说明

运行时配置统一写入 `.env`。

### 基础配置

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `CHATGPT2API_ADMIN_USERNAME` | `admin` | 初始管理员用户名 |
| `CHATGPT2API_ADMIN_PASSWORD` | 空 | 初始管理员密码；为空时首次启动自动生成一次性密码 |
| `CHATGPT2API_REGISTRATION_ENABLED` | `false` | 是否开放登录页账号注册入口 |
| `CHATGPT2API_BASE_URL` | 空 | 用于生成图片 URL 的外部访问地址 |
| `CHATGPT2API_PROXY` | 空 | 全局代理，支持 `http`、`https`、`socks5`、`socks5h` |
| `CHATGPT2API_UPDATE_PROXY_URL` | 空 | 检查更新访问 Release API 的代理；为空时复用全局代理 |
| `CHATGPT2API_REFRESH_ACCOUNT_INTERVAL_MINUTE` | `5` | 限流账号检查间隔，单位分钟 |
| `CHATGPT2API_IMAGE_TASK_TIMEOUT_SECONDS` | `300` | 图片任务超时时间，单位秒 |
| `CHATGPT2API_USER_DEFAULT_CONCURRENT_LIMIT` | `0` | 普通用户默认创作并发额度；`0` 表示不限制 |
| `CHATGPT2API_USER_DEFAULT_RPM_LIMIT` | `0` | 普通用户默认创作任务 RPM 限制，`0` 表示不限制 |
| `CHATGPT2API_IMAGE_RETENTION_DAYS` | `30` | 服务端缓存图片保留天数 |
| `CHATGPT2API_IMAGE_STORAGE_LIMIT_MB` | `0` | 图片库总容量上限，单位 MB；`0` 表示不按容量自动清理 |
| `CHATGPT2API_LOG_RETENTION_DAYS` | `7` | 业务日志保留天数 |
| `CHATGPT2API_AUTO_REMOVE_INVALID_ACCOUNTS` | `true` | 是否自动移除失效账号 |
| `CHATGPT2API_AUTO_REMOVE_RATE_LIMITED_ACCOUNTS` | `false` | 是否自动移除限流账号 |

### 存储后端

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `STORAGE_BACKEND` | `sqlite` | 存储后端，可选 `sqlite`、`postgres`、`mysql` |
| `DATABASE_URL` | 自动 | SQLite、PostgreSQL 或 MySQL 连接串 |

serv00 上最推荐 SQLite：

```env
STORAGE_BACKEND=sqlite
DATABASE_URL=sqlite:////home/your-user/chatgpt2api/data/chatgpt2api.db
```

### LinuxDo 登录

```env
CHATGPT2API_LINUXDO_ENABLED=true
CHATGPT2API_LINUXDO_CLIENT_ID=your-client-id
CHATGPT2API_LINUXDO_CLIENT_SECRET=your-client-secret
CHATGPT2API_LINUXDO_REDIRECT_URL=https://your-domain.serv00.net/auth/linuxdo/oauth/callback
CHATGPT2API_LINUXDO_FRONTEND_REDIRECT_URL=/auth/linuxdo/callback
```

注意：

- LinuxDo Connect 应用后台应填写后端回调地址：`/auth/linuxdo/oauth/callback`
- `CHATGPT2API_LINUXDO_FRONTEND_REDIRECT_URL` 只给前端页面使用，不要填到 LinuxDo 平台后台

## 本地开发

### 后端

```bash
bun install --cwd web --frozen-lockfile
bun --cwd web run build
go test ./...
go build -tags=embed -ldflags "-X chatgpt2api/internal/version.Version=0.0.0-dev" -o chatgpt2api ./internal
CHATGPT2API_ADMIN_PASSWORD=change_me_please ./chatgpt2api
```

默认监听：

```text
http://127.0.0.1:8000
```

### 前端

```bash
cd web
bun install
bun run dev
```

## 发布流程

项目使用 GitHub Actions + GoReleaser 发布。

### CI

[ci.yml](E:\codex\codex\chatgpt2api\.github\workflows\ci.yml) 在 `main` push 和 pull request 上执行：

- `bun install --frozen-lockfile`
- `bun run build`
- `go test ./...`
- `docker compose -f deploy/docker-compose.yml config`

### Release

[release.yml](E:\codex\codex\chatgpt2api\.github\workflows\release.yml) 在推送 `v*` tag 时触发：

1. 构建前端
2. 下载并嵌入前端 artifact
3. 使用 GoReleaser 构建 `freebsd amd64` 二进制
4. 发布到 GitHub Releases

### 上游同步

[sync-upstream.yml](E:\codex\codex\chatgpt2api\.github\workflows\sync-upstream.yml) 会定时：

1. 拉取上游 `main`
2. 同步上游 `v*` tag
3. 新 tag 推到本仓库后自动触发 `Release`

也就是说，上游发新版本后，这个仓库会跟着生成自己的同版本 Release。

## API 接入

所有受保护的 AI 接口都需要请求头：

```http
Authorization: Bearer <session-or-api-token>
```

后台登录后可以在个人资料或用户管理中创建 API 令牌。

图片生成、图片编辑、异步创作任务、轮询、取消、输出格式、文本型结果和错误码的完整说明见 [生图接口文档](./docs/image-generation-api.md)

### 常用接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/health` | 健康检查 |
| `GET` | `/version` | 当前版本 |
| `GET` | `/v1/models` | 模型列表 |
| `POST` | `/v1/images/generations` | OpenAI 兼容图片生成 |
| `POST` | `/v1/images/edits` | OpenAI 兼容图片编辑 |
| `POST` | `/v1/chat/completions` | 面向图片场景的 Chat Completions |
| `POST` | `/v1/responses` | 面向图片工具调用场景的 Responses |
| `POST` | `/v1/messages` | Anthropic Messages 风格入口 |
| `GET` | `/api/creation-tasks?ids=<id1,id2>` | 查询异步创作任务 |
| `POST` | `/api/creation-tasks/image-generations` | 提交图片生成任务 |
| `POST` | `/api/creation-tasks/image-edits` | 提交图片编辑任务 |
| `POST` | `/api/creation-tasks/chat-completions` | 提交文本/对话补全任务 |
| `POST` | `/api/creation-tasks/{id}/cancel` | 取消任务 |

## 截图

以下截图均来自仓库的 `assets/` 目录。

<table>
  <tr>
    <td width="50%">
      <strong>创作台</strong><br />
      <img src="assets/image.png" alt="创作台" />
    </td>
    <td width="50%">
      <strong>任务队列</strong><br />
      <img src="assets/duilie.png" alt="任务队列" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>图片库</strong><br />
      <img src="assets/tuku.png" alt="图片库" />
    </td>
    <td width="50%">
      <strong>提示词管理</strong><br />
      <img src="assets/prompts.png" alt="提示词管理" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>号池管理</strong><br />
      <img src="assets/account_pool.png" alt="号池管理" />
    </td>
    <td width="50%">
      <strong>角色与权限</strong><br />
      <img src="assets/rabc.png" alt="角色与权限" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>日志管理</strong><br />
      <img src="assets/log.png" alt="日志管理" />
    </td>
    <td width="50%">
      <strong>注册管理</strong><br />
      <img src="assets/zhuceji.png" alt="注册管理" />
    </td>
  </tr>
</table>

## 技术研究文档

项目包含对 ChatGPT 官网生图链路的逆向分析，详见 `jshook/` 目录：

| 文档 | 说明 |
| --- | --- |
| [jshook 总索引](./jshook/README.md) | 完整入口 |
| [生图链路技术分析](./jshook/docs/ChatGPT-gpt-image-2-generation-pipeline-analysis.md) | 模型路由、画质控制、改图流程 |
| [上游 SSE 协议分析](./jshook/docs/upstream-sse-conversation.md) | SSE 流式响应格式与事件序列 |
| [API 端点清单](./jshook/docs/api-endpoints.md) | 完整 API 端点列表 |
| [认证 API Schema](./jshook/docs/authenticated-api-schema.md) | 实抓验证的认证生图 API Schema |
