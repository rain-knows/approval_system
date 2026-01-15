package com.approval.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 附件实体类
 * 映射数据库表 attachment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("attachment")
public class Attachment {

    /**
     * 附件ID (UUID)
     */
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 关联审批ID
     */
    private String approvalId;

    /**
     * 原始文件名
     */
    private String originalName;

    /**
     * 存储文件名
     */
    private String storedName;

    /**
     * 文件存储路径
     */
    private String filePath;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型（pdf/docx/xlsx等）
     */
    private String fileType;

    /**
     * MIME 类型
     */
    private String mimeType;

    /**
     * 是否支持在线预览: 0-不支持 1-支持
     */
    private Integer previewSupport;

    /**
     * 上传者ID
     */
    private Long uploaderId;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
