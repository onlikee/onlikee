package com.onlikee.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {

    // 通用错误
    BAD_REQUEST("BAD_REQUEST", "请求错误", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("VALIDATION_FAILED", "参数校验失败", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "未授权", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "禁止访问", HttpStatus.FORBIDDEN),
    NOT_FOUND("NOT_FOUND", "未找到资源", HttpStatus.NOT_FOUND),
    INTERNAL_ERROR("INTERNAL_ERROR", "服务器内部错误", HttpStatus.INTERNAL_SERVER_ERROR),
    MAX_UPLOAD_SIZE_EXCEEDED("MAX_UPLOAD_SIZE_EXCEEDED", "上传文件大小超过限制", HttpStatus.CONTENT_TOO_LARGE),
    DATA_TOO_LONG("DATA_TOO_LONG", "你提交了一些什么奇怪的东西？超过了长度限制！", HttpStatus.BAD_REQUEST),

    // 业务错误
    USER_NOT_FOUND("USER_NOT_FOUND", "未找到该用户", HttpStatus.NOT_FOUND),
    BAD_AUTHORIZED("BAD_AUTHORIZED", "授权失败", HttpStatus.UNAUTHORIZED),
    PENDING_SIGNUP_INVALID("PENDING_SIGNUP_INVALID", "注册会话已失效，请重新授权登录", HttpStatus.BAD_REQUEST),
    PENDING_SIGNUP_IN_PROGRESS("PENDING_SIGNUP_IN_PROGRESS", "注册资料正在提交，请稍后再试", HttpStatus.CONFLICT),
    NICKNAME_ALREADY_EXISTS("NICKNAME_ALREADY_EXISTS", "昵称已被占用", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "邮箱已被占用", HttpStatus.CONFLICT),
    OAUTH_ACCOUNT_ALREADY_BOUND("OAUTH_ACCOUNT_ALREADY_BOUND", "第三方账号已绑定其他用户", HttpStatus.CONFLICT),
    APP_URL_ALREADY_EXISTS("APP_URL_ALREADY_EXISTS", "应用地址已存在", HttpStatus.CONFLICT),
    APPLICATION_PACKAGE_INVALID("APPLICATION_PACKAGE_INVALID", "应用包无效", HttpStatus.BAD_REQUEST),
    APPLICATION_CREATE_FAILED("APPLICATION_CREATE_FAILED", "应用创建失败", HttpStatus.INTERNAL_SERVER_ERROR),
    APPLICATION_PUBLISH_FAILED("APPLICATION_PUBLISH_FAILED", "应用发布失败", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_UPLOAD_SIGN_FAILED("RESOURCE_UPLOAD_SIGN_FAILED", "上传凭证签发失败", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_LOGIN("NOT_LOGIN", "未登录或登录已过期", HttpStatus.OK),

    // 兜底错误
    UNKNOWN_ERROR("UNKNOWN_ERROR", "未知错误", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatusCode status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatusCode getStatus() {
        return status;
    }
}
