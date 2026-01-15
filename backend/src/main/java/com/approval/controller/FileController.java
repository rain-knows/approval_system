package com.approval.controller;

import com.approval.common.Result;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.FileService;
import com.approval.vo.AttachmentVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件控制器
 * 处理文件上传、下载相关接口
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileService fileService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 上传文件
     *
     * @param file  上传的文件
     * @param token JWT Token（用于获取上传者ID）
     * @return 附件信息
     */
    @PostMapping("/upload")
    public Result<AttachmentVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {
        // 从Token中获取用户ID
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);

        AttachmentVO attachment = fileService.uploadFile(file, userId);
        log.info("用户 {} 上传文件: {}", userId, attachment.getFileName());

        return Result.success(attachment);
    }

    /**
     * 获取附件信息
     *
     * @param id 附件ID
     * @return 附件信息
     */
    @GetMapping("/{id}")
    public Result<AttachmentVO> getFile(@PathVariable String id) {
        var attachment = fileService.getById(id);
        if (attachment == null) {
            return Result.error(404, "附件不存在");
        }
        return Result.success(AttachmentVO.from(attachment));
    }

    /**
     * 删除附件
     *
     * @param id 附件ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteFile(@PathVariable String id) {
        fileService.deleteById(id);
        return Result.success(null);
    }
}
