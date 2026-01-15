package com.approval.mapper;

import com.approval.entity.WorkflowNodeTemplate;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 工作流节点模板Mapper接口
 */
@Mapper
public interface WorkflowNodeTemplateMapper extends BaseMapper<WorkflowNodeTemplate> {

    /**
     * 根据工作流ID查询节点模板列表
     *
     * @param workflowId 工作流模板ID
     * @return 节点模板列表（按顺序排列）
     */
    default List<WorkflowNodeTemplate> selectByWorkflowId(Long workflowId) {
        return selectList(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<WorkflowNodeTemplate>()
                .eq(WorkflowNodeTemplate::getWorkflowId, workflowId)
                .orderByAsc(WorkflowNodeTemplate::getNodeOrder));
    }
}
