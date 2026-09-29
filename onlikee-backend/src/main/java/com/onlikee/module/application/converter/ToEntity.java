package com.onlikee.module.application.converter;

import com.onlikee.module.application.model.dto.ApplicationCreateCollectDTO;
import com.onlikee.module.application.model.dto.ApplicationCreateConnectDTO;
import com.onlikee.module.application.model.dto.ApplicationCreateNewDTO;
import com.onlikee.module.application.model.entity.ApplicationCollectEntity;
import com.onlikee.module.application.model.entity.ApplicationConnectEntity;
import com.onlikee.module.application.model.entity.ApplicationNewEntity;
import com.onlikee.module.user.model.entity.UserEntity;
import com.onlikee.module.application.util.ApplicationUuidGenerator;
import com.onlikee.common.util.FileSizeFormatter;

public final class ToEntity {

    private ToEntity() {
    }

    public static ApplicationNewEntity toApplicationNewEntity(UserEntity user, ApplicationCreateNewDTO request) {
        ApplicationNewEntity application = new ApplicationNewEntity();
        String appid = ApplicationUuidGenerator.next();
        String originalFilename = request.getAppFile().getOriginalFilename();

        application.setAppid(appid);
        application.setOwnerUuid(user.getUuid());
        application.setFramework(request.getFramework());
        application.setAppName(request.getAppName());
        // 应用图片地址暂不由创建请求提供，待后续接入资源流程。
        application.setAppAvatarUrl(null);
        application.setAppSubDomain(request.getAppSubDomain());
        application.setVisibility(request.getVisibility());
        application.setAppDescription(request.getAppDescription());
        application.setOriginalFilename(originalFilename);
        application.setOriginalFileType(request.getAppFile().getContentType());
        application.setOriginalFileSize(FileSizeFormatter.format(request.getAppFile().getSize()));
        return application;
    }

    public static ApplicationConnectEntity toApplicationConnectEntity(
            UserEntity user,
            ApplicationCreateConnectDTO request,
            String appUrl) {
        ApplicationConnectEntity application = new ApplicationConnectEntity();
        String appid = ApplicationUuidGenerator.next();

        application.setAppid(appid);
        application.setOwnerUuid(user.getUuid());
        application.setAppName(request.getAppName());
        application.setAppUrl(appUrl);
        application.setVisibility(request.getVisibility());
        application.setAppDescription(request.getAppDescription());
        return application;
    }

    public static ApplicationCollectEntity toApplicationCollectEntity(
            UserEntity user,
            ApplicationCreateCollectDTO request,
            String appUrl) {
        ApplicationCollectEntity application = new ApplicationCollectEntity();
        String appid = ApplicationUuidGenerator.next();

        application.setAppid(appid);
        application.setOwnerUuid(user.getUuid());
        application.setAppName(request.getAppName());
        application.setAppUrl(appUrl);
        application.setVisibility(request.getVisibility());
        application.setAppDescription(request.getAppDescription());
        return application;
    }
}
