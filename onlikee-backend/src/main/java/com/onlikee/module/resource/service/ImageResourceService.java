package com.onlikee.module.resource.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlikee.lightoss.SigningClient.SignUploadRequest;
import com.onlikee.lightoss.model.Visibility;
import com.onlikee.module.resource.model.dto.AvatarUploadTicketDTO;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;
import com.onlikee.module.user.model.entity.UserEntity;

@Service
public class ImageResourceService {
    @Autowired
    private ResourceUploadSigningService signingService;

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
}
