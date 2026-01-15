package com.approval.vo;

import com.approval.entity.Attachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 附件视图对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentVO {

    /**
     * 附件ID
     */
    private String id;

    /**
     * 原始文件名
     */
    private String fileName;

    /**
     * 文件访问路径
     */
    private String fileUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 是否支持预览
     */
    private Boolean previewSupport;

    /**
     * 从实体类构建VO
     *
     * @param attachment 附件实体
     * @return 附件VO
     */
    public static AttachmentVO from(Attachment attachment) {
        if (attachment == null)
            return null;

        return AttachmentVO.builder()
                .id(attachment.getId())
                .fileName(attachment.getOriginalName())
                .fileUrl(attachment.getFilePath())
                .fileSize(attachment.getFileSize())
                .fileType(attachment.getFileType())
                .previewSupport(attachment.getPreviewSupport() != null && attachment.getPreviewSupport() == 1)
                .build();
    }
}
