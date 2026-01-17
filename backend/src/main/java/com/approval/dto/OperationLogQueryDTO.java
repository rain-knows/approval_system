package com.approval.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 操作日志查询参数
 * 用于日志列表的筛选条件
 */
@Data
public class OperationLogQueryDTO {

    /** 页码，默认1 */
    private Integer page = 1;

    /** 每页条数，默认10 */
    private Integer pageSize = 10;

    /** 模块筛选 */
    private String module;

    /** 操作类型筛选 */
    private String operation;

    /** 用户ID筛选 */
    private Long userId;

    /** 用户名/昵称关键词搜索 */
    private String usernameKeyword;

    /** 目标业务ID */
    private String targetId;

    /** 开始日期 */
    private LocalDate startDate;

    /** 结束日期 */
    private LocalDate endDate;

    /** 详情关键词搜索 */
    private String keyword;
}
