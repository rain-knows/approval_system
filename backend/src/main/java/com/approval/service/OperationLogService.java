package com.approval.service;

import com.approval.common.PageResult;
import com.approval.dto.OperationLogQueryDTO;
import com.approval.vo.OperationLogVO;

import java.util.List;
import java.util.Map;

/**
 * 操作日志服务接口
 * 提供日志记录和查询功能
 */
public interface OperationLogService {

    /**
     * 记录操作日志
     *
     * @param userId    操作用户ID
     * @param module    模块名称
     * @param operation 操作类型
     * @param targetId  目标业务ID
     * @param detail    操作详情
     * @param ipAddress 客户端IP
     * @param userAgent 用户代理
     */
    void log(Long userId, String module, String operation,
            String targetId, String detail,
            String ipAddress, String userAgent);

    /**
     * 异步记录操作日志
     *
     * @param userId    操作用户ID
     * @param module    模块名称
     * @param operation 操作类型
     * @param targetId  目标业务ID
     * @param detail    操作详情
     * @param ipAddress 客户端IP
     * @param userAgent 用户代理
     */
    void logAsync(Long userId, String module, String operation,
            String targetId, String detail,
            String ipAddress, String userAgent);

    /**
     * 分页查询日志
     *
     * @param queryDTO 查询参数
     * @return 分页日志列表
     */
    PageResult<OperationLogVO> queryLogs(OperationLogQueryDTO queryDTO);

    /**
     * 根据用户ID查询操作日志
     *
     * @param userId   用户ID
     * @param page     页码
     * @param pageSize 每页条数
     * @return 用户操作日志列表
     */
    PageResult<OperationLogVO> queryByUserId(Long userId, int page, int pageSize);

    /**
     * 根据业务ID查询操作日志
     *
     * @param targetId 业务ID
     * @return 业务相关日志列表
     */
    List<OperationLogVO> queryByTargetId(String targetId);

    /**
     * 获取日志统计信息
     *
     * @param queryDTO 查询参数（主要使用时间范围）
     * @return 统计信息 Map
     */
    Map<String, Object> getStatistics(OperationLogQueryDTO queryDTO);
}
