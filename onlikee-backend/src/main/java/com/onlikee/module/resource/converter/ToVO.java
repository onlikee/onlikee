package com.onlikee.module.resource.converter;

import java.net.URI;

import com.onlikee.lightoss.model.SignedUpload;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;

public final class ToVO {
    private ToVO() {
    }

    // 保留 SDK 路径的原始转义和全部签名头，避免重新编码使签名失效。
    public static ResourceUploadTicketVO toResourceUploadTicketVO(
            URI apiBaseUri, String bucket, String objectKey, SignedUpload signed) {
        ResourceUploadTicketVO result = new ResourceUploadTicketVO();
        result.setUploadUrl(apiBaseUri.resolve(signed.path()).toASCIIString());
        result.setMethod(signed.method());
        result.setHeaders(signed.headers());
        result.setExpiresAt(signed.expiresAt().getEpochSecond());
        result.setBucket(bucket);
        result.setObjectKey(objectKey);
        return result;
    }
}
