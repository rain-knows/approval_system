package com.approval.service.impl;

import com.approval.dto.ApprovalCreateRequest;
import com.approval.entity.*;
import com.approval.exception.BusinessException;
import com.approval.mapper.*;
import com.approval.service.ApprovalService;
import com.approval.service.FileService;
import com.approval.vo.ApprovalRecordVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 审批服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalRecordMapper approvalRecordMapper;
    private final ApprovalNodeMapper approvalNodeMapper;
    private final ApprovalTypeMapper approvalTypeMapper;
    private final WorkflowTemplateMapper workflowTemplateMapper;
    private final WorkflowNodeTemplateMapper workflowNodeTemplateMapper;
    private final SysUserMapper sysUserMapper;
    private final SysDepartmentMapper sysDepartmentMapper;
    private final FileService fileService;
    private final AttachmentMapper attachmentMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApprovalRecordVO createApproval(ApprovalCreateRequest request, Long userId) {
        // 验证审批类型
        ApprovalType approvalType = approvalTypeMapper.selectOne(
                new LambdaQueryWrapper<ApprovalType>()
                        .eq(ApprovalType::getCode, request.getTypeCode())
                        .eq(ApprovalType::getStatus, 1));
        if (approvalType == null) {
            throw new BusinessException(404, "审批类型不存在");
        }

        // 查找对应的工作流模板
        WorkflowTemplate workflow = workflowTemplateMapper.selectByTypeCode(request.getTypeCode());
        if (workflow == null) {
            throw new BusinessException(404, "未找到对应的工作流模板");
        }

        // 获取工作流节点模板
        List<WorkflowNodeTemplate> nodeTemplates = workflowNodeTemplateMapper.selectByWorkflowId(workflow.getId());
        if (nodeTemplates.isEmpty()) {
            throw new BusinessException(400, "工作流模板未配置审批节点");
        }

        // 创建审批记录
        ApprovalRecord record = ApprovalRecord.builder()
                .title(request.getTitle())
                .typeCode(request.getTypeCode())
                .content(request.getContent())
                .initiatorId(userId)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .deadline(request.getDeadline())
                .status(1) // 待审批
                .currentNodeOrder(1)
                .workflowId(workflow.getId())
                .build();

        approvalRecordMapper.insert(record);
        log.info("审批记录已创建: id={}, title={}", record.getId(), record.getTitle());

        // 初始化审批节点
        SysUser initiator = sysUserMapper.selectById(userId);
        for (WorkflowNodeTemplate nodeTemplate : nodeTemplates) {
            Long approverId = resolveApproverId(nodeTemplate, initiator);

            ApprovalNode node = ApprovalNode.builder()
                    .approvalId(record.getId())
                    .nodeName(nodeTemplate.getNodeName())
                    .approverId(approverId)
                    .nodeOrder(nodeTemplate.getNodeOrder())
                    .status(0) // 待审批
                    .build();

            approvalNodeMapper.insert(node);
        }

        // 关联附件
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            for (String attachmentId : request.getAttachmentIds()) {
                fileService.updateApprovalId(attachmentId, record.getId());
            }
        }

        return buildApprovalRecordVO(record, initiator, approvalType);
    }

    @Override
    public IPage<ApprovalRecordVO> getMyApprovals(Long userId, int page, int pageSize, Integer status) {
        Page<ApprovalRecord> pageParam = new Page<>(page, pageSize);

        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<ApprovalRecord>()
                .eq(ApprovalRecord::getInitiatorId, userId)
                .orderByDesc(ApprovalRecord::getCreatedAt);

        if (status != null) {
            wrapper.eq(ApprovalRecord::getStatus, status);
        }

        IPage<ApprovalRecord> recordPage = approvalRecordMapper.selectPage(pageParam, wrapper);

        return recordPage.convert(record -> {
            SysUser initiator = sysUserMapper.selectById(record.getInitiatorId());
            ApprovalType type = approvalTypeMapper.selectOne(
                    new LambdaQueryWrapper<ApprovalType>()
                            .eq(ApprovalType::getCode, record.getTypeCode()));
            return buildApprovalRecordVO(record, initiator, type);
        });
    }

    @Override
    public ApprovalRecordVO getApprovalDetail(String id) {
        ApprovalRecord record = approvalRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(404, "审批记录不存在");
        }

        SysUser initiator = sysUserMapper.selectById(record.getInitiatorId());
        ApprovalType type = approvalTypeMapper.selectOne(
                new LambdaQueryWrapper<ApprovalType>()
                        .eq(ApprovalType::getCode, record.getTypeCode()));

        ApprovalRecordVO vo = buildApprovalRecordVO(record, initiator, type);

        // 加载审批节点
        List<ApprovalNode> nodes = approvalNodeMapper.selectByApprovalId(id);
        vo.setNodes(nodes);

        // 加载附件
        List<Attachment> attachments = attachmentMapper.selectByApprovalId(id);
        vo.setAttachments(attachments);

        return vo;
    }

    /**
     * 解析审批人ID
     * 根据节点模板的审批人类型确定实际审批人
     */
    private Long resolveApproverId(WorkflowNodeTemplate nodeTemplate, SysUser initiator) {
        String approverType = nodeTemplate.getApproverType();

        switch (approverType) {
            case "USER":
                // 指定用户审批
                return nodeTemplate.getApproverId();
            case "DEPARTMENT_HEAD":
                // 部门负责人审批
                if (initiator.getDepartmentId() != null) {
                    SysDepartment dept = sysDepartmentMapper.selectById(initiator.getDepartmentId());
                    if (dept != null && dept.getLeaderId() != null) {
                        return dept.getLeaderId();
                    }
                }
                // 如果没有部门负责人，回退到管理员（ID=1）
                return 1L;
            case "POSITION":
                // 按职位审批（简化处理：返回指定的职位ID对应的用户）
                // 实际应该查询 sys_user_position 表
                return nodeTemplate.getApproverId();
            default:
                return 1L;
        }
    }

    /**
     * 构建审批记录VO
     */
    private ApprovalRecordVO buildApprovalRecordVO(ApprovalRecord record, SysUser initiator, ApprovalType type) {
        return ApprovalRecordVO.builder()
                .id(record.getId())
                .title(record.getTitle())
                .typeCode(record.getTypeCode())
                .typeName(type != null ? type.getName() : record.getTypeCode())
                .typeIcon(type != null ? type.getIcon() : null)
                .typeColor(type != null ? type.getColor() : null)
                .content(record.getContent())
                .initiatorId(record.getInitiatorId())
                .initiatorName(initiator != null ? initiator.getNickname() : null)
                .priority(record.getPriority())
                .status(record.getStatus())
                .currentNodeOrder(record.getCurrentNodeOrder())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .completedAt(record.getCompletedAt())
                .build();
    }
}
