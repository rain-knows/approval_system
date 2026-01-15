package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 审批节点实体类
 * 映射数据库表 approval_node
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("approval_node")
public class ApprovalNode {

    /**
     * 节点ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 审批记录ID
     */
    private String approvalId;

    /**
     * 节点名称
     */
    private String nodeName;

    /**
     * 审批人ID
     */
    private Long approverId;

    /**
     * 节点顺序
     */
    private Integer nodeOrder;

    /**
     * 状态: 0-待审批 1-已通过 2-已拒绝
     */
    private Integer status;

    /**
     * 审批意见
     */
    private String comment;

    /**
     * 审批时间
     */
    private LocalDateTime approvedAt;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
