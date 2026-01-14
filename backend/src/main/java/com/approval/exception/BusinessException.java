package com.approval.exception;

import lombok.Getter;

/**
 * 业务异常类
 * 用于抛出业务逻辑中的可预期异常
 */
@Getter
public class BusinessException extends RuntimeException {

    /** 错误码 */
    private final Integer code;

    /**
     * 构造业务异常
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    /**
     * 构造业务异常（默认 400 错误码）
     *
     * @param message 错误消息
     */
    public BusinessException(String message) {
        this(400, message);
    }
}
