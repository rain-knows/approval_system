package com.approval.vo;

import com.approval.entity.ApprovalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 审批类型视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalTypeVO {

    /**
     * 类型ID
     */
    private Long id;

    /**
     * 类型编码
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
     * 从实体类构建VO
     *
     * @param type 审批类型实体
     * @return 审批类型VO
     */
    public static ApprovalTypeVO from(ApprovalType type) {
        if (type == null)
            return null;

        return ApprovalTypeVO.builder()
                .id(type.getId())
                .code(type.getCode())
                .name(type.getName())
                .description(type.getDescription())
                .icon(type.getIcon())
                .color(type.getColor())
                .build();
    }
}
