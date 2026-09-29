package com.onlikee.module.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.onlikee.module.user.converter.ToVO;
import com.onlikee.module.user.model.dto.UserProfileDTO;
import com.onlikee.module.user.model.dto.UserAvatarDTO;
import com.onlikee.module.user.model.dto.UserProfileMarkdownDTO;
import com.onlikee.module.user.model.vo.UserInfoVO;
import com.onlikee.module.user.model.vo.UserProfileVO;
import com.onlikee.module.user.model.vo.UserProfileMarkdownVO;
import com.onlikee.common.response.ApiResponse;
import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.user.model.entity.UserProfileMarkdownEntity;
import com.onlikee.module.auth.service.SessionAuthService;
import com.onlikee.module.user.service.UserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;
    @Autowired
    private SessionAuthService sessionAuthService;

    @GetMapping("/{nickname}/profile")
    // 公开资料基础信息按昵称查询用户，不依赖登录态。
    public ApiResponse<UserProfileVO> profile(@PathVariable String nickname) {
        UserEntity user = userProfileService.getUserByNickname(nickname);
        return ApiResponse.success(ToVO.toUserProfileVO(user));
    }

    @GetMapping("/{nickname}/markdown")
    // 公开 Markdown 按昵称查询，只返回 README 内容字段，不返回其他公开资料字段。
    public ApiResponse<UserProfileMarkdownVO> markdown(@PathVariable String nickname) {
        UserEntity user = userProfileService.getUserByNickname(nickname);
        UserProfileMarkdownEntity userProfileMarkdown = userProfileService.getMarkdownByUuid(user.getUuid());
        return ApiResponse.success(ToVO.toUserProfileMarkdownVO(userProfileMarkdown));
    }

    @PostMapping("/me/markdown")
    // Markdown 资料页只允许当前登录用户覆盖自己的内容。
    public ApiResponse<Void> saveMarkdown(
            @CookieValue(value = "auth_token", required = false) String token,
            @Valid @RequestBody UserProfileMarkdownDTO request) {
        UserEntity user = sessionAuthService.getCurrentUser(token);
        userProfileService.saveCurrentUserMarkdown(user, request);
        return ApiResponse.success(null);
    }

    @PostMapping("/me/profile")
    // 基础资料只允许当前登录用户更新自己的公开资料字段。
    public ApiResponse<UserInfoVO> saveProfile(
            @CookieValue(value = "auth_token", required = false) String token,
            @RequestBody UserProfileDTO request) {
        UserEntity user = sessionAuthService.getCurrentUser(token);
        UserEntity updatedUser = userProfileService.saveCurrentUserProfile(user, request);
        return ApiResponse.success(ToVO.toUserInfoVO(updatedUser));
    }

    @PostMapping("/me/avatar")
    // 头像地址由当前登录用户确认，实际资源归属与存在性在业务层校验。
    public ApiResponse<UserInfoVO> saveAvatar(
            @CookieValue(value = "auth_token", required = false) String token,
            @Valid @RequestBody UserAvatarDTO request) {
        UserEntity user = sessionAuthService.getCurrentUser(token);
        UserEntity updatedUser = userProfileService.saveCurrentUserAvatar(user, request);
        return ApiResponse.success(ToVO.toUserInfoVO(updatedUser));
    }
}
