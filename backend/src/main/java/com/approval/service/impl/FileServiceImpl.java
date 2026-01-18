package com.approval.service.impl;

import com.approval.entity.Attachment;
import com.approval.mapper.AttachmentMapper;
import com.approval.service.FileService;
import com.approval.util.FileUtil;
import com.approval.vo.AttachmentVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    private final FileUtil fileUtil;
    private final AttachmentMapper attachmentMapper;

    @Override
    public AttachmentVO uploadFile(MultipartFile file, Long uploaderId) {
        return uploadFile(file, uploaderId, null);
    }

    @Override
    public AttachmentVO uploadFile(MultipartFile file, Long uploaderId, String bizType) {
        // 上传文件到磁盘 (传递 bizType 作为子目录)
        FileUtil.FileInfo fileInfo = fileUtil.uploadFile(file, bizType);

        // 保存附件记录到数据库
        Attachment attachment = Attachment.builder()
                .originalName(fileInfo.getOriginalName())
                .storedName(fileInfo.getStoredName())
                .filePath(fileInfo.getFilePath())
                .fileSize(fileInfo.getFileSize())
                .fileType(fileInfo.getFileType())
                .mimeType(fileInfo.getMimeType())
                .previewSupport(fileUtil.getPreviewSupport(fileInfo.getFileType()))
                .uploaderId(uploaderId)
                .build();

        attachmentMapper.insert(attachment);
        log.info("附件记录已保存: id={}, name={}", attachment.getId(), attachment.getOriginalName());

        return AttachmentVO.from(attachment);
    }

    @Override
    public Attachment getById(String id) {
        return attachmentMapper.selectById(id);
    }

    @Override
    public void updateApprovalId(String attachmentId, String approvalId) {
        Attachment attachment = attachmentMapper.selectById(attachmentId);
        if (attachment != null) {
            attachment.setApprovalId(approvalId);
            attachmentMapper.updateById(attachment);
        }
    }

    @Override
    public void deleteById(String id) {
        Attachment attachment = attachmentMapper.selectById(id);
        if (attachment != null) {
            // 删除磁盘文件
            fileUtil.deleteFile(attachment.getFilePath());
            // 删除数据库记录
            attachmentMapper.deleteById(id);
        }
    }
}
