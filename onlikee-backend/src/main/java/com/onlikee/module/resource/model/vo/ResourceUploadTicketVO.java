package com.onlikee.module.resource.model.vo;

import java.util.Map;

import lombok.Data;

// 前端直传所需的信息，不暴露 SDK 模型或管理 Token。
@Data
public class ResourceUploadTicketVO {
    private String uploadUrl;
    private String method;
    private Map<String, String> headers;
    private long expiresAt;
    private String bucket;
    private String objectKey;
}
