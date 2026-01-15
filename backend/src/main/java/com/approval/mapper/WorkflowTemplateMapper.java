package com.approval.mapper;

import com.approval.entity.WorkflowTemplate;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流模板Mapper接口
 */
@Mapper
public interface WorkflowTemplateMapper extends BaseMapper<WorkflowTemplate> {

    /**
     * 根据类型编码查询启用的工作流模板
     *
     * @param typeCode 审批类型编码
     * @return 工作流模板
     */
    default WorkflowTemplate selectByTypeCode(String typeCode) {
        return selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<WorkflowTemplate>()
                .eq(WorkflowTemplate::getTypeCode, typeCode)
                .eq(WorkflowTemplate::getStatus, 1)
                .last("LIMIT 1"));
    }
}
