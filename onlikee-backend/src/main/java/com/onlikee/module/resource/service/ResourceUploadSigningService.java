package com.onlikee.module.resource.service;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.onlikee.common.exception.BizException;
import com.onlikee.common.exception.ErrorCode;
import com.onlikee.lightoss.LightOssClient;
import com.onlikee.lightoss.SigningClient.SignUploadRequest;
import com.onlikee.lightoss.exception.LightOssException;
import com.onlikee.module.resource.converter.ToVO;
import com.onlikee.module.resource.model.vo.ResourceUploadTicketVO;

@Service
public class ResourceUploadSigningService {
    private final LightOssClient lightOssClient;
    private final URI apiBaseUri;

    public ResourceUploadSigningService(LightOssClient lightOssClient,
            @Value("${light-oss.api-base-url}") String apiBaseUrl) {
        this.lightOssClient = lightOssClient;
        this.apiBaseUri = URI.create(apiBaseUrl.trim());
    }

    // 各资源业务只决定授权策略，SDK 调用和异常翻译集中在此处。
    public ResourceUploadTicketVO signUpload(SignUploadRequest request) {
        try {
            return ToVO.toResourceUploadTicketVO(apiBaseUri, request.bucket(), request.objectKey(),
                    lightOssClient.signing().signUpload(request).data());
        } catch (LightOssException exception) {
            throw new BizException(ErrorCode.RESOURCE_UPLOAD_SIGN_FAILED);
        }
    }
}
