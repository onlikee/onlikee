package com.onlikee.module.resource.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.onlikee.common.response.ApiResponse;
import com.onlikee.module.auth.service.SessionAuthService;
import com.onlikee.module.resource.model.dto.AvatarUploadTicketDTO;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;
import com.onlikee.module.resource.service.ImageResourceService;
import com.onlikee.module.user.model.entity.UserEntity;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/resources/images")
public class ImageResourceController {
    @Autowired
    private SessionAuthService sessionAuthService;
    @Autowired
    private ImageResourceService imageResourceService;

    // 仅申请当前登录用户的上传凭证，文件内容由浏览器直接传给 OSS。
    @PostMapping("/avatars/upload-tickets")
    public ApiResponse<ResourceUploadTicketVO> createAvatarUploadTicket(
            @CookieValue(value = "auth_token", required = false) String token,
            @Valid @RequestBody AvatarUploadTicketDTO request) {
        UserEntity user = sessionAuthService.getCurrentUser(token);
        return ApiResponse.success(imageResourceService.createAvatarUploadTicket(user, request));
    }
}
