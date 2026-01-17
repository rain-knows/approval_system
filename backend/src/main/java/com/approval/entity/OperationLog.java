package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 操作日志实体类
 * 记录系统操作日志，用于审计追踪
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("operation_log")
public class OperationLog {

    /** 日志ID */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 操作用户ID */
    private Long userId;

    /** 模块名称 */
    private String module;

    /** 操作类型 */
    private String operation;

    /** 目标业务ID */
    private String targetId;

    /** 操作详情 */
    private String detail;

    /** 客户端IP地址 */
    private String ipAddress;

    /** 用户代理信息 */
    private String userAgent;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
