package com.onlikee.module.resource.model.dto;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AvatarUploadTicketDTO {
    // 与 ImageUpload 的扩展名及 MIME 合同一致，空 MIME 按扩展名推导。
    private static final Map<String, String> IMAGE_TYPES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png",
            "webp", "image/webp", "svg", "image/svg+xml");

    @NotBlank(message = "originalFilename不能为空")
    private String originalFilename;

    private String contentType;

    @NotNull(message = "sizeBytes不能为空")
    @Positive(message = "文件不能为空")
    @Max(value = 1048576, message = "头像大小不能超过1 MiB")
    private Long sizeBytes;

    // 文件名不得改变当前用户的目录；保留 485 字节上限，为用户短 UUID 和 /avatar/ 预留路径长度。
    @AssertTrue(message = "文件名不能包含路径或控制字符，且UTF-8长度不能超过485字节")
    public boolean isFilenameValid() {
        return originalFilename == null || (originalFilename.getBytes(StandardCharsets.UTF_8).length <= 485
                && !originalFilename.contains("/")
                && !originalFilename.contains("..")
                && !originalFilename.contains("\\")
                && originalFilename.codePoints().noneMatch(Character::isISOControl));
    }

    @AssertTrue(message = "仅支持JPG、JPEG、PNG、WebP、SVG，且MIME必须与扩展名一致")
    public boolean isImageTypeValid() {
        if (originalFilename == null || originalFilename.isBlank()) {
            return true;
        }
        String expected = resolvedContentType();
        return expected != null && (contentType == null || contentType.isEmpty()
                || expected.equals(contentType.toLowerCase(Locale.ROOT)));
    }

    public String resolvedContentType() {
        if (originalFilename == null) {
            return null;
        }
        int dot = originalFilename.lastIndexOf('.');
        return dot < 0 ? null : IMAGE_TYPES.get(originalFilename.substring(dot + 1).toLowerCase(Locale.ROOT));
    }
}
