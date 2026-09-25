package com.onlikee.module.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.module.user.mapper.UserProfileMapper;
import com.onlikee.module.resource.service.ImageResourceService;
import com.onlikee.module.user.model.dto.UserAvatarDTO;
import com.onlikee.module.user.model.dto.UserProfileDTO;
import com.onlikee.module.user.model.dto.UserProfileMarkdownDTO;
import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.user.model.entity.UserProfileMarkdownEntity;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileMapper userProfileMapper;
    @Mock
    private ImageResourceService imageResourceService;

    @InjectMocks
    private UserProfileService userProfileService;

    @Test
    // 根据昵称查询成功时应直接返回 profile mapper 结果。
    void getUserByNicknameShouldReturnUserWhenFound() {
        UserEntity user = user();
        when(userProfileMapper.getUserByNickname("tester")).thenReturn(user);

        UserEntity result = userProfileService.getUserByNickname("tester");

        assertSame(user, result);
    }

    @Test
    // 昵称为空时应按内部错误处理。
    void getUserByNicknameShouldRejectBlankNickname() {
        BizException exception = assertThrows(BizException.class, () -> userProfileService.getUserByNickname(" "));

        assertEquals(ErrorCode.INTERNAL_ERROR.getCode(), exception.getCode());
    }

    @Test
    // 根据昵称查询不到用户时应返回 USER_NOT_FOUND。
    void getUserByNicknameShouldThrowWhenUserMissing() {
        when(userProfileMapper.getUserByNickname("missing")).thenReturn(null);

        BizException exception = assertThrows(BizException.class, () -> userProfileService.getUserByNickname("missing"));

        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    // 查询 Markdown 时直接按 uuid 读取资料页扩展表。
    void getMarkdownByUuidShouldReturnMapperResult() {
        UserProfileMarkdownEntity markdown = markdown("# Hello");
        when(userProfileMapper.getMarkdownByUuid("user-1")).thenReturn(markdown);

        UserProfileMarkdownEntity result = userProfileService.getMarkdownByUuid("user-1");

        assertSame(markdown, result);
    }

    @Test
    // Markdown 不存在时返回 null，公开 Markdown 接口会将其表现为 data: null。
    void getMarkdownByUuidShouldReturnNullWhenMissing() {
        when(userProfileMapper.getMarkdownByUuid("user-1")).thenReturn(null);

        UserProfileMarkdownEntity result = userProfileService.getMarkdownByUuid("user-1");

        assertEquals(null, result);
    }

    @Test
    // 保存 Markdown 时只使用登录态用户 uuid，并允许空字符串清空内容。
    void saveCurrentUserMarkdownShouldUpsertByCurrentUserUuid() {
        UserProfileMarkdownDTO request = request("# Hello");
        when(userProfileMapper.upsertMarkdown("user-1", "# Hello")).thenReturn(1);

        userProfileService.saveCurrentUserMarkdown(user(), request);

        verify(userProfileMapper).upsertMarkdown("user-1", "# Hello");
    }

    @Test
    // 写入失败时按内部错误处理，避免调用方误以为资料页已保存。
    void saveCurrentUserMarkdownShouldThrowWhenUpsertFails() {
        UserProfileMarkdownDTO request = request("");
        when(userProfileMapper.upsertMarkdown("user-1", "")).thenReturn(0);

        BizException exception = assertThrows(BizException.class,
                () -> userProfileService.saveCurrentUserMarkdown(user(), request));

        assertEquals(ErrorCode.INTERNAL_ERROR.getCode(), exception.getCode());
    }

    @Test
    // 保存基础资料时只使用登录态用户 uuid，并返回同步后的用户对象。
    void saveCurrentUserProfileShouldUpdateByCurrentUserUuid() {
        UserProfileDTO request = profileRequest(" updated bio ", " they/them ", " Hangzhou ",
                " https://github.com/tester ", " https://gitee.com/tester ", " https://example.com/tester ");
        when(userProfileMapper.updateCurrentUserProfile(
                "user-1",
                "updated bio",
                "they/them",
                "Hangzhou",
                "https://github.com/tester",
                "https://gitee.com/tester",
                "https://example.com/tester")).thenReturn(1);

        UserEntity result = userProfileService.saveCurrentUserProfile(user(), request);

        assertEquals("updated bio", result.getBio());
        assertEquals("they/them", result.getPronoun());
        assertEquals("Hangzhou", result.getLocation());
        assertEquals("https://github.com/tester", result.getSocialAccount0());
        assertEquals("https://gitee.com/tester", result.getSocialAccount1());
        assertEquals("https://example.com/tester", result.getSocialAccount2());
    }

    @Test
    // 空字符串资料字段应统一转为 null，方便公开资料展示时按空值处理。
    void saveCurrentUserProfileShouldNormalizeBlankFieldsToNull() {
        UserProfileDTO request = profileRequest(" ", "", null, "   ", null, "");
        when(userProfileMapper.updateCurrentUserProfile("user-1", null, null, null, null, null, null)).thenReturn(1);

        UserEntity result = userProfileService.saveCurrentUserProfile(user(), request);

        assertEquals(null, result.getBio());
        assertEquals(null, result.getPronoun());
        assertEquals(null, result.getLocation());
        assertEquals(null, result.getSocialAccount0());
        assertEquals(null, result.getSocialAccount1());
        assertEquals(null, result.getSocialAccount2());
    }

    @Test
    // 基础资料更新失败时按内部错误处理，避免调用方误以为资料已保存。
    void saveCurrentUserProfileShouldThrowWhenUpdateFails() {
        UserProfileDTO request = profileRequest("bio", null, null, null, null, null);
        when(userProfileMapper.updateCurrentUserProfile("user-1", "bio", null, null, null, null, null)).thenReturn(0);

        BizException exception = assertThrows(BizException.class,
                () -> userProfileService.saveCurrentUserProfile(user(), request));

        assertEquals(ErrorCode.INTERNAL_ERROR.getCode(), exception.getCode());
    }

    @Test
    // 头像更新使用当前用户 uuid，资源验证通过后才写入数据库。
    void saveCurrentUserAvatarShouldPersistValidatedUrl() {
        String url = "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png";
        UserAvatarDTO request = new UserAvatarDTO();
        request.setAvatarUrl(url);
        when(imageResourceService.validateCurrentUserAvatarUrl(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(url))).thenReturn(url);
        when(userProfileMapper.updateCurrentUserAvatar("user-1", url)).thenReturn(1);

        UserEntity result = userProfileService.saveCurrentUserAvatar(user(), request);

        assertEquals(url, result.getAvatarUrl());
        verify(userProfileMapper).updateCurrentUserAvatar("user-1", url);
    }

    @Test
    // 数据库未写入时不能将上传完成误报为头像更新成功。
    void saveCurrentUserAvatarShouldThrowWhenUpdateFails() {
        String url = "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png";
        UserAvatarDTO request = new UserAvatarDTO();
        request.setAvatarUrl(url);
        when(imageResourceService.validateCurrentUserAvatarUrl(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(url))).thenReturn(url);

        BizException exception = assertThrows(BizException.class,
                () -> userProfileService.saveCurrentUserAvatar(user(), request));

        assertEquals(ErrorCode.INTERNAL_ERROR.getCode(), exception.getCode());
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        user.setNickName("tester");
        user.setEmail("tester@example.com");
        return user;
    }

    private UserProfileMarkdownDTO request(String content) {
        UserProfileMarkdownDTO request = new UserProfileMarkdownDTO();
        request.setContent(content);
        return request;
    }

    private UserProfileDTO profileRequest(String bio,
                                           String pronoun,
                                           String location,
                                           String socialAccount0,
                                           String socialAccount1,
                                           String socialAccount2) {
        UserProfileDTO request = new UserProfileDTO();
        request.setBio(bio);
        request.setPronoun(pronoun);
        request.setLocation(location);
        request.setSocialAccount0(socialAccount0);
        request.setSocialAccount1(socialAccount1);
        request.setSocialAccount2(socialAccount2);
        return request;
    }

    private UserProfileMarkdownEntity markdown(String content) {
        UserProfileMarkdownEntity markdown = new UserProfileMarkdownEntity();
        markdown.setUuid("user-1");
        markdown.setContent(content);
        return markdown;
    }
}
