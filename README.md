# onlikee

onlikee 是一个前后端分离的项目仓库，包含 Spring Boot 后端与 Vue 3 前端。当前实现涵盖 GitHub/Gitee OAuth 登录、JWT 认证基础、应用/组件展示页面与名片页面等模块。

## 技术栈

- 后端：Spring Boot 4.0.2、Java 25、MyBatis、PostgreSQL 18、JWT（jjwt）、JustAuth（GitHub/Gitee OAuth）
- 前端：Vue 3、Vite、TypeScript、Tailwind CSS、Vue Router、Axios、Reka UI、GSAP、Monaco Editor

## 目录结构

- `onlikee-backend/`：后端服务
- `onlikee-frontend/`：前端应用

## 快速开始

### 后端

1) 配置 `onlikee-backend/src/main/resources/application.properties`（数据库、OAuth、JWT）。
2) 确认 PostgreSQL 已具备所需业务表后启动服务：

```bash
cd onlikee-backend
mvn spring-boot:run
```

后端默认端口为 `8080`。

### 创建并发布应用

`POST /application/create/new` 使用 `multipart/form-data` 接收应用信息与 `appFile`。`appFile` 必须是 ZIP 应用包，HTML、Vue、React 使用同一上传格式：

- ZIP 根目录直接包含 `index.html`；或
- ZIP 只包含一个顶层构建目录，并由该目录包含 `index.html`。

HTML 创建页面继续提供代码编辑器，提交时由浏览器自动生成包含根目录 `index.html` 的 `dist.zip`；Vue 和 React 上传包含构建产物的 ZIP。接口不再接受单独的 `.html` 文件。

### 前端

```bash
cd onlikee-frontend
npm install
npm run dev
```

前端开发服务器默认端口为 `5173`，访问 `http://localhost:5173`。

## 配置说明

### 后端配置（Spring Boot）

配置文件：`onlikee-backend/src/main/resources/application.properties`

常用配置项：

- `spring.datasource.url` / `spring.datasource.username` / `spring.datasource.password`
- `github.oauth.client-id` / `github.oauth.client-secret` / `github.oauth.redirect-uri`
- `gitee.oauth.client-id` / `gitee.oauth.client-secret` / `gitee.oauth.redirect-uri`
- `security.jwt.secret` / `security.jwt.expire-seconds`

建议将敏感信息替换为本地或环境变量配置，避免直接提交到仓库。

PostgreSQL 连接固定使用 `Asia/Shanghai` 时区，历史日期保留本地时间语义。昵称、邮箱及 URL 采用 PostgreSQL 默认的大小写敏感比较。

### 前端配置（Vite）

可在 `onlikee-frontend/.env.local` 中配置：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

若未配置，默认使用 `http://localhost:8080` 作为接口地址。

前端请求封装会按 `{ code, message, data }` 结构解析响应，`code === "OK"` 视为成功；同时支持 `Authorization: Bearer <token>` 认证头。

## OAuth 登录相关接口

- GitHub：
  - 授权入口：`/oauth/github/render`
  - 回调地址：`/oauth/github/callback`
- Gitee：
  - 授权入口：`/oauth/gitee/render`
  - 回调地址：`/oauth/gitee/callback`

请确保第三方平台配置的回调地址与后端配置保持一致。

## 构建与预览

### 前端

```bash
npm run build
npm run preview
```

### 后端

```bash
mvn -DskipTests package
java -jar target/onlikee-0.0.1-SNAPSHOT.jar
```
