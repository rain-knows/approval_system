package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.Result;
import com.approval.entity.Attachment;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.FileService;
import com.approval.vo.AttachmentVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 文件控制器
 * 处理文件上传、下载相关接口
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    @Value("${file.upload-dir:D:/uploads/approval-system}")
    private String uploadDir;

    /**
     * 上传文件
     *
     * @param file  上传的文件
     * @param type  文件类型/业务类型 (如 "avatar")
     * @param token JWT Token（用于获取上传者ID）
     * @return 附件信息
     */
    @PostMapping("/upload")
    @OperLog(module = LogModule.FILE, operation = LogOperation.UPLOAD, description = "上传文件")
    public Result<AttachmentVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestHeader("Authorization") String token) {
        // 从Token中获取用户ID
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);

        AttachmentVO attachment = fileService.uploadFile(file, userId, type);
        log.info("用户 {} 上传文件 (类型: {}): {}", userId, type, attachment.getFileName());

        return Result.success(attachment);
    }

    /**
     * 获取附件信息
     *
     * @param id 附件ID
     * @return 附件信息
     */
    @GetMapping("/{id}")
    @OperLog(module = LogModule.FILE, operation = LogOperation.VIEW, description = "查看附件信息")
    public Result<AttachmentVO> getFile(@PathVariable String id) {
        var attachment = fileService.getById(id);
        if (attachment == null) {
            return Result.error(404, "附件不存在");
        }
        return Result.success(AttachmentVO.from(attachment));
    }

    /**
     * 下载文件
     */
    @GetMapping("/download/{id}")
    @OperLog(module = LogModule.FILE, operation = LogOperation.DOWNLOAD, description = "下载文件")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        Attachment attachment = fileService.getById(id);
        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            // 解析真实路径
            // 数据库存储路径示例: /files/2026/01/13/xxx.doc
            String relativePath = attachment.getFilePath().replace("/files", "");
            Path path = Paths.get(uploadDir + relativePath);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\""
                                        + new String(attachment.getOriginalName().getBytes("UTF-8"), "ISO-8859-1")
                                        + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("文件下载失败", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 删除附件
     *
     * @param id 附件ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @OperLog(module = LogModule.FILE, operation = LogOperation.DELETE, description = "删除附件")
    public Result<Void> deleteFile(@PathVariable String id) {
        fileService.deleteById(id);
        return Result.success(null);
    }
}
