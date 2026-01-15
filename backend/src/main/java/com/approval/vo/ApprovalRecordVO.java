package com.approval.vo;

import com.approval.entity.ApprovalNode;
import com.approval.entity.Attachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 审批记录视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRecordVO {

    /**
     * 审批ID
     */
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
     * 审批类型名称
     */
    private String typeName;

    /**
     * 类型图标
     */
    private String typeIcon;

    /**
     * 类型颜色
     */
    private String typeColor;

    /**
     * 审批内容（JSON）
     */
    private String content;

    /**
     * 发起人ID
     */
    private Long initiatorId;

    /**
     * 发起人姓名
     */
    private String initiatorName;

    /**
     * 紧急程度
     */
    private Integer priority;

    /**
     * 状态码
     */
    private Integer status;

    /**
     * 状态名称
     */
    private String statusName;

    /**
     * 当前审批节点序号
     */
    private Integer currentNodeOrder;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 审批节点列表
     */
    private List<ApprovalNode> nodes;

    /**
     * 附件列表
     */
    private List<Attachment> attachments;

    /**
     * 获取状态名称
     *
     * @return 状态名称
     */
    public String getStatusName() {
        if (this.status == null)
            return "未知";
        switch (this.status) {
            case 0:
                return "草稿";
            case 1:
                return "待审批";
            case 2:
                return "审批中";
            case 3:
                return "已通过";
            case 4:
                return "已拒绝";
            case 5:
                return "已撤回";
            default:
                return "未知";
        }
    }
}
