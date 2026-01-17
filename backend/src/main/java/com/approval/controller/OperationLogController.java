package com.approval.controller;

import com.approval.common.PageResult;
import com.approval.common.Result;
import com.approval.dto.OperationLogQueryDTO;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.service.OperationLogService;
import com.approval.vo.OperationLogVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * 操作日志控制器
 * 提供日志查询和统计接口（仅管理员可访问）
 */
@RestController
@RequestMapping("/api/v1/logs")
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    /**
     * 分页查询操作日志列表
     *
     * @param page            页码
     * @param pageSize        每页条数
     * @param module          模块筛选
     * @param operation       操作类型筛选
     * @param userId          用户ID筛选
     * @param usernameKeyword 用户名/昵称关键词搜索
     * @param targetId        目标业务ID
     * @param startDate       开始日期
     * @param endDate         结束日期
     * @param keyword         详情关键词搜索
     * @return 分页日志列表
     */
    @GetMapping
    public Result<PageResult<OperationLogVO>> getLogs(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String usernameKeyword,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String keyword) {
        OperationLogQueryDTO queryDTO = new OperationLogQueryDTO();
        queryDTO.setPage(page);
        queryDTO.setPageSize(pageSize);
        queryDTO.setModule(module);
        queryDTO.setOperation(operation);
        queryDTO.setUserId(userId);
        queryDTO.setUsernameKeyword(usernameKeyword);
        queryDTO.setTargetId(targetId);
        queryDTO.setStartDate(startDate);
        queryDTO.setEndDate(endDate);
        queryDTO.setKeyword(keyword);

        PageResult<OperationLogVO> result = operationLogService.queryLogs(queryDTO);
        return Result.success(result);
    }

    /**
     * 获取日志统计信息
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 统计信息
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        OperationLogQueryDTO queryDTO = new OperationLogQueryDTO();
        queryDTO.setStartDate(startDate);
        queryDTO.setEndDate(endDate);

        Map<String, Object> statistics = operationLogService.getStatistics(queryDTO);
        return Result.success(statistics);
    }

    /**
     * 根据业务ID查询操作日志
     *
     * @param targetId 业务ID
     * @return 相关日志列表
     */
    @GetMapping("/target/{targetId}")
    public Result<List<OperationLogVO>> getLogsByTargetId(@PathVariable String targetId) {
        List<OperationLogVO> logs = operationLogService.queryByTargetId(targetId);
        return Result.success(logs);
    }

    /**
     * 获取模块列表（用于前端筛选下拉框）
     *
     * @return 模块列表
     */
    @GetMapping("/modules")
    public Result<List<Map<String, String>>> getModules() {
        List<Map<String, String>> modules = new ArrayList<>();
        for (LogModule module : LogModule.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("code", module.getCode());
            item.put("name", module.getName());
            modules.add(item);
        }
        return Result.success(modules);
    }

    /**
     * 获取操作类型列表（用于前端筛选下拉框）
     *
     * @return 操作类型列表
     */
    @GetMapping("/operations")
    public Result<List<Map<String, String>>> getOperations() {
        List<Map<String, String>> operations = new ArrayList<>();
        for (LogOperation operation : LogOperation.values()) {
            Map<String, String> item = new HashMap<>();
            item.put("code", operation.getCode());
            item.put("name", operation.getName());
            operations.add(item);
        }
        return Result.success(operations);
    }
}
