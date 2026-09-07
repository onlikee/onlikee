package com.onlikee.module.user.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileMarkdownDTO {
    @NotNull(message = "content不能为空")
    @Size(max = 1000, message = "content不得超过1000个字符")
    private String content;
}
