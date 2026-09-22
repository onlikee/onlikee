package com.onlikee.module.resource.model.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class AvatarUploadTicketDTOTest {
    private static final ValidatorFactory FACTORY = Validation.buildDefaultValidatorFactory();
    private static final Validator VALIDATOR = FACTORY.getValidator();

    @AfterAll
    static void closeValidator() {
        FACTORY.close();
    }

    // 与前端同样接受大小写扩展名和空 MIME，推导出标准 MIME 用于签名。
    @ParameterizedTest
    @CsvSource({"x.JPG,image/jpeg", "x.jpeg,image/jpeg", "x.PNG,image/png",
            "x.webp,image/webp", "头像.svg,image/svg+xml"})
    void shouldAcceptSupportedFormats(String filename, String type) {
        AvatarUploadTicketDTO request = request(filename, type.toUpperCase(), 1048576L);
        assertTrue(VALIDATOR.validate(request).isEmpty());
        assertEquals(type, request.resolvedContentType());
        request.setContentType("");
        assertTrue(VALIDATOR.validate(request).isEmpty());
        request.setContentType(null);
        assertTrue(VALIDATOR.validate(request).isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "../a.png", "a/b.png", "a\\b.png", "a\n.png", "a\u0000.png",
            "a.gif", "a.txt", "png", "a.png "})
    void shouldRejectInvalidFilenameOrFormat(String filename) {
        assertFalse(VALIDATOR.validate(request(filename, "", 1L)).isEmpty());
    }

    @Test
    void shouldRejectMissingFieldsContradictoryMimeAndOversizedFiles() {
        assertFalse(VALIDATOR.validate(request(null, null, null)).isEmpty());
        assertFalse(VALIDATOR.validate(request("a.jpg", "image/png", 1L)).isEmpty());
        for (long size : new long[] {-1, 0, 1048577}) {
            assertFalse(VALIDATOR.validate(request("a.png", "image/png", size)).isEmpty());
        }
        assertFalse(VALIDATOR.validate(request("a".repeat(482) + ".png", "image/png", 1L)).isEmpty());
        assertFalse(VALIDATOR.validate(request("头".repeat(161) + ".png", "image/png", 1L)).isEmpty());
        assertTrue(VALIDATOR.validate(request("a".repeat(481) + ".png", "image/png", 1L)).isEmpty());
        assertTrue(VALIDATOR.validate(request("头像 %20 #?.png", "image/png", 1L)).isEmpty());
    }

    private AvatarUploadTicketDTO request(String filename, String type, Long size) {
        AvatarUploadTicketDTO request = new AvatarUploadTicketDTO();
        request.setOriginalFilename(filename);
        request.setContentType(type);
        request.setSizeBytes(size);
        return request;
    }
}
