package com.onlikee.module.resource.service;

import java.time.Duration;
import java.net.URI;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.onlikee.lightoss.SigningClient.SignUploadRequest;
import com.onlikee.lightoss.model.Visibility;
import com.onlikee.lightoss.LightOssClient;
import com.onlikee.lightoss.exception.LightOssException;
import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.module.resource.model.dto.AvatarUploadTicketDTO;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;
import com.onlikee.module.user.model.entity.UserEntity;

@Service
public class ImageResourceService {
    @Autowired
    private ResourceUploadSigningService signingService;
    @Autowired
    private LightOssClient lightOssClient;
    @Value("${light-oss.api-base-url}")
    private String apiBaseUrl;

    private static final String AVATAR_PATH = "/api/v1/buckets/image/objects/";

    // bucket、用途和覆盖权限由业务接口固定，客户端不能指定其他用户的目标路径。
    public ResourceUploadTicketVO createAvatarUploadTicket(UserEntity user, AvatarUploadTicketDTO request) {
        String objectKey = user.getUuid() + "/avatar/" + request.getOriginalFilename();
        return signingService.signUpload(SignUploadRequest.builder("image", objectKey, request.getSizeBytes())
                .visibility(Visibility.PUBLIC)
                .allowOverwrite(true)
                .originalFilename(request.getOriginalFilename())
                .contentType(request.resolvedContentType())
                .expiresIn(Duration.ofMinutes(5))
                .build());
    }

    // 只接受本服务公开的当前用户头像对象，避免将任意外链或别人的对象存为头像。
    public String validateCurrentUserAvatarUrl(UserEntity user, String avatarUrl) {
        URI address;
        URI base;
        try {
            address = URI.create(avatarUrl);
            base = URI.create(apiBaseUrl.trim());
        } catch (IllegalArgumentException exception) {
            throw new BizException(ErrorCode.AVATAR_RESOURCE_INVALID);
        }
        if (!Objects.equals(address.getScheme(), base.getScheme())
                || !Objects.equals(address.getHost(), base.getHost())
                || address.getPort() != base.getPort()
                || address.getRawUserInfo() != null
                || address.getRawQuery() != null
                || address.getRawFragment() != null
                || !address.getPath().startsWith(AVATAR_PATH + user.getUuid() + "/avatar/")) {
            throw new BizException(ErrorCode.AVATAR_RESOURCE_INVALID);
        }

        String objectKey = address.getPath().substring(AVATAR_PATH.length());
        String filename = objectKey.substring((user.getUuid() + "/avatar/").length());
        AvatarUploadTicketDTO filenameRules = new AvatarUploadTicketDTO();
        filenameRules.setOriginalFilename(filename);
        if (filename.isBlank() || !filenameRules.isFilenameValid() || !filenameRules.isImageTypeValid()) {
            throw new BizException(ErrorCode.AVATAR_RESOURCE_INVALID);
        }
        try {
            var metadata = lightOssClient.objects().head("image", objectKey).data();
            if (metadata.visibility().isPresent() && !Visibility.PUBLIC.equals(metadata.visibility().get())
                    || metadata.contentType().isPresent()
                    && !metadata.contentType().get().equalsIgnoreCase(filenameRules.resolvedContentType())
                    || metadata.contentLength().isPresent()
                    && (metadata.contentLength().getAsLong() <= 0
                    || metadata.contentLength().getAsLong() > 1048576)) {
                throw new BizException(ErrorCode.AVATAR_RESOURCE_INVALID);
            }
        } catch (LightOssException exception) {
            throw new BizException(ErrorCode.AVATAR_RESOURCE_INVALID);
        }
        return address.toASCIIString();
    }
}
