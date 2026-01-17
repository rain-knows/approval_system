package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.PageResult;
import com.approval.common.Result;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.NotificationService;
import com.approval.vo.NotificationVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 通知控制器
 * 处理通知相关接口
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 获取通知列表
     *
     * @param page     页码
     * @param pageSize 每页条数
     * @param isRead   是否已读筛选（可选）
     * @param token    JWT Token
     * @return 分页结果
     */
    @GetMapping
    @OperLog(module = LogModule.NOTIFICATION, operation = LogOperation.QUERY, description = "查询通知列表", logParams = false)
    public Result<PageResult<NotificationVO>> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Boolean isRead,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        IPage<NotificationVO> result = notificationService.getNotifications(userId, page, pageSize, isRead);
        return Result.success(PageResult.of(result));
    }

    /**
     * 标记单条通知为已读
     *
     * @param id    通知ID
     * @param token JWT Token
     * @return 操作结果
     */
    @PutMapping("/{id}/read")
    @OperLog(module = LogModule.NOTIFICATION, operation = LogOperation.UPDATE, description = "标记通知为已读")
    public Result<Void> markAsRead(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        notificationService.markAsRead(id, userId);
        return Result.success();
    }

    /**
     * 标记所有通知为已读
     *
     * @param token JWT Token
     * @return 操作结果
     */
    @PutMapping("/read-all")
    @OperLog(module = LogModule.NOTIFICATION, operation = LogOperation.UPDATE, description = "标记所有通知为已读")
    public Result<Void> markAllAsRead(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        notificationService.markAllAsRead(userId);
        return Result.success();
    }

    /**
     * 获取未读通知数量
     *
     * @param token JWT Token
     * @return 未读数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Integer>> getUnreadCount(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        int count = notificationService.getUnreadCount(userId);
        return Result.success(Map.of("count", count));
    }
}
