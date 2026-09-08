package com.onlikee;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.time.LocalDateTime;
import java.util.Properties;
import java.util.UUID;

import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.module.application.mapper.ApplicationCreateMapper;
import com.onlikee.module.application.model.entity.ApplicationCollectEntity;
import com.onlikee.module.application.model.entity.ApplicationConnectEntity;
import com.onlikee.module.application.model.entity.ApplicationNewEntity;
import com.onlikee.module.auth.oauth.mapper.AuthGiteeMapper;
import com.onlikee.module.auth.oauth.mapper.AuthGithubMapper;
import com.onlikee.module.auth.oauth.model.entity.UserGiteeEntity;
import com.onlikee.module.auth.oauth.model.entity.UserGithubEntity;
import com.onlikee.module.auth.oauth.service.OAuthSignupService;
import com.onlikee.module.user.mapper.UserMapper;
import com.onlikee.module.user.mapper.UserProfileMapper;
import com.onlikee.module.user.model.entity.UserEntity;

@EnabledIfSystemProperty(named = "onlikee.pg.integration", matches = "true")
class PostgresMapperIntegrationTest {

    private static final Properties PROPERTIES = new Properties();
    private SingleConnectionDataSource dataSource;
    private DataSourceTransactionManager transactions;
    private TransactionStatus transaction;
    private JdbcTemplate jdbc;
    private SqlSessionTemplate session;
    private UserMapper users;
    private UserProfileMapper profiles;
    private AuthGithubMapper github;
    private AuthGiteeMapper gitee;
    private ApplicationCreateMapper applications;
    private String schema;

    @BeforeAll
    // 仅显式启用时读取本地配置，默认测试不连接外部数据库。
    static void readLocalConfiguration() throws Exception {
        try (var reader = Files.newBufferedReader(Path.of("src/main/resources/application.properties"),
                StandardCharsets.UTF_8)) {
            PROPERTIES.load(reader);
        }
        assertTrue(PROPERTIES.getProperty("spring.datasource.url").startsWith("jdbc:postgresql:"));
        assertEquals("org.postgresql.Driver", PROPERTIES.getProperty("spring.datasource.driver-class-name"));
        assertEquals("never", PROPERTIES.getProperty("spring.sql.init.mode"));
    }

    @BeforeEach
    // 每个测试的表、数据和序列都在独立 schema 的事务内，回滚即清理，不触及 public。
    void createIsolatedSchema() throws Exception {
        Connection connection = openConnection();
        dataSource = new SingleConnectionDataSource(connection, true);
        transactions = new DataSourceTransactionManager(dataSource);
        transaction = transactions.getTransaction(new DefaultTransactionDefinition());
        jdbc = new JdbcTemplate(dataSource);
        schema = "onlikee_pg_test_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + schema);
        jdbc.execute("SET LOCAL search_path TO " + schema);
        createTestTables();
        session = new SqlSessionTemplate(sessionFactory(dataSource));
        users = session.getMapper(UserMapper.class);
        profiles = session.getMapper(UserProfileMapper.class);
        github = session.getMapper(AuthGithubMapper.class);
        gitee = session.getMapper(AuthGiteeMapper.class);
        applications = session.getMapper(ApplicationCreateMapper.class);
    }

    @AfterEach
    // 即使断言或 SQL 失败，也回滚整个 schema；检查未留下测试对象。
    void rollbackSchema() {
        try {
            if (transaction != null) {
                transactions.rollback(transaction);
                assertEquals(0, jdbc.queryForObject(
                        "SELECT count(*) FROM pg_namespace WHERE nspname = ?", Integer.class, schema));
            }
        } finally {
            if (dataSource != null) {
                dataSource.destroy();
            }
        }
    }

    @Test
    // 验证保留字表名、实体映射、登录时间及资料写入，并锁定新的大小写敏感语义。
    void shouldReadAndUpdateUsersWithCaseSensitiveUniqueness() {
        UserEntity user = user("u1", "Tester", "Test@example.com");
        assertEquals(1, users.insertUser(user));
        UserEntity stored = users.getUserByUuid("u1");
        assertNotNull(stored.getId());
        assertNotNull(stored.getCreatedAt());
        assertEquals("Tester", stored.getNickName());
        assertNull(stored.getAvatarUrl());
        assertEquals(1, users.countByNickname("Tester"));
        assertEquals(0, users.countByNickname("tester"));
        assertEquals(1, users.countByEmail("Test@example.com"));
        assertEquals(0, users.countByEmail("test@example.com"));
        assertNull(profiles.getUserByNickname("tester"));
        assertEquals("u1", profiles.getUserByNickname("Tester").getUuid());
        assertEquals(1, users.insertUser(user("u2", "tester", "test@example.com")));
        assertTrue(users.getUserByUuid("u2").getId() > stored.getId());

        LocalDateTime loginAt = LocalDateTime.of(2026, 9, 9, 8, 12, 34);
        assertEquals(1, users.updateUserLastLoginByUuid("u1", loginAt, "GITHUB_OAUTH"));
        assertEquals(loginAt, users.getUserByUuid("u1").getLastLoginAt());
        assertEquals(1, users.insertUserLoginRecord("u1", "GITHUB_OAUTH"));
        assertEquals("GITHUB_OAUTH", jdbc.queryForObject(
                "SELECT login_source FROM user_login_record WHERE uuid = 'u1'", String.class));
        assertNotNull(jdbc.queryForObject("SELECT login_at FROM user_login_record WHERE uuid = 'u1'",
                LocalDateTime.class));

        assertEquals(1, profiles.updateCurrentUserProfile("u1", "中文简介🙂", "they", "上海", "", null, "link"));
        stored = users.getUserByUuid("u1");
        assertEquals("中文简介🙂", stored.getBio());
        assertEquals("上海", stored.getLocation());
        assertEquals("", stored.getSocialAccount0());
        assertNull(stored.getSocialAccount1());
        assertEquals("link", stored.getSocialAccount2());
        assertEquals(0, profiles.updateCurrentUserProfile("missing", null, null, null, null, null, null));
    }

    @Test
    // 用真实 PostgreSQL 唯一约束异常验证 Spring 翻译及现有注册业务错误映射。
    void shouldTranslateUserDuplicateKeysToBusinessErrors() {
        users.insertUser(user("u1", "Tester", "test@example.com"));
        assertBusinessError(duplicate(() -> users.insertUser(user("u2", "Tester", "other@example.com"))),
                ErrorCode.NICKNAME_ALREADY_EXISTS);
        assertBusinessError(duplicate(() -> users.insertUser(user("u3", "Other", "test@example.com"))),
                ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    @Test
    // 两种 OAuth 的默认组合方法、JOIN 和 token 更新均执行真实 SQL，测试 token 不含真实凭据。
    void shouldInsertJoinAndUpdateBothOAuthProviders() {
        UserGithubEntity gh = new UserGithubEntity();
        gh.setUuid("gh1");
        gh.setGithubId(9007199254740993L);
        gh.setName("GitHub 用户");
        gh.setGithubToken("test-github-token");
        github.saveUserGithubAndUser(gh, user("gh1", "GithubUser", "gh@example.com"));
        assertEquals(1, github.countByGithubId(gh.getGithubId()));
        assertEquals("gh1", users.getUserByGithubId(gh.getGithubId()).getUuid());
        assertNull(users.getUserByGithubId(1L));
        gh.setBio("更新🙂");
        gh.setGithubToken("test-github-token-updated");
        assertEquals(1, github.updateUserGithubByGithubId(gh));
        assertEquals("test-github-token-updated", jdbc.queryForObject(
                "SELECT github_token FROM user_github WHERE github_id = ?", String.class, gh.getGithubId()));
        assertBusinessError(duplicate(() -> github.insertUserGithub(gh)), ErrorCode.OAUTH_ACCOUNT_ALREADY_BOUND);

        UserGiteeEntity gt = new UserGiteeEntity();
        gt.setUuid("gt1");
        gt.setGiteeId(9007199254740995L);
        gt.setName("Gitee 用户");
        gt.setGiteeToken("test-gitee-token");
        gitee.saveUserGiteeAndUser(gt, user("gt1", "GiteeUser", "gt@example.com"));
        assertEquals(1, gitee.countByGiteeId(gt.getGiteeId()));
        assertEquals("gt1", users.getUserByGiteeId(gt.getGiteeId()).getUuid());
        assertNull(users.getUserByGiteeId(1L));
        gt.setBio("更新🙂");
        gt.setGiteeToken("test-gitee-token-updated");
        assertEquals(1, gitee.updateUserGiteeByGiteeId(gt));
        assertEquals("test-gitee-token-updated", jdbc.queryForObject(
                "SELECT gitee_token FROM user_gitee WHERE gitee_id = ?", String.class, gt.getGiteeId()));
        assertBusinessError(duplicate(() -> gitee.insertUserGitee(gt)), ErrorCode.OAUTH_ACCOUNT_ALREADY_BOUND);
    }

    @Test
    // 覆盖三类应用的所有 Mapper 方法及各自唯一约束；URL 路径大小写可以区分。
    void shouldCreateAllApplicationTypesAndRejectDuplicates() {
        ApplicationNewEntity app = new ApplicationNewEntity();
        app.setAppid(UUID.randomUUID().toString());
        app.setOwnerUuid("owner1");
        app.setFramework("HTML");
        app.setAppName("测试应用🙂");
        app.setAppSubDomain("demo");
        app.setVisibility("public");
        app.setAppDescription("");
        app.setOriginalFilename("dist.zip");
        app.setOriginalFileSize("1 KB");
        assertEquals(0, applications.countNewByAppSubDomain("demo"));
        assertEquals(1, applications.insertApplicationNew(app));
        assertEquals(1, applications.countNewByAppSubDomain("demo"));
        assertEquals(0, applications.countNewByAppSubDomain("Demo"));
        app.setAppid(UUID.randomUUID().toString());
        assertTrue(duplicate(() -> applications.insertApplicationNew(app)).getMessage()
                .contains("uk_application_new_app_subdomain"));
        assertNotNull(jdbc.queryForObject("SELECT created_at FROM application_new", LocalDateTime.class));

        ApplicationConnectEntity connect = new ApplicationConnectEntity();
        connect.setAppid(UUID.randomUUID().toString());
        connect.setOwnerUuid("owner1");
        connect.setAppName("连接");
        connect.setAppUrl("https://example.com/Path");
        connect.setVisibility("public");
        connect.setAppDescription("");
        assertEquals(0, applications.countConnectByAppUrl(connect.getAppUrl()));
        assertEquals(1, applications.insertApplicationConnect(connect));
        assertEquals(1, applications.countConnectByAppUrl(connect.getAppUrl()));
        assertEquals(0, applications.countConnectByAppUrl("https://example.com/path"));
        connect.setAppid(UUID.randomUUID().toString());
        assertTrue(duplicate(() -> applications.insertApplicationConnect(connect)).getMessage()
                .contains("uk_application_connect_app_url"));
        connect.setAppUrl("https://example.com/path");
        assertEquals(1, applications.insertApplicationConnect(connect));

        ApplicationCollectEntity collect = new ApplicationCollectEntity();
        collect.setAppid(UUID.randomUUID().toString());
        collect.setOwnerUuid("owner1");
        collect.setAppName("收藏");
        collect.setAppUrl("https://example.com/Path");
        collect.setVisibility("public");
        collect.setAppDescription("");
        assertEquals(0, applications.countCollectByAppUrl(collect.getAppUrl()));
        assertEquals(1, applications.insertApplicationCollect(collect));
        assertEquals(1, applications.countCollectByAppUrl(collect.getAppUrl()));
        assertEquals(0, applications.countCollectByAppUrl("https://example.com/path"));
        collect.setAppid(UUID.randomUUID().toString());
        assertTrue(duplicate(() -> applications.insertApplicationCollect(collect)).getMessage()
                .contains("uk_application_collect_app_url"));
        collect.setAppUrl("https://example.com/path");
        assertEquals(1, applications.insertApplicationCollect(collect));
    }

    @Test
    // 验证 upsert、20000 字符、换行和清空；直接 UPDATE 验证数据库自动更新时间。
    void shouldUpsertMarkdownAndMaintainUpdateTimestamp() {
        assertNull(profiles.getMarkdownByUuid("u1"));
        String content = "中文🙂\n'\\" + "a".repeat(19993);
        assertEquals(20000, content.length());
        assertEquals(1, profiles.upsertMarkdown("u1", content));
        var initial = profiles.getMarkdownByUuid("u1");
        assertEquals(content, initial.getContent());
        assertNotNull(initial.getCreatedAt());
        assertNotNull(initial.getUpdatedAt());
        assertEquals(1, profiles.upsertMarkdown("u1", content));
        assertEquals(1, profiles.upsertMarkdown("u1", ""));
        var cleared = profiles.getMarkdownByUuid("u1");
        assertEquals(initial.getId(), cleared.getId());
        assertEquals(initial.getCreatedAt(), cleared.getCreatedAt());
        assertEquals("", cleared.getContent());
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM user_profile_markdown", Integer.class));

        LocalDateTime past = LocalDateTime.of(2020, 1, 1, 0, 0);
        jdbc.update("UPDATE user_profile_markdown SET updated_at = ? WHERE uuid = 'u1'", past);
        jdbc.update("UPDATE user_profile_markdown SET content = content WHERE uuid = 'u1'");
        assertEquals(past, jdbc.queryForObject("SELECT updated_at FROM user_profile_markdown", LocalDateTime.class));
        jdbc.update("UPDATE user_profile_markdown SET content = 'changed' WHERE uuid = 'u1'");
        assertTrue(jdbc.queryForObject("SELECT updated_at FROM user_profile_markdown", LocalDateTime.class).isAfter(past));
        jdbc.update("UPDATE user_profile_markdown SET content = 'explicit', updated_at = ? WHERE uuid = 'u1'", past);
        assertEquals(past, jdbc.queryForObject("SELECT updated_at FROM user_profile_markdown", LocalDateTime.class));
    }

    @Test
    // 单独使用实际配置建立只读连接，验证迁移后的 public 表可以被业务 Mapper 读取。
    void shouldReadMigratedDatabaseUsingActualConfiguration() throws Exception {
        try (Connection connection = openConnection()) {
            connection.setReadOnly(true);
            var readOnlySource = new SingleConnectionDataSource(connection, true);
            var readOnlyJdbc = new JdbcTemplate(readOnlySource);
            assertEquals("onlikee", readOnlyJdbc.queryForObject("SELECT current_database()", String.class));
            assertEquals("Asia/Shanghai", readOnlyJdbc.queryForObject("SHOW TimeZone", String.class));
            assertEquals("public", readOnlyJdbc.queryForObject("SELECT current_schema()", String.class));
            // 独立只读校验不交给 Spring 管理，使用原生会话后可由 try-with-resources 正确关闭。
            try (var readOnlySession = sessionFactory(readOnlySource).openSession()) {
                var readOnlyUsers = readOnlySession.getMapper(UserMapper.class);
                var readOnlyProfiles = readOnlySession.getMapper(UserProfileMapper.class);
                for (String uuid : readOnlyJdbc.queryForList("SELECT uuid FROM public.\"user\"", String.class)) {
                    UserEntity user = readOnlyUsers.getUserByUuid(uuid);
                    assertNotNull(user);
                    assertEquals(uuid, readOnlyProfiles.getUserByNickname(user.getNickName()).getUuid());
                    readOnlyProfiles.getMarkdownByUuid(uuid);
                }
            }
        }
    }

    // 失败语句只回滚到保存点，避免 PostgreSQL 中止事务影响后续断言。
    private DuplicateKeyException duplicate(Runnable action) {
        Object savepoint = transaction.createSavepoint();
        try {
            return assertThrows(DuplicateKeyException.class, action::run);
        } finally {
            transaction.rollbackToSavepoint(savepoint);
            transaction.releaseSavepoint(savepoint);
            session.clearCache();
        }
    }

    private static void assertBusinessError(DuplicateKeyException duplicate, ErrorCode expected) {
        BizException error = assertThrows(BizException.class, () -> ReflectionTestUtils.invokeMethod(
                new OAuthSignupService(), "throwDuplicateKeyBizException", duplicate));
        assertEquals(expected.getCode(), error.getCode());
    }

    private static UserEntity user(String uuid, String nickname, String email) {
        UserEntity user = new UserEntity();
        user.setUuid(uuid);
        user.setNickName(nickname);
        user.setEmail(email);
        user.setLastLoginSource("GITHUB_OAUTH");
        return user;
    }

    private static Connection openConnection() throws Exception {
        return DriverManager.getConnection(PROPERTIES.getProperty("spring.datasource.url"),
                PROPERTIES.getProperty("spring.datasource.username"),
                PROPERTIES.getProperty("spring.datasource.password"));
    }

    // 测试在随机 schema 内自建最小结构，不依赖已删除的数据库脚本或 public 业务表。
    private void createTestTables() {
        jdbc.execute("""
                CREATE TABLE "user" (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    uuid varchar(11) NOT NULL,
                    nickname varchar(20) NOT NULL,
                    email varchar(50) NOT NULL,
                    avatar_url varchar(512), bio varchar(255), pronoun varchar(10), location varchar(100),
                    social_account_0 varchar(255), social_account_1 varchar(255), social_account_2 varchar(255),
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    last_login_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    last_login_source varchar(20),
                    CONSTRAINT uk_user_nickname UNIQUE (nickname),
                    CONSTRAINT uk_user_email UNIQUE (email)
                )
                """);
        jdbc.execute("""
                CREATE TABLE user_github (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, uuid varchar(11) NOT NULL,
                    github_id bigint NOT NULL, name varchar(255), avatar_url varchar(512), email varchar(255),
                    bio varchar(512), html_url varchar(512), github_token varchar(255),
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_user_github_github_id UNIQUE (github_id)
                )
                """);
        jdbc.execute("""
                CREATE TABLE user_gitee (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, uuid varchar(11) NOT NULL,
                    gitee_id bigint NOT NULL, name varchar(255), avatar_url varchar(512), email varchar(255),
                    bio varchar(512), html_url varchar(512), gitee_token varchar(255),
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_user_gitee_gitee_id UNIQUE (gitee_id)
                )
                """);
        jdbc.execute("""
                CREATE TABLE user_login_record (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, uuid varchar(11) NOT NULL,
                    login_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP, login_source varchar(20)
                )
                """);
        jdbc.execute("""
                CREATE TABLE user_profile_markdown (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, uuid varchar(11) NOT NULL,
                    content text NOT NULL, created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_user_profile_markdown_uuid UNIQUE (uuid)
                )
                """);
        jdbc.execute("""
                CREATE FUNCTION touch_user_profile_markdown_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN
                    IF NEW IS DISTINCT FROM OLD AND NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
                        NEW.updated_at := CURRENT_TIMESTAMP;
                    END IF;
                    RETURN NEW;
                END;
                $$
                """);
        jdbc.execute("""
                CREATE TRIGGER user_profile_markdown_updated_at
                BEFORE UPDATE ON user_profile_markdown
                FOR EACH ROW EXECUTE FUNCTION touch_user_profile_markdown_updated_at()
                """);
        jdbc.execute("""
                CREATE TABLE application_new (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, appid char(36) NOT NULL,
                    owner_uuid varchar(11) NOT NULL, framework varchar(255) NOT NULL, app_name varchar(255) NOT NULL,
                    app_subdomain varchar(63) NOT NULL, visibility varchar(255) NOT NULL,
                    app_description varchar(1000) NOT NULL, original_filename varchar(255) NOT NULL,
                    original_file_type varchar(255), original_file_size varchar(255) NOT NULL,
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_application_new_appid UNIQUE (appid),
                    CONSTRAINT uk_application_new_app_subdomain UNIQUE (app_subdomain)
                )
                """);
        jdbc.execute("""
                CREATE TABLE application_connect (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, appid char(36) NOT NULL,
                    owner_uuid varchar(11) NOT NULL, app_name varchar(255) NOT NULL, app_url varchar(255) NOT NULL,
                    visibility varchar(255) NOT NULL, app_description varchar(1000) NOT NULL,
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_application_connect_appid UNIQUE (appid),
                    CONSTRAINT uk_application_connect_app_url UNIQUE (app_url)
                )
                """);
        jdbc.execute("""
                CREATE TABLE application_collect (
                    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, appid char(36) NOT NULL,
                    owner_uuid varchar(11) NOT NULL, app_name varchar(255) NOT NULL, app_url varchar(255) NOT NULL,
                    visibility varchar(255) NOT NULL, app_description varchar(1000) NOT NULL,
                    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uk_application_collect_appid UNIQUE (appid),
                    CONSTRAINT uk_application_collect_app_url UNIQUE (app_url)
                )
                """);
    }

    // 沿用生产的驼峰映射和全部 Mapper 注册，Spring 模板负责真实 SQL 异常翻译。
    private static SqlSessionFactory sessionFactory(SingleConnectionDataSource source) throws Exception {
        Configuration configuration = new Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.addMapper(UserMapper.class);
        configuration.addMapper(UserProfileMapper.class);
        configuration.addMapper(AuthGithubMapper.class);
        configuration.addMapper(AuthGiteeMapper.class);
        configuration.addMapper(ApplicationCreateMapper.class);
        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(source);
        factory.setConfiguration(configuration);
        return factory.getObject();
    }
}
