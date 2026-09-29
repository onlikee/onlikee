package com.onlikee.module.user.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserAvatarDTO {
    @NotBlank(message = "头像资源地址不能为空")
    private String avatarUrl;
}
