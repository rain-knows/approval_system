package com.approval.mapper;

import com.approval.entity.Attachment;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 附件Mapper接口
 */
@Mapper
public interface AttachmentMapper extends BaseMapper<Attachment> {

    /**
     * 根据审批ID查询附件列表
     *
     * @param approvalId 审批ID
     * @return 附件列表
     */
    default List<Attachment> selectByApprovalId(String approvalId) {
        return selectList(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getApprovalId, approvalId)
                .orderByDesc(Attachment::getCreatedAt));
    }
}
