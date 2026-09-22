package com.onlikee;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.Set;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import com.onlikee.module.application.mapper.ApplicationCreateMapper;
import com.onlikee.module.application.service.ApplicationCreateService;
import com.onlikee.module.application.service.ApplicationSitePublishService;
import com.onlikee.module.application.util.ApplicationUrlUtils;
import com.onlikee.module.auth.oauth.mapper.AuthGiteeMapper;
import com.onlikee.module.auth.oauth.mapper.AuthGithubMapper;
import com.onlikee.module.auth.service.SessionAuthService;
import com.onlikee.common.exception.GlobalExceptionHandler;
import com.onlikee.infrastructure.cache.RedisConfig;
import com.onlikee.infrastructure.storage.LightOssConfig;
import com.onlikee.infrastructure.web.CorsConfig;
import com.onlikee.lightoss.LightOssClient;
import com.onlikee.module.user.mapper.UserMapper;
import com.onlikee.module.user.mapper.UserProfileMapper;

// 使用真实根包扫描与自动配置，只替换外部连接，验证迁移后的装配不依赖旧包。
@SpringBootTest(properties = {
        "spring.config.location=optional:classpath:/package-structure-test.properties",
        "spring.sql.init.mode=never",
        "light-oss.api-base-url=https://oss.example.com",
        "security.jwt.secret=package-structure-test-secret-32-characters",
        "security.jwt.expire-seconds=3600",
        "app.domain-suffix=.example.com",
        "github.oauth.client-id=test",
        "github.oauth.client-secret=test",
        "github.oauth.redirect-uri=http://localhost/oauth/github/callback",
        "gitee.oauth.client-id=test",
        "gitee.oauth.client-secret=test",
        "gitee.oauth.redirect-uri=http://localhost/oauth/gitee/callback"
})
class PackageStructureTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

    @MockitoBean
    private DataSource dataSource;

    @MockitoBean
    private LettuceConnectionFactory redisConnectionFactory;

    @MockitoBean
    private LightOssClient lightOssClient;

    @Test
    // 同时覆盖业务服务、公共异常处理及基础设施配置的组件发现。
    void shouldDiscoverBusinessAndInfrastructureComponents() {
        for (Class<?> type : Set.of(ApplicationCreateService.class, ApplicationSitePublishService.class,
                SessionAuthService.class, GlobalExceptionHandler.class, RedisConfig.class,
                LightOssConfig.class, CorsConfig.class, ApplicationUrlUtils.class)) {
            assertNotNull(context.getBean(type));
        }
        assertEquals(7, context.getBeansWithAnnotation(RestController.class).size());
    }

    @Test
    // Mapper 由 MyBatis 自动扫描注册，不在测试中显式导入或替换 Mapper。
    void shouldRegisterAllFiveMappersWithoutDatabaseAccess() {
        Set<Class<?>> expected = Set.of(ApplicationCreateMapper.class, UserMapper.class,
                UserProfileMapper.class, AuthGithubMapper.class, AuthGiteeMapper.class);
        assertEquals(expected, Set.copyOf(sqlSessionFactory.getConfiguration().getMapperRegistry().getMappers()));
        assertEquals(5, context.getBeansWithAnnotation(Mapper.class).size());
        for (Class<?> mapper : expected) {
            assertNotNull(context.getBean(mapper));
        }
        verifyNoInteractions(dataSource, redisConnectionFactory, lightOssClient);
    }

    @Test
    // 认证和 OAuth 控制器迁移后继续暴露既有路由。
    void shouldPreserveAuthenticationRoutes() {
        Set<String> routes = requestMappingHandlerMapping.getHandlerMethods().keySet().stream()
                .flatMap(mapping -> mapping.getPatternValues().stream())
                .collect(Collectors.toSet());
        assertTrue(routes.containsAll(Set.of("/resources/images/avatars/upload-tickets", "/auth/me", "/auth/logout", "/auth/logout-all",
                "/oauth/github/render", "/oauth/github/callback",
                "/oauth/gitee/render", "/oauth/gitee/callback")));
    }
}
