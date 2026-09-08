# AGENTS.md

你是一个顶级后端架构师，本文件为 `onlikee/onlikee-backend` 模块的约束与规范文档，补充工作区级规则。后续对该后端项目的修改，默认遵循本文件。

## 增加新功能

- 新增功能前，先判断是否已有可复用代码；若存在可复用代码，进一步评估这段代码当前所在位置是否合理。
- 如果被复用的代码位置不合理，先将其抽取或迁移到更通用、更稳定、更符合分层职责的公共位置，再基于复用后的结构实现新功能。
- 复用或抽取公共代码时，优先保证职责单一、命名清晰、边界明确，避免为了当前需求做过度抽象。
- 新增功能时，应尽量沿用现有约定与实现模式，保持模块划分、接口风格、目录结构和错误处理方式的一致性。
- 设计实现方案时，优先控制复杂度；如果新增逻辑会显著增加耦合、分支数量或理解成本，应先优化结构，再继续开发。
- 涉及现有接口、配置、数据结构或用户可见行为时，必须评估兼容性影响，避免引入隐式破坏性变更。
- 新增功能应补充必要的测试，包括但不限于单元测试、集成测试或关键路径验证；测试应覆盖正常流程、边界情况和主要失败路径。
- 若新增功能改变了使用方式、配置方式、接口行为或约束条件，应同步更新相关文档、注释、README 或示例。
- 对于重构和功能修改，尽量拆分为职责清晰的独立改动，避免将大规模格式化、重命名和功能变更混在同一次提交中。

## 项目定位

- 技术栈以仓库当前内容为准：Spring Boot 4.0.2、Java 25、Maven、MyBatis、PostgreSQL、Redis、JWT、JustAuth、Lombok。
- 当前后端的业务模块统一放在 `com.onlikee.module` 下：`module.application`、`module.user`、`module.auth`，业务内部按 `controller`、`service`（按需设置 `impl`）、`mapper`、`converter`、`model` 分层。OAuth 登录注册放在 `module.auth.oauth`。
- `infrastructure.cache/storage/web` 分别放 Redis、Light OSS 客户端和 Web 配置；`common.response/exception/util` 放统一响应、异常和通用工具。只创建已有实现需要的目录。

## 分层职责

- `controller` 只负责接口路由、参数绑定、鉴权入口、调用 service、返回 `ApiResponse`。
- `service` 负责业务编排、事务、调用 mapper、调用外部服务、失败补偿。
- `mapper` 负责数据库访问，当前项目统一使用 MyBatis 注解 SQL，不使用 XML mapper。
- `converter` 只负责对象转换，保持纯静态工具类，不放数据库、网络、缓存等副作用逻辑。
- 所属业务包的 `model.entity` 放实体对象，`model.dto` 放跨层、跨服务及外部接口传输数据对象，`model.vo` 放向前端返回的展示数据对象；模型目录不再按 request/response 嵌套。
- `module.auth.service` 放 JWT、Cookie、会话白名单等认证相关能力；新增鉴权逻辑优先复用这一层。

## DTO、VO、Entity 与转换规则

- DTO 表示 `Data Transfer Object`，用于 Controller 接收参数、Service 之间传递数据、微服务之间传输数据及第三方接口数据封装；既可表示输入，也可表示内部处理结果。
- VO 表示 `View Object`（视图对象），用于向前端返回展示数据，通常是接口最终响应结构或其嵌套展示对象；不用于仅在服务之间传递的中间结果。
- 新增传输对象放在所属业务包的 `model.dto`，命名以 `DTO` 结尾。
- 接口接收到的业务入参默认先绑定到对应 DTO；不要在 controller 方法里直接接收零散业务字段，除非是 Spring 必需的基础入参（如 `@CookieValue`、文件上传绑定对象等）。
- 一个接口的请求字段、必填性、格式约束和跨字段请求级校验，应优先集中在对应 DTO 中声明，保证请求契约集中可见。
- 新增前端展示对象放在所属业务包的 `model.vo`，命名以 `VO` 结尾。
- VO 可以由 Service 构建并直接作为最终响应返回；仅因它由 Service 返回，不必额外复制一层 DTO。内部登录 token、OAuth 中间结果及待注册流程结果使用 DTO，在响应边界转换为 VO。
- 实体对象放在所属业务包的 `model.entity`，保持与数据库字段语义一致，类名使用单数形式并以 `Entity` 结尾。
- 模型转换按目标类型放到所属业务 `converter` 包的 `ToEntity`、`ToDTO`、`ToVO` 中，跨业务复用所属模块的转换方法；不要把转换逻辑散落在 controller 或 mapper 里。
- 当前简单数据对象普遍使用 Lombok `@Data`；新增同类对象时沿用这一模式。

## Controller 约定

- 使用 `@RestController` + 类级 `@RequestMapping` 组织路由。
- 成功响应统一返回 `ApiResponse<T>`，优先使用 `ApiResponse.success(...)`。
- 不要在 controller 中直接拼失败响应；业务失败统一抛 `BizException`，交给全局异常处理器。
- 需要登录态的接口，沿用 `@CookieValue(value = "auth_token", required = false)` 读取 token，再通过 `SessionAuthService` 获取当前用户。
- multipart/form-data 接口沿用 `@PostMapping(..., consumes = MediaType.MULTIPART_FORM_DATA_VALUE)`、`@ModelAttribute`、`@Valid` 这一套绑定方式。
- controller 不直接操作数据库，不直接写 JWT，不直接手拼 `Set-Cookie`。

## Service 约定

- Service 按实际职责选择接口或具体类，不强制为每个 Service 创建接口。只有一个实现且没有明确契约抽象需求的服务，直接以 `@Service` 具体类放在 `service` 下。
- 需要明确的模块对外能力契约或可替换实现时，接口放在 `service` 下，实现放在 `service.impl` 下；不要仅为未来可能扩展而新增接口。
- 当前 `UserService` 保留用户模块对外能力契约，`ApplicationSitePublishService` 保留隔离 SDK 模型的发布及补偿契约；应用创建、用户资料和 OAuth 登录注册服务使用具体类。JWT、Cookie、会话服务沿用具体类。
- service 负责业务主流程、跨表操作、外部系统调用与必要的失败补偿。
- 多步数据库写入或“写库 + 写外部系统”的流程，按现有模式在 service 层组织；需要事务时显式加 `@Transactional`。
- 对外部副作用先执行、数据库后落库的流程，必须考虑回滚或清理。例如已发布站点但数据库写入失败时，要执行清理逻辑。
- 修改现有类时，沿用该类附近既有注入风格：
  - 业务 service 当前多使用字段注入 `@Autowired`
  - 安全/基础设施类当前多使用构造器注入
- 不要为了“统一风格”顺手全量改注入方式。

## Mapper 与 SQL 约定

- mapper 使用 `@Mapper` 接口 + 注解 SQL；没有充分理由时，不引入 XML mapper。
- 多行 SQL 使用 Java 文本块 `"""`，并保持与现有 mapper 一致的排版。
- 有多个简单参数时使用 `@Param` 明确命名。
- 数据库字段保持下划线命名，Java 字段保持驼峰命名，依赖现有的 `map-underscore-to-camel-case=true`。
- SQL 使用 PostgreSQL 语法；保留字表名 `user` 统一使用 `"user"`，其余小写下划线标识符不加引号，不使用 MySQL 反引号。
- 写操作返回受影响行数时，由 service 判断结果是否符合预期；不要在 mapper 层吞掉失败。

## 参数校验与异常处理

- 请求参数校验优先放在 DTO 上，优先使用 `jakarta.validation` 注解；controller 只负责通过 `@Valid` / `@Validated` 触发校验，不在 controller 中重复写字段合法性判断。
- 文件上传这类无法直接用 `@NotBlank` 表达的约束，沿用当前 `@AssertTrue` 自定义校验方法的写法。
- 仅依赖请求自身数据的规则（如必填、长度、枚举值、URL/邮箱格式、字段组合约束）放在 DTO；依赖当前用户、数据库唯一性、外部服务状态等业务上下文的规则放在 service。
- 新增业务错误时，先补充 `ErrorCode`，再在业务中抛出 `BizException(ErrorCode.XXX)`。
- 非必要不要直接 new 通用 `RuntimeException` 表达业务失败。
- 统一依赖 `GlobalExceptionHandler` 输出错误响应；不要在各个 controller 中重复写 try/catch。
- 当前 `NOT_LOGIN` 的返回策略是业务码表示未登录，但 HTTP 状态仍为 `200 OK`。这是现有前后端契约，除非任务明确要求，否则不要擅自改动。
- 如果 `ErrorCode`中没有对应的错误能够较好的反馈该种错误，应当优先考虑新增`ErrorCode`。

## 认证与安全约定

- JWT 的生成与解析统一通过 `JwtTokenService`。
- token 的白名单、失效、当前用户解析统一通过 `SessionAuthService`。
- Cookie 的写入与清理由 `AuthCookieService` 统一处理；不要在 controller 或 filter 中手写 Cookie 头。
- 新增登录、登出、会话失效相关逻辑时，先复用现有 `JwtTokenService`、`SessionAuthService`、`AuthCookieService`，不要旁路实现第二套 token 机制。
- OAuth 回调控制器负责第三方授权交互和写 cookie；用户注册/登录/更新逻辑放在对应 service 中。

## 配置与外部服务

- 配置项默认写在 `src/main/resources/application.properties`，读取方式沿用 `@Value` 或现有配置类注入方式。
- 涉及数据库、Redis、OAuth、JWT、Light OSS 的配置键名时，优先复用已有命名，不要发明新的同义配置。
- 除非任务明确要求，不要顺手改动现有敏感配置值，也不要在提交说明里重复抄出密钥内容。
- 应用发布保持 `ApplicationCreateService → ApplicationSitePublishService → LightOssClient`：业务服务负责 ZIP 规则、SDK 错误翻译与失败补偿，`infrastructure.storage.LightOssConfig` 提供共享 SDK 客户端。
- 应用域名配置和地址构建放在 `module.application.util.ApplicationUrlUtils`；通用 URL 校验、协议补全和规范化放在 `common.util.UrlUtils`。

## 注释与代码风格

- 每段功能都必须添加注释，以便维护。
- 注释应重点说明“为什么这样做”，而不是简单复述“代码做了什么”。
- 保持当前风格：类名、方法名、字段名使用英文；代码注释以中文为主，必要时可混合英文术语。
- 不要为了“更高级”引入与现有代码不一致的大型抽象、通用基类、响应包装器或对象映射框架。

## 修改边界

- 不要把当前 MyBatis 注解 SQL 改造成 JPA、MyBatis XML 或 Repository 体系，除非任务明确要求。
- 统一使用 `DTO/VO/Entity` 后缀，与 `model.dto/vo/entity` 目录对应；不要引入其他并行命名体系。
- 不要擅自修改统一响应结构 `{ code, message, data }`。
- 不要在无明确需求时修改登录态载体、Cookie 名、JWT 结构、Redis key 规则、应用 URL 拼接规则等既有契约。
