package com.approval.service;

import com.approval.entity.ApprovalType;

import java.util.List;

/**
 * 审批类型服务接口
 */
public interface ApprovalTypeService {

    /**
     * 获取所有可用的审批类型
     *
     * @return 审批类型列表
     */
    List<ApprovalType> getAvailableTypes();

    /**
     * 根据编码获取审批类型
     *
     * @param code 审批类型编码
     * @return 审批类型
     */
    ApprovalType getByCode(String code);
}
