package com.onlikee.module.application.converter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import com.onlikee.module.application.model.dto.ApplicationCreateCollectDTO;
import com.onlikee.module.application.model.dto.ApplicationCreateConnectDTO;
import com.onlikee.module.application.model.dto.ApplicationCreateNewDTO;
import com.onlikee.module.application.model.entity.ApplicationCollectEntity;
import com.onlikee.module.application.model.entity.ApplicationConnectEntity;
import com.onlikee.module.application.model.entity.ApplicationNewEntity;
import com.onlikee.module.user.model.entity.UserEntity;

class ToEntityTest {

    @Test
    // 自建应用转换时应生成 appid、子域名和原始文件元信息。
    void toApplicationNewEntityShouldBuildApplicationMetadata() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        ApplicationCreateNewDTO request = new ApplicationCreateNewDTO();
        request.setFramework("html");
        request.setAppName("Demo");
        request.setAppSubDomain("demo");
        request.setVisibility("public");
        request.setAppDescription("description");
        request.setAppFile(new MockMultipartFile(
                "appFile",
                "index.html",
                "text/html",
                "<html></html>".getBytes()));

        ApplicationNewEntity application = ToEntity.toApplicationNewEntity(user, request);

        assertNotNull(application.getAppid());
        UUID.fromString(application.getAppid());
        assertEquals("user-1", application.getOwnerUuid());
        assertEquals("html", application.getFramework());
        assertEquals("Demo", application.getAppName());
        assertNull(application.getAppAvatarUrl());
        assertEquals("demo", application.getAppSubDomain());
        assertEquals("public", application.getVisibility());
        assertEquals("description", application.getAppDescription());
        assertEquals("index.html", application.getOriginalFilename());
        assertEquals("text/html", application.getOriginalFileType());
        assertEquals("13 B", application.getOriginalFileSize());
    }

    @Test
    // 已有网站接入转换时不应依赖上传文件元信息。
    void toApplicationConnectEntityShouldBuildApplicationMetadata() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        ApplicationCreateConnectDTO request = new ApplicationCreateConnectDTO();
        request.setAppName("Demo Website");
        request.setAppUrl("https://www.demo.com");
        request.setVisibility("public");
        request.setAppDescription("description");

        ApplicationConnectEntity application = ToEntity.toApplicationConnectEntity(user, request, "https://www.demo.com");

        assertNotNull(application.getAppid());
        UUID.fromString(application.getAppid());
        assertEquals("user-1", application.getOwnerUuid());
        assertEquals("Demo Website", application.getAppName());
        assertEquals("https://www.demo.com", application.getAppUrl());
        assertEquals("public", application.getVisibility());
        assertEquals("description", application.getAppDescription());
    }

    @Test
    // 网站收录转换时应写入 collect 来源，不依赖上传文件元信息。
    void toApplicationCollectEntityShouldBuildApplicationMetadata() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        ApplicationCreateCollectDTO request = new ApplicationCreateCollectDTO();
        request.setAppName("Demo Website");
        request.setAppUrl("https://www.demo.com");
        request.setVisibility("public");
        request.setAppDescription("description");

        ApplicationCollectEntity application = ToEntity.toApplicationCollectEntity(user, request, "https://www.demo.com");

        assertNotNull(application.getAppid());
        UUID.fromString(application.getAppid());
        assertEquals("user-1", application.getOwnerUuid());
        assertEquals("Demo Website", application.getAppName());
        assertEquals("https://www.demo.com", application.getAppUrl());
        assertEquals("public", application.getVisibility());
        assertEquals("description", application.getAppDescription());
    }
}
