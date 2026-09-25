package com.onlikee.module.application.model.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ApplicationNewEntity {
    private Long id;
    private String appid;
    private String ownerUuid;
    private String framework;
    private String appName;
    private String appAvatarUrl;
    private String appSubDomain;
    private String visibility;
    private String appDescription;
    private String originalFilename;
    private String originalFileType;
    private String originalFileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
