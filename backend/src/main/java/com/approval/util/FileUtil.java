package com.approval.util;

import com.approval.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件操作工具类
 * 处理文件上传、验证和删除操作
 */
@Component
@Slf4j
public class FileUtil {

    @Value("${file.upload-dir:D:/uploads/approval-system}")
    private String uploadDir;

    @Value("${file.allowed-types:doc,docx,xls,xlsx,ppt,pptx,pdf,txt,jpg,jpeg,png,gif,zip,rar}")
    private String allowedTypes;

    @Value("${file.max-size:52428800}")
    private long maxSize;

    /**
     * 文件信息内部类
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class FileInfo {
        private String originalName;
        private String storedName;
        private String filePath;
        private Long fileSize;
        private String fileType;
        private String mimeType;
    }

    /**
     * 上传文件
     *
     * @param file 上传的文件
     * @return 文件存储信息
     */
    public FileInfo uploadFile(MultipartFile file) {
        return uploadFile(file, null);
    }

    /**
     * 上传文件（指定目录）
     *
     * @param file   上传的文件
     * @param subDir 子目录（如 "avatar"），为空则按日期生成
     * @return 文件存储信息
     */
    public FileInfo uploadFile(MultipartFile file, String subDir) {
        // 验证文件
        validateFile(file);

        String relativePath;
        String storedName;
        String extension = getExtension(file.getOriginalFilename());

        if (subDir != null && !subDir.isEmpty()) {
            // 指定目录模式
            storedName = UUID.randomUUID().toString() + extension;
            relativePath = subDir + "/" + storedName;
        } else {
            // 默认日期目录模式
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            storedName = UUID.randomUUID().toString() + extension;
            relativePath = datePath + "/" + storedName;
        }

        String fullPath = uploadDir + "/" + relativePath;

        // 创建目录
        File fileObj = new File(fullPath);
        File dir = fileObj.getParentFile();
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (!created) {
                log.error("无法创建目录: {}", dir.getAbsolutePath());
                throw new BusinessException(500, "文件上传失败：无法创建存储目录");
            }
        }

        // 保存文件
        try {
            file.transferTo(fileObj);
            log.info("文件上传成功: {}", fullPath);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException(500, "文件上传失败：" + e.getMessage());
        }

        return FileInfo.builder()
                .originalName(file.getOriginalFilename())
                .storedName(storedName)
                .filePath("/files/" + relativePath)
                .fileSize(file.getSize())
                .fileType(extension.replace(".", ""))
                .mimeType(file.getContentType())
                .build();
    }

    /**
     * 删除文件
     *
     * @param filePath 文件访问路径（以/files/开头）
     * @return 是否删除成功
     */
    public boolean deleteFile(String filePath) {
        String fullPath = uploadDir + filePath.replace("/files", "");
        File file = new File(fullPath);
        if (file.exists()) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("文件删除成功: {}", fullPath);
            } else {
                log.warn("文件删除失败: {}", fullPath);
            }
            return deleted;
        }
        return false;
    }

    /**
     * 验证文件
     *
     * @param file 待验证的文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "文件不能为空");
        }

        if (file.getSize() > maxSize) {
            throw new BusinessException(400, "文件大小超出限制（最大" + (maxSize / 1024 / 1024) + "MB）");
        }

        String ext = getExtension(file.getOriginalFilename()).replace(".", "").toLowerCase();
        List<String> allowed = Arrays.asList(allowedTypes.split(","));
        if (!allowed.contains(ext)) {
            throw new BusinessException(400, "不支持的文件类型: " + ext);
        }
    }

    /**
     * 获取文件扩展名
     *
     * @param filename 文件名
     * @return 扩展名（带点）
     */
    private String getExtension(String filename) {
        if (filename == null)
            return "";
        int dotIndex = filename.lastIndexOf(".");
        return dotIndex > 0 ? filename.substring(dotIndex) : "";
    }

    /**
     * 判断是否支持预览
     *
     * @param fileType 文件类型
     * @return 1-支持 0-不支持
     */
    public int getPreviewSupport(String fileType) {
        List<String> previewableTypes = Arrays.asList("pdf", "jpg", "jpeg", "png", "gif", "txt");
        return previewableTypes.contains(fileType.toLowerCase()) ? 1 : 0;
    }
}
