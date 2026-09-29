package com.onlikee.module.user.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.common.exception.GlobalExceptionHandler;
import com.onlikee.module.user.model.dto.UserProfileDTO;
import com.onlikee.module.user.model.dto.UserAvatarDTO;
import com.onlikee.module.user.model.dto.UserProfileMarkdownDTO;
import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.user.model.entity.UserProfileMarkdownEntity;
import com.onlikee.module.auth.service.SessionAuthService;
import com.onlikee.module.user.service.UserProfileService;

import jakarta.servlet.http.Cookie;

@WebMvcTest(UserProfileController.class)
@Import(GlobalExceptionHandler.class)
class UserProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserProfileService userProfileService;

    @MockitoBean
    private SessionAuthService sessionAuthService;

    @MockitoBean
    private CacheManager cacheManager;

    @Test
    // 公开资料查询成功时应返回用户信息结构，不内联 Markdown 内容。
    void profileShouldReturnPublicUserInfo() throws Exception {
        UserEntity user = user();
        when(userProfileService.getUserByNickname("tester")).thenReturn(user);

        mockMvc.perform(get("/users/tester/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.message").value("请求成功"))
                .andExpect(jsonPath("$.data.uuid").value("user-1"))
                .andExpect(jsonPath("$.data.nickname").value("tester"))
                .andExpect(jsonPath("$.data.email").value("tester@example.com"))
                .andExpect(jsonPath("$.data.avatarUrl").value("https://avatar/tester.png"))
                .andExpect(jsonPath("$.data.markdown").doesNotExist());
    }

    @Test
    // 公开资料查询不访问 Markdown，Markdown 内容由独立接口返回。
    void profileShouldNotFetchMarkdown() throws Exception {
        UserEntity user = user();
        when(userProfileService.getUserByNickname("tester")).thenReturn(user);

        mockMvc.perform(get("/users/tester/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nickname").value("tester"))
                .andExpect(jsonPath("$.data.markdown").doesNotExist());

        verify(userProfileService, never()).getMarkdownByUuid("user-1");
    }

    @Test
    // 未携带 cookie 时也应走公开查询链路，不触发登录态解析。
    void profileShouldNotRequireAuthenticationCookie() throws Exception {
        when(userProfileService.getUserByNickname("tester")).thenReturn(user());

        mockMvc.perform(get("/users/tester/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"));

        verify(sessionAuthService, never()).getCurrentUser(null);
    }

    @Test
    // 用户不存在时应透出统一的 USER_NOT_FOUND 响应。
    void profileShouldReturnUserNotFoundWhenMissing() throws Exception {
        when(userProfileService.getUserByNickname("missing")).thenThrow(new BizException(ErrorCode.USER_NOT_FOUND));

        mockMvc.perform(get("/users/missing/profile"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("未找到该用户"))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    // 公开 Markdown 查询只返回 README 内容字段，不返回其他用户资料字段。
    void markdownShouldReturnOnlyMarkdownContent() throws Exception {
        UserEntity user = user();
        when(userProfileService.getUserByNickname("tester")).thenReturn(user);
        when(userProfileService.getMarkdownByUuid("user-1")).thenReturn(markdown("# Hello"));

        mockMvc.perform(get("/users/tester/markdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.message").value("请求成功"))
                .andExpect(jsonPath("$.data.markdown").value("# Hello"))
                .andExpect(jsonPath("$.data.uuid").doesNotExist())
                .andExpect(jsonPath("$.data.nickname").doesNotExist());
    }

    @Test
    // 未保存 Markdown 时只返回空 markdown 字段，不补用户资料字段。
    void markdownShouldReturnNullWhenMissing() throws Exception {
        UserEntity user = user();
        when(userProfileService.getUserByNickname("tester")).thenReturn(user);
        when(userProfileService.getMarkdownByUuid("user-1")).thenReturn(null);

        mockMvc.perform(get("/users/tester/markdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.data.markdown").value(nullValue()));
    }

    @Test
    // 公开 Markdown 查询不依赖登录态。
    void markdownShouldNotRequireAuthenticationCookie() throws Exception {
        UserEntity user = user();
        when(userProfileService.getUserByNickname("tester")).thenReturn(user);
        when(userProfileService.getMarkdownByUuid("user-1")).thenReturn(markdown("# Hello"));

        mockMvc.perform(get("/users/tester/markdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"));

        verify(sessionAuthService, never()).getCurrentUser(null);
    }

    @Test
    // 用户不存在时沿用公开资料查询的 USER_NOT_FOUND 响应。
    void markdownShouldReturnUserNotFoundWhenUserMissing() throws Exception {
        when(userProfileService.getUserByNickname("missing")).thenThrow(new BizException(ErrorCode.USER_NOT_FOUND));

        mockMvc.perform(get("/users/missing/markdown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("未找到该用户"))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    // 保存 Markdown 时通过 cookie 登录态定位当前用户，不接受请求体传入 uuid。
    void saveMarkdownShouldUseCurrentUserFromCookie() throws Exception {
        UserEntity user = user();
        when(sessionAuthService.getCurrentUser("token")).thenReturn(user);

        mockMvc.perform(post("/users/me/markdown")
                .cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "content": "# Hello"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.message").value("请求成功"))
                .andExpect(jsonPath("$.data").value(nullValue()));

        verify(userProfileService).saveCurrentUserMarkdown(any(UserEntity.class), any(UserProfileMarkdownDTO.class));
    }

    @Test
    // 保存接口沿用当前未登录契约：业务码 NOT_LOGIN，HTTP 仍为 200。
    void saveMarkdownShouldReturnNotLoginWhenCookieInvalid() throws Exception {
        when(sessionAuthService.getCurrentUser("expired")).thenThrow(new BizException(ErrorCode.NOT_LOGIN));

        mockMvc.perform(post("/users/me/markdown")
                .cookie(new Cookie("auth_token", "expired"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "content": "# Hello"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("NOT_LOGIN"))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    // 保存基础资料时通过 cookie 登录态定位当前用户，并返回更新后的当前用户资料。
    void saveProfileShouldUseCurrentUserFromCookieAndReturnUpdatedProfile() throws Exception {
        UserEntity user = user();
        when(sessionAuthService.getCurrentUser("token")).thenReturn(user);
        when(userProfileService.saveCurrentUserProfile(any(UserEntity.class), any(UserProfileDTO.class)))
                .thenReturn(updatedUser());

        mockMvc.perform(post("/users/me/profile")
                .cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "bio": "updated bio",
                          "pronoun": "they/them",
                          "location": "Hangzhou",
                          "socialAccount0": "https://github.com/tester",
                          "socialAccount1": "",
                          "socialAccount2": null
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.data.uuid").value("user-1"))
                .andExpect(jsonPath("$.data.nickname").value("tester"))
                .andExpect(jsonPath("$.data.email").value("tester@example.com"))
                .andExpect(jsonPath("$.data.bio").value("updated bio"))
                .andExpect(jsonPath("$.data.pronoun").value("they/them"))
                .andExpect(jsonPath("$.data.location").value("Hangzhou"))
                .andExpect(jsonPath("$.data.socialAccount0").value("https://github.com/tester"))
                .andExpect(jsonPath("$.data.socialAccount1").value(nullValue()))
                .andExpect(jsonPath("$.data.socialAccount2").value(nullValue()));

        verify(userProfileService).saveCurrentUserProfile(any(UserEntity.class), any(UserProfileDTO.class));
    }

    @Test
    // 保存基础资料接口沿用当前未登录契约：业务码 NOT_LOGIN，HTTP 仍为 200。
    void saveProfileShouldReturnNotLoginWhenCookieInvalid() throws Exception {
        when(sessionAuthService.getCurrentUser("expired")).thenThrow(new BizException(ErrorCode.NOT_LOGIN));

        mockMvc.perform(post("/users/me/profile")
                .cookie(new Cookie("auth_token", "expired"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "bio": "updated bio"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("NOT_LOGIN"))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    // 上传成功后由登录用户确认资源地址并返回更新后的资料。
    void saveAvatarShouldUseCurrentUserAndReturnUpdatedProfile() throws Exception {
        when(sessionAuthService.getCurrentUser("token")).thenReturn(user());
        UserEntity updated = user();
        updated.setAvatarUrl("https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png");
        when(userProfileService.saveCurrentUserAvatar(any(UserEntity.class), any(UserAvatarDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(post("/users/me/avatar")
                .cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"avatarUrl":"https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.avatarUrl").value(updated.getAvatarUrl()));
    }

    @Test
    // 空资源地址应在请求边界被拒绝。
    void saveAvatarShouldRejectBlankUrl() throws Exception {
        mockMvc.perform(post("/users/me/avatar")
                .cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"avatarUrl\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        user.setNickName("tester");
        user.setEmail("tester@example.com");
        user.setAvatarUrl("https://avatar/tester.png");
        return user;
    }

    private UserEntity updatedUser() {
        UserEntity user = user();
        user.setBio("updated bio");
        user.setPronoun("they/them");
        user.setLocation("Hangzhou");
        user.setSocialAccount0("https://github.com/tester");
        user.setSocialAccount1(null);
        user.setSocialAccount2(null);
        return user;
    }

    private UserProfileMarkdownEntity markdown(String content) {
        UserProfileMarkdownEntity markdown = new UserProfileMarkdownEntity();
        markdown.setUuid("user-1");
        markdown.setContent(content);
        return markdown;
    }
}
