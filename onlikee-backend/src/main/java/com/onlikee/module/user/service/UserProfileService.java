package com.onlikee.module.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.module.user.mapper.UserProfileMapper;
import com.onlikee.module.user.model.dto.UserProfileDTO;
import com.onlikee.module.user.model.dto.UserAvatarDTO;
import com.onlikee.module.resource.service.ImageResourceService;
import com.onlikee.module.user.model.dto.UserProfileMarkdownDTO;
import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.user.model.entity.UserProfileMarkdownEntity;
import com.onlikee.common.util.StringNormalizer;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileMapper userProfileMapper;
    @Autowired
    private ImageResourceService imageResourceService;

    // 公开资料页使用昵称作为稳定入口，查询不到时复用用户不存在业务错误。
    public UserEntity getUserByNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        UserEntity user = userProfileMapper.getUserByNickname(nickname);
        if (user == null) {
            throw new BizException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    // Markdown 属于公开资料页扩展内容，没有记录时由 controller 转换为 data: null。
    public UserProfileMarkdownEntity getMarkdownByUuid(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        return userProfileMapper.getMarkdownByUuid(uuid);
    }

    // 保存时只使用登录态用户 uuid，避免请求体越权写入其他用户资料。
    public void saveCurrentUserMarkdown(UserEntity user, UserProfileMarkdownDTO request) {
        if (user == null || user.getUuid() == null || user.getUuid().isBlank() || request == null) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        int affectedRows = userProfileMapper.upsertMarkdown(user.getUuid(), request.getContent());
        if (affectedRows <= 0) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @CacheEvict(cacheNames = "user:info", key = "#user.uuid")
    // 保存时只使用登录态用户 uuid，资料字段统一裁剪空白，空字符串存为 null。
    public UserEntity saveCurrentUserProfile(UserEntity user, UserProfileDTO request) {
        if (user == null || user.getUuid() == null || user.getUuid().isBlank() || request == null) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        String bio = StringNormalizer.normalizeNullable(request.getBio());
        String pronoun = StringNormalizer.normalizeNullable(request.getPronoun());
        String location = StringNormalizer.normalizeNullable(request.getLocation());
        String socialAccount0 = StringNormalizer.normalizeNullable(request.getSocialAccount0());
        String socialAccount1 = StringNormalizer.normalizeNullable(request.getSocialAccount1());
        String socialAccount2 = StringNormalizer.normalizeNullable(request.getSocialAccount2());

        int affectedRows = userProfileMapper.updateCurrentUserProfile(
                user.getUuid(),
                bio,
                pronoun,
                location,
                socialAccount0,
                socialAccount1,
                socialAccount2);
        if (affectedRows != 1) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }

        user.setBio(bio);
        user.setPronoun(pronoun);
        user.setLocation(location);
        user.setSocialAccount0(socialAccount0);
        user.setSocialAccount1(socialAccount1);
        user.setSocialAccount2(socialAccount2);
        return user;
    }

    @CacheEvict(cacheNames = "user:info", key = "#user.uuid")
    // 验证已上传的头像后按登录态 uuid 更新，并使用户信息缓存失效。
    public UserEntity saveCurrentUserAvatar(UserEntity user, UserAvatarDTO request) {
        if (user == null || user.getUuid() == null || user.getUuid().isBlank() || request == null) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        String avatarUrl = imageResourceService.validateCurrentUserAvatarUrl(user, request.getAvatarUrl());
        if (userProfileMapper.updateCurrentUserAvatar(user.getUuid(), avatarUrl) != 1) {
            throw new BizException(ErrorCode.INTERNAL_ERROR);
        }
        user.setAvatarUrl(avatarUrl);
        return user;
    }
}
