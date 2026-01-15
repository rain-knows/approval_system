package com.approval.service;

import com.approval.dto.ApprovalCreateRequest;
import com.approval.vo.ApprovalRecordVO;
import com.baomidou.mybatisplus.core.metadata.IPage;

/**
 * 审批服务接口
 */
public interface ApprovalService {

    /**
     * 发起审批
     *
     * @param request 创建审批请求
     * @param userId  发起人ID
     * @return 审批记录VO
     */
    ApprovalRecordVO createApproval(ApprovalCreateRequest request, Long userId);

    /**
     * 获取我的申请列表
     *
     * @param userId   用户ID
     * @param page     页码
     * @param pageSize 每页条数
     * @param status   状态筛选（可选）
     * @return 分页结果
     */
    IPage<ApprovalRecordVO> getMyApprovals(Long userId, int page, int pageSize, Integer status);

    /**
     * 获取审批详情
     *
     * @param id 审批ID
     * @return 审批记录VO
     */
    ApprovalRecordVO getApprovalDetail(String id);
}
