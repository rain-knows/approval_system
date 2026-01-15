package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 审批类型实体类
 * 映射数据库表 approval_type
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("approval_type")
public class ApprovalType {

    /**
     * 类型ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 类型编码（如LEAVE/EXPENSE）
     */
    private String code;

    /**
     * 类型名称
     */
    private String name;

    /**
     * 类型描述
     */
    private String description;

    /**
     * 图标名称
     */
    private String icon;

    /**
     * 主题颜色
     */
    private String color;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态: 0-禁用 1-启用
     */
    private Integer status;

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
}
