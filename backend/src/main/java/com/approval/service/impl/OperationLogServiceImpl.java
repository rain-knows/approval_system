package com.approval.service.impl;

import com.approval.common.PageResult;
import com.approval.dto.OperationLogQueryDTO;
import com.approval.entity.OperationLog;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.mapper.OperationLogMapper;
import com.approval.service.OperationLogService;
import com.approval.vo.OperationLogVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 操作日志服务实现类
 * 提供日志记录和查询的具体实现
 */
@Slf4j
@Service
public class OperationLogServiceImpl implements OperationLogService {

    @Autowired
    private OperationLogMapper operationLogMapper;

    /**
     * 同步记录操作日志
     */
    @Override
    public void log(Long userId, String module, String operation,
            String targetId, String detail,
            String ipAddress, String userAgent) {
        try {
            OperationLog logEntity = OperationLog.builder()
                    .userId(userId != null ? userId : 0L)
                    .module(module)
                    .operation(operation)
                    .targetId(targetId)
                    .detail(detail)
                    .ipAddress(ipAddress)
                    .userAgent(truncate(userAgent, 500))
                    .createdAt(LocalDateTime.now())
                    .build();

            operationLogMapper.insert(logEntity);
            log.debug("操作日志记录成功: module={}, operation={}", module, operation);
        } catch (Exception e) {
            log.error("记录操作日志失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 异步记录操作日志
     */
    @Async
    @Override
    public void logAsync(Long userId, String module, String operation,
            String targetId, String detail,
            String ipAddress, String userAgent) {
        log(userId, module, operation, targetId, detail, ipAddress, userAgent);
    }

    /**
     * 分页查询日志
     */
    @Override
    public PageResult<OperationLogVO> queryLogs(OperationLogQueryDTO queryDTO) {
        Page<OperationLogVO> page = new Page<>(queryDTO.getPage(), queryDTO.getPageSize());

        // 转换日期为时间范围
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;

        if (queryDTO.getStartDate() != null) {
            startTime = queryDTO.getStartDate().atStartOfDay();
        }
        if (queryDTO.getEndDate() != null) {
            endTime = queryDTO.getEndDate().atTime(LocalTime.MAX);
        }

        IPage<OperationLogVO> resultPage = operationLogMapper.selectLogPage(
                page,
                queryDTO.getModule(),
                queryDTO.getOperation(),
                queryDTO.getUserId(),
                queryDTO.getUsernameKeyword(),
                queryDTO.getTargetId(),
                startTime,
                endTime,
                queryDTO.getKeyword());

        // 填充模块名称和操作名称
        for (OperationLogVO vo : resultPage.getRecords()) {
            fillNames(vo);
        }

        return PageResult.of(resultPage);
    }

    /**
     * 根据用户ID查询操作日志
     */
    @Override
    public PageResult<OperationLogVO> queryByUserId(Long userId, int page, int pageSize) {
        OperationLogQueryDTO queryDTO = new OperationLogQueryDTO();
        queryDTO.setUserId(userId);
        queryDTO.setPage(page);
        queryDTO.setPageSize(pageSize);
        return queryLogs(queryDTO);
    }

    /**
     * 根据业务ID查询操作日志
     */
    @Override
    public List<OperationLogVO> queryByTargetId(String targetId) {
        OperationLogQueryDTO queryDTO = new OperationLogQueryDTO();
        queryDTO.setTargetId(targetId);
        queryDTO.setPage(1);
        queryDTO.setPageSize(100);

        PageResult<OperationLogVO> result = queryLogs(queryDTO);
        return result.getList();
    }

    /**
     * 获取日志统计信息
     */
    @Override
    public Map<String, Object> getStatistics(OperationLogQueryDTO queryDTO) {
        Map<String, Object> statistics = new HashMap<>();

        // 默认统计最近30天
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(30);

        if (queryDTO.getStartDate() != null) {
            startTime = queryDTO.getStartDate().atStartOfDay();
        }
        if (queryDTO.getEndDate() != null) {
            endTime = queryDTO.getEndDate().atTime(LocalTime.MAX);
        }

        // 总数统计
        LambdaQueryWrapper<OperationLog> countWrapper = new LambdaQueryWrapper<>();
        countWrapper.ge(OperationLog::getCreatedAt, startTime)
                .le(OperationLog::getCreatedAt, endTime);
        long totalCount = operationLogMapper.selectCount(countWrapper);
        statistics.put("totalCount", totalCount);

        // 按模块统计
        List<Map<String, Object>> moduleStats = operationLogMapper.countByModule(startTime, endTime);
        List<Map<String, Object>> moduleStatsWithNames = new ArrayList<>();
        for (Map<String, Object> stat : moduleStats) {
            Map<String, Object> newStat = new HashMap<>(stat);
            String moduleCode = (String) stat.get("module");
            LogModule logModule = LogModule.fromCode(moduleCode);
            newStat.put("moduleName", logModule != null ? logModule.getName() : moduleCode);
            moduleStatsWithNames.add(newStat);
        }
        statistics.put("moduleStats", moduleStatsWithNames);

        // 按操作类型统计
        List<Map<String, Object>> operationStats = operationLogMapper.countByOperation(startTime, endTime);
        List<Map<String, Object>> operationStatsWithNames = new ArrayList<>();
        for (Map<String, Object> stat : operationStats) {
            Map<String, Object> newStat = new HashMap<>(stat);
            String operationCode = (String) stat.get("operation");
            LogOperation logOperation = LogOperation.fromCode(operationCode);
            newStat.put("operationName", logOperation != null ? logOperation.getName() : operationCode);
            operationStatsWithNames.add(newStat);
        }
        statistics.put("operationStats", operationStatsWithNames);

        // 每日统计
        List<Map<String, Object>> dailyStats = operationLogMapper.countByDay(startTime, endTime);
        statistics.put("dailyStats", dailyStats);

        return statistics;
    }

    /**
     * 填充模块名称和操作名称
     */
    private void fillNames(OperationLogVO vo) {
        if (vo.getModule() != null) {
            LogModule logModule = LogModule.fromCode(vo.getModule());
            vo.setModuleName(logModule != null ? logModule.getName() : vo.getModule());
        }
        if (vo.getOperation() != null) {
            LogOperation logOperation = LogOperation.fromCode(vo.getOperation());
            vo.setOperationName(logOperation != null ? logOperation.getName() : vo.getOperation());
        }
    }

    /**
     * 截断字符串
     */
    private String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        return str.length() <= maxLength ? str : str.substring(0, maxLength);
    }
}
