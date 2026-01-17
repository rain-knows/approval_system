package com.approval.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 操作日志视图对象
 * 用于日志列表展示，包含关联的用户信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationLogVO {

    /** 日志ID */
    private Long id;

    /** 操作用户ID */
    private Long userId;

    /** 用户名 */
    private String username;

    /** 用户昵称 */
    private String nickname;

    /** 模块编码 */
    private String module;

    /** 模块名称（计算字段） */
    private String moduleName;

    /** 操作编码 */
    private String operation;

    /** 操作名称（计算字段） */
    private String operationName;

    /** 目标业务ID */
    private String targetId;

    /** 操作详情 */
    private String detail;

    /** 客户端IP地址 */
    private String ipAddress;

    /** 用户代理信息 */
    private String userAgent;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
