package com.onlikee.module.resource.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.common.exception.GlobalExceptionHandler;
import com.onlikee.module.auth.service.SessionAuthService;
import com.onlikee.module.resource.model.dto.AvatarUploadTicketDTO;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;
import com.onlikee.module.resource.service.ImageResourceService;
import com.onlikee.module.user.model.entity.UserEntity;

import jakarta.servlet.http.Cookie;

@WebMvcTest(ImageResourceController.class)
@Import(GlobalExceptionHandler.class)
class ImageResourceControllerTest {
    private static final String ROUTE = "/resources/images/avatars/upload-tickets";
    private static final String BODY = """
            {"originalFilename":"avatar.png","contentType":"image/png","sizeBytes":102400}
            """;
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private SessionAuthService sessionAuthService;
    @MockitoBean
    private ImageResourceService imageResourceService;
    @MockitoBean
    private CacheManager cacheManager;

    // 当前用户来自 Cookie，响应沿用统一包装和秒级过期时间。
    @Test
    void shouldReturnTicketForAuthenticatedUser() throws Exception {
        UserEntity user = new UserEntity();
        user.setId(42L);
        when(sessionAuthService.getCurrentUser("token")).thenReturn(user);
        ResourceUploadTicketVO ticket = new ResourceUploadTicketVO();
        ticket.setUploadUrl("https://oss.example.com/api/v1/buckets/image/objects/42/avatar/avatar.png?token=signed");
        ticket.setMethod("PUT");
        ticket.setHeaders(Map.of("Content-Type", "image/png", "X-Allow-Overwrite", "true"));
        ticket.setExpiresAt(1790000000L);
        ticket.setBucket("image");
        ticket.setObjectKey("42/avatar/avatar.png");
        when(imageResourceService.createAvatarUploadTicket(same(user), any())).thenReturn(ticket);
        mockMvc.perform(post(ROUTE).cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("OK"))
                .andExpect(jsonPath("$.data.method").value("PUT"))
                .andExpect(jsonPath("$.data.uploadUrl").value(ticket.getUploadUrl()))
                .andExpect(jsonPath("$.data.headers.X-Allow-Overwrite").value("true"))
                .andExpect(jsonPath("$.data.headers.Authorization").doesNotExist())
                .andExpect(jsonPath("$.data.expiresAt").value(1790000000L))
                .andExpect(jsonPath("$.data.bucket").value("image"))
                .andExpect(jsonPath("$.data.objectKey").value("42/avatar/avatar.png"));
        verify(imageResourceService).createAvatarUploadTicket(same(user), any(AvatarUploadTicketDTO.class));
    }

    @Test
    void shouldPreserveNotLoginContractForMissingAndExpiredCookie() throws Exception {
        when(sessionAuthService.getCurrentUser(null)).thenThrow(new BizException(ErrorCode.NOT_LOGIN));
        when(sessionAuthService.getCurrentUser("expired")).thenThrow(new BizException(ErrorCode.NOT_LOGIN));
        for (String token : new String[] {null, "expired"}) {
            var request = post(ROUTE).contentType(MediaType.APPLICATION_JSON).content(BODY);
            if (token != null) {
                request.cookie(new Cookie("auth_token", token));
            }
            mockMvc.perform(request).andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("NOT_LOGIN"));
        }
        verifyNoInteractions(imageResourceService);
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"originalFilename\":\"a.gif\",\"sizeBytes\":1}",
            "{\"originalFilename\":\"a.png\",\"sizeBytes\":1048577}"})
    void shouldRejectInvalidRequestBeforeCallingServices(String body) throws Exception {
        mockMvc.perform(post(ROUTE).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        verifyNoInteractions(sessionAuthService, imageResourceService);
    }

    @Test
    void shouldReturnSigningFailure() throws Exception {
        when(sessionAuthService.getCurrentUser("token")).thenReturn(new UserEntity());
        when(imageResourceService.createAvatarUploadTicket(any(), any()))
                .thenThrow(new BizException(ErrorCode.RESOURCE_UPLOAD_SIGN_FAILED));
        mockMvc.perform(post(ROUTE).cookie(new Cookie("auth_token", "token"))
                .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("RESOURCE_UPLOAD_SIGN_FAILED"));
    }
}
