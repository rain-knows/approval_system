package com.approval.mapper;

import com.approval.entity.ApprovalType;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 审批类型Mapper接口
 */
@Mapper
public interface ApprovalTypeMapper extends BaseMapper<ApprovalType> {

    /**
     * 查询所有启用的审批类型
     *
     * @return 审批类型列表
     */
    default List<ApprovalType> selectEnabledTypes() {
        return selectList(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ApprovalType>()
                .eq(ApprovalType::getStatus, 1)
                .orderByAsc(ApprovalType::getSortOrder));
    }
}
