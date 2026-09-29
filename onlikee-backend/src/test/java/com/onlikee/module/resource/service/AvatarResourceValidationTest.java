package com.onlikee.module.resource.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.OptionalLong;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.lightoss.LightOssClient;
import com.onlikee.lightoss.LightOssResponse;
import com.onlikee.lightoss.exception.LightOssException;
import com.onlikee.lightoss.ObjectClient;
import com.onlikee.lightoss.model.Visibility;
import com.onlikee.lightoss.transfer.ContentMetadata;
import com.onlikee.module.user.model.entity.UserEntity;

@ExtendWith(MockitoExtension.class)
class AvatarResourceValidationTest {
    @Mock
    private LightOssClient lightOssClient;
    @Mock
    private ObjectClient objectClient;
    private ImageResourceService service;

    @BeforeEach
    void setUp() {
        service = new ImageResourceService();
        ReflectionTestUtils.setField(service, "lightOssClient", lightOssClient);
        ReflectionTestUtils.setField(service, "apiBaseUrl", "https://oss.example.com");
    }

    @Test
    // 只有当前用户目录中已存在的公开图片能作为头像。
    void shouldAcceptOwnUploadedObject() {
        String url = "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png";
        ContentMetadata metadata = new ContentMetadata(OptionalLong.of(100), Optional.of("image/png"),
                Optional.empty(), Optional.of(new Visibility("public")), Optional.empty(), Optional.empty());
        when(lightOssClient.objects()).thenReturn(objectClient);
        when(objectClient.head("image", "user-1/avatar/a.png"))
                .thenReturn(new LightOssResponse<>(metadata, "request"));

        assertEquals(url, service.validateCurrentUserAvatarUrl(user(), url));
        verify(objectClient).head("image", "user-1/avatar/a.png");
    }

    @Test
    // 拒绝外站、别人的目录、签名参数及路径穿越，且不向 OSS 发起查询。
    void shouldRejectUntrustedAddresses() {
        String[] urls = {
                "https://evil.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png",
                "https://oss.example.com/api/v1/buckets/image/objects/user-2/avatar/a.png",
                "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/../a.png",
                "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png?token=secret"
        };
        for (String url : urls) {
            BizException exception = assertThrows(BizException.class,
                    () -> service.validateCurrentUserAvatarUrl(user(), url));
            assertEquals(ErrorCode.AVATAR_RESOURCE_INVALID.getCode(), exception.getCode());
        }
        verify(lightOssClient, never()).objects();
    }

    @Test
    // OSS 中不存在的对象不能写入用户头像字段。
    void shouldRejectMissingObject() {
        String url = "https://oss.example.com/api/v1/buckets/image/objects/user-1/avatar/a.png";
        when(lightOssClient.objects()).thenReturn(objectClient);
        when(objectClient.head("image", "user-1/avatar/a.png")).thenThrow(new LightOssException("not found"));

        BizException exception = assertThrows(BizException.class,
                () -> service.validateCurrentUserAvatarUrl(user(), url));

        assertEquals(ErrorCode.AVATAR_RESOURCE_INVALID.getCode(), exception.getCode());
    }

    private UserEntity user() {
        UserEntity user = new UserEntity();
        user.setUuid("user-1");
        return user;
    }
}
