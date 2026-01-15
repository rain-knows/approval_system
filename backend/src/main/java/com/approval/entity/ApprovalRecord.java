package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 审批记录实体类
 * 映射数据库表 approval_record
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("approval_record")
public class ApprovalRecord {

    /**
     * 审批ID (UUID)
     */
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 审批标题
     */
    private String title;

    /**
     * 审批类型编码
     */
    private String typeCode;

    /**
     * 审批内容（支持JSON）
     */
    private String content;

    /**
     * 发起人ID
     */
    private Long initiatorId;

    /**
     * 紧急程度: 0-普通 1-紧急 2-非常紧急
     */
    private Integer priority;

    /**
     * 截止日期
     */
    private LocalDateTime deadline;

    /**
     * 状态码: 0-草稿 1-待审批 2-审批中 3-已通过 4-已拒绝 5-已撤回
     */
    private Integer status;

    /**
     * 当前审批节点序号
     */
    private Integer currentNodeOrder;

    /**
     * 使用的工作流模板ID
     */
    private Long workflowId;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;
}
