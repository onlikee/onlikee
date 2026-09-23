package com.onlikee.module.resource.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.onlikee.common.exception.BizException;
import com.onlikee.lightoss.LightOssClient;
import com.onlikee.module.resource.model.dto.AvatarUploadTicketDTO;
import com.onlikee.module.user.model.entity.UserEntity;
import com.sun.net.httpserver.HttpServer;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class ResourceUploadSigningServiceTest {
    private final ObjectMapper json = new ObjectMapper();
    private final AtomicReference<String> authorization = new AtomicReference<>();
    private final AtomicReference<String> body = new AtomicReference<>();
    private final AtomicReference<String> method = new AtomicReference<>();
    private HttpServer server;
    private LightOssClient client;
    private String baseUrl;
    private ImageResourceService imageService;
    private int responseStatus = 200;
    private String responseBody;

    @BeforeEach
    void startEndpoint() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/v1/sign/upload", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            method.set(exchange.getRequestMethod());
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(responseStatus, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        client = LightOssClient.builder(java.net.URI.create(baseUrl))
                .bearerToken("test-management-token").requestTimeout(Duration.ofSeconds(2)).build();
        imageService = new ImageResourceService();
        ReflectionTestUtils.setField(imageService, "signingService",
                new ResourceUploadSigningService(client, " " + baseUrl + "/ "));
    }

    @AfterEach
    void stopEndpoint() {
        client.close();
        server.stop(0);
    }

    // 通过真实 SDK 验证 HTTP 参数和序列化，同时覆盖中文、百分号及查询字符的原样传递。
    @Test
    void shouldSignAvatarWithExactPolicyAndPreserveAuthorization() throws Exception {
        String path = "/api/v1/buckets/image/objects/17900000001/avatar/%E5%A4%B4%E5%83%8F%20%2520%20%23%3F.png?token=a%2Fb%2Bc";
        Map<String, String> headers = Map.of("Content-Type", "image/png", "X-Allow-Overwrite", "true",
                "X-Object-Visibility", "public", "X-Original-Filename", "%E5%A4%B4%E5%83%8F.png",
                "X-Future-Signed-Header", "preserve-me");
        responseBody = json.writeValueAsString(Map.of("request_id", "test-request", "data",
                Map.of("method", "PUT", "path", path, "headers", headers, "expires_at", 1790000000L)));

        var result = imageService.createAvatarUploadTicket(user(42, "17900000001"), request());

        assertEquals("POST", method.get());
        assertEquals("Bearer test-management-token", authorization.get());
        JsonNode sent = json.readTree(body.get());
        assertEquals("image", sent.get("bucket").asString());
        assertEquals("17900000001/avatar/头像 %20 #?.png", sent.get("object_key").asString());
        assertEquals("头像 %20 #?.png", sent.get("original_filename").asString());
        assertEquals(102400, sent.get("max_size_bytes").asLong());
        assertEquals("image/png", sent.get("content_type").asString());
        assertEquals("public", sent.get("visibility").asString());
        assertTrue(sent.get("allow_overwrite").asBoolean());
        assertEquals(300, sent.get("expires_in_seconds").asLong());
        assertEquals(baseUrl + path, result.getUploadUrl());
        assertEquals(headers, result.getHeaders());
        assertEquals("PUT", result.getMethod());
        assertEquals(1790000000L, result.getExpiresAt());
        assertEquals("image", result.getBucket());
        assertEquals("17900000001/avatar/头像 %20 #?.png", result.getObjectKey());
        assertFalse(json.writeValueAsString(result).contains("test-management-token"));

        // 同一文件名重复签发仍允许覆盖；另一用户始终使用自己的目录。
        imageService.createAvatarUploadTicket(user(42, "17900000001"), request());
        assertEquals("17900000001/avatar/头像 %20 #?.png", json.readTree(body.get()).get("object_key").asString());
        imageService.createAvatarUploadTicket(user(99, "17900000002"), request());
        assertEquals("17900000002/avatar/头像 %20 #?.png", json.readTree(body.get()).get("object_key").asString());
    }

    @Test
    void shouldTranslateUpstreamAndProtocolFailuresWithoutLeakingDetails() {
        responseStatus = 403;
        responseBody = """
                {"request_id":"test-request","error":{"code":"forbidden","message":"secret detail"}}
                """;
        assertSigningFailure();
        responseStatus = 200;
        responseBody = "{}";
        assertSigningFailure();
    }

    @Test
    void shouldTranslateTransportFailure() {
        server.stop(0);
        assertSigningFailure();
    }

    private void assertSigningFailure() {
        BizException exception = assertThrows(BizException.class,
                () -> imageService.createAvatarUploadTicket(user(42, "17900000001"), request()));
        assertEquals("RESOURCE_UPLOAD_SIGN_FAILED", exception.getCode());
        assertEquals("上传凭证签发失败", exception.getMessage());
    }

    private UserEntity user(long id, String uuid) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setUuid(uuid);
        return user;
    }

    private AvatarUploadTicketDTO request() {
        AvatarUploadTicketDTO request = new AvatarUploadTicketDTO();
        request.setOriginalFilename("头像 %20 #?.png");
        request.setContentType("");
        request.setSizeBytes(102400L);
        return request;
    }
}
