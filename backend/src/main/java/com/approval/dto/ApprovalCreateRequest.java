package com.approval.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 发起审批请求DTO
 */
@Data
public class ApprovalCreateRequest {

    /**
     * 审批标题
     */
    @NotBlank(message = "审批标题不能为空")
    private String title;

    /**
     * 审批类型编码
     */
    @NotBlank(message = "审批类型不能为空")
    private String typeCode;

    /**
     * 审批内容（JSON格式）
     */
    private String content;

    /**
     * 紧急程度: 0-普通 1-紧急 2-非常紧急
     */
    private Integer priority;

    /**
     * 截止日期
     */
    private LocalDateTime deadline;

    /**
     * 附件ID列表
     */
    private List<String> attachmentIds;
}
