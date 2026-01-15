package com.approval.service;

import com.approval.entity.Attachment;
import com.approval.vo.AttachmentVO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件服务接口
 */
public interface FileService {

    /**
     * 上传文件
     *
     * @param file       上传的文件
     * @param uploaderId 上传者ID
     * @return 附件信息
     */
    AttachmentVO uploadFile(MultipartFile file, Long uploaderId);

    /**
     * 根据ID获取附件信息
     *
     * @param id 附件ID
     * @return 附件实体
     */
    Attachment getById(String id);

    /**
     * 更新附件关联的审批ID
     *
     * @param attachmentId 附件ID
     * @param approvalId   审批ID
     */
    void updateApprovalId(String attachmentId, String approvalId);

    /**
     * 删除附件
     *
     * @param id 附件ID
     */
    void deleteById(String id);
}
