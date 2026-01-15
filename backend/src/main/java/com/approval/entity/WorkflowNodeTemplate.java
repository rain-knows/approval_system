package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 工作流节点模板实体类
 * 映射数据库表 workflow_node_template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow_node_template")
public class WorkflowNodeTemplate {

    /**
     * 节点模板ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 工作流模板ID
     */
    private Long workflowId;

    /**
     * 节点名称（如：直属上级）
     */
    private String nodeName;

    /**
     * 节点顺序
     */
    private Integer nodeOrder;

    /**
     * 审批人类型: USER/POSITION/DEPARTMENT_HEAD
     */
    private String approverType;

    /**
     * 指定审批人/职位ID
     */
    private Long approverId;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
