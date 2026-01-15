package com.approval.mapper;

import com.approval.entity.ApprovalRecord;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 审批记录Mapper接口
 */
@Mapper
public interface ApprovalRecordMapper extends BaseMapper<ApprovalRecord> {
}
