package com.approval.service.impl;

import com.approval.dto.ApprovalCreateRequest;
import com.approval.entity.*;
import com.approval.exception.BusinessException;
import com.approval.mapper.*;
import com.approval.mapper.SysUserPositionMapper;
import com.approval.service.ApprovalService;
import com.approval.service.FileService;
import com.approval.service.NotificationService;
import com.approval.vo.ApprovalRecordVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final NotificationService notificationService;
    private final SysUserPositionMapper sysUserPositionMapper;

    /**
     * 审批状态常量
     */
    private static final int STATUS_PENDING = 1;
    private static final int STATUS_IN_PROGRESS = 2;
    private static final int STATUS_APPROVED = 3;
    private static final int STATUS_REJECTED = 4;
    private static final int STATUS_WITHDRAWN = 5;

    /**
     * 节点状态常量
     */
    private static final int NODE_STATUS_PENDING = 0;
    private static final int NODE_STATUS_APPROVED = 1;
    private static final int NODE_STATUS_REJECTED = 2;

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
                .status(STATUS_PENDING)
                .currentNodeOrder(1)
                .workflowId(workflow.getId())
                .build();

        approvalRecordMapper.insert(record);
        log.info("审批记录已创建: id={}, title={}", record.getId(), record.getTitle());

        // 初始化审批节点
        SysUser initiator = sysUserMapper.selectById(userId);
        Long firstApproverId = null;
        for (WorkflowNodeTemplate nodeTemplate : nodeTemplates) {
            Long approverId = resolveApproverId(nodeTemplate, initiator);
            if (nodeTemplate.getNodeOrder() == 1) {
                firstApproverId = approverId;
            }

            ApprovalNode node = ApprovalNode.builder()
                    .approvalId(record.getId())
                    .nodeName(nodeTemplate.getNodeName())
                    .approverId(approverId)
                    .nodeOrder(nodeTemplate.getNodeOrder())
                    .status(NODE_STATUS_PENDING)
                    .build();

            approvalNodeMapper.insert(node);
        }

        // 关联附件
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            for (String attachmentId : request.getAttachmentIds()) {
                fileService.updateApprovalId(attachmentId, record.getId());
            }
        }

        // 发送通知给第一个审批人
        if (firstApproverId != null) {
            notificationService.sendApprovalNotification(
                    record.getId(),
                    firstApproverId,
                    "您有一条新的审批待处理",
                    initiator.getNickname() + " 提交了" + approvalType.getName() + "，等待您审批");
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(String id, Long userId, boolean approved, String comment) {
        ApprovalRecord record = approvalRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(2001, "审批记录不存在");
        }

        // 检查状态是否允许审批
        if (record.getStatus() != STATUS_PENDING && record.getStatus() != STATUS_IN_PROGRESS) {
            throw new BusinessException(2002, "当前状态不允许审批操作");
        }

        // 获取当前节点
        ApprovalNode currentNode = approvalNodeMapper.selectCurrentNode(id, record.getCurrentNodeOrder());
        if (currentNode == null) {
            throw new BusinessException(2001, "当前审批节点不存在");
        }

        // 检查是否为当前节点的审批人
        if (!currentNode.getApproverId().equals(userId)) {
            throw new BusinessException(2003, "您无权审批此节点");
        }

        // 更新节点状态
        currentNode.setStatus(approved ? NODE_STATUS_APPROVED : NODE_STATUS_REJECTED);
        currentNode.setComment(comment);
        currentNode.setApprovedAt(LocalDateTime.now());
        approvalNodeMapper.updateById(currentNode);

        SysUser approver = sysUserMapper.selectById(userId);

        if (approved) {
            // 检查是否还有下一个节点
            ApprovalNode nextNode = approvalNodeMapper.selectCurrentNode(id, record.getCurrentNodeOrder() + 1);
            if (nextNode != null) {
                // 流转到下一节点
                record.setStatus(STATUS_IN_PROGRESS);
                record.setCurrentNodeOrder(record.getCurrentNodeOrder() + 1);
                approvalRecordMapper.updateById(record);

                // 通知下一审批人
                notificationService.sendApprovalNotification(
                        id,
                        nextNode.getApproverId(),
                        "您有一条新的审批待处理",
                        record.getTitle() + " 已流转到您，请及时处理");
                log.info("审批 {} 流转到节点 {}", id, nextNode.getNodeOrder());
            } else {
                // 所有节点通过，审批完成
                record.setStatus(STATUS_APPROVED);
                record.setCompletedAt(LocalDateTime.now());
                approvalRecordMapper.updateById(record);

                // 通知发起人
                notificationService.sendApprovalNotification(
                        id,
                        record.getInitiatorId(),
                        "您的审批已全部通过",
                        record.getTitle() + " 已通过所有审批节点");
                log.info("审批 {} 已全部通过", id);
            }
        } else {
            // 拒绝，审批终止
            record.setStatus(STATUS_REJECTED);
            record.setCompletedAt(LocalDateTime.now());
            approvalRecordMapper.updateById(record);

            // 通知发起人
            String rejectMessage = record.getTitle() + " 被 " + approver.getNickname() + " 拒绝";
            if (comment != null && !comment.isEmpty()) {
                rejectMessage += "，原因：" + comment;
            }
            notificationService.sendApprovalNotification(
                    id,
                    record.getInitiatorId(),
                    "您的审批已被拒绝",
                    rejectMessage);
            log.info("审批 {} 被用户 {} 拒绝", id, userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdraw(String id, Long userId) {
        ApprovalRecord record = approvalRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(2001, "审批记录不存在");
        }

        // 检查是否为发起人
        if (!record.getInitiatorId().equals(userId)) {
            throw new BusinessException(403, "只有发起人可以撤回审批");
        }

        // 检查状态
        if (record.getStatus() != STATUS_PENDING && record.getStatus() != STATUS_IN_PROGRESS) {
            throw new BusinessException(2002, "当前状态不允许撤回");
        }

        // 更新状态为已撤回
        record.setStatus(STATUS_WITHDRAWN);
        record.setUpdatedAt(LocalDateTime.now());
        approvalRecordMapper.updateById(record);

        SysUser initiator = sysUserMapper.selectById(userId);

        // 通知相关审批人
        List<ApprovalNode> pendingNodes = approvalNodeMapper.selectList(
                new LambdaQueryWrapper<ApprovalNode>()
                        .eq(ApprovalNode::getApprovalId, id)
                        .eq(ApprovalNode::getStatus, NODE_STATUS_PENDING));

        for (ApprovalNode node : pendingNodes) {
            notificationService.sendApprovalNotification(
                    id,
                    node.getApproverId(),
                    "审批已被发起人撤回",
                    initiator.getNickname() + " 撤回了审批：" + record.getTitle());
        }

        log.info("审批 {} 被用户 {} 撤回", id, userId);
    }

    @Override
    public IPage<ApprovalRecordVO> getTodoApprovals(Long userId, int page, int pageSize) {
        // 查询用户作为当前节点审批人的待处理节点
        LambdaQueryWrapper<ApprovalNode> nodeWrapper = new LambdaQueryWrapper<>();
        nodeWrapper.eq(ApprovalNode::getApproverId, userId)
                .eq(ApprovalNode::getStatus, NODE_STATUS_PENDING);
        List<ApprovalNode> pendingNodes = approvalNodeMapper.selectList(nodeWrapper);

        if (pendingNodes.isEmpty()) {
            return new Page<>(page, pageSize);
        }

        // 获取这些节点对应的审批记录ID
        List<String> approvalIds = pendingNodes.stream()
                .map(ApprovalNode::getApprovalId)
                .distinct()
                .toList();

        // 先查询所有可能的审批记录
        LambdaQueryWrapper<ApprovalRecord> recordWrapper = new LambdaQueryWrapper<>();
        recordWrapper.in(ApprovalRecord::getId, approvalIds)
                .in(ApprovalRecord::getStatus, STATUS_PENDING, STATUS_IN_PROGRESS);
        List<ApprovalRecord> allRecords = approvalRecordMapper.selectList(recordWrapper);

        // 过滤：只保留当前用户是当前节点审批人的记录
        List<ApprovalRecord> filteredRecords = allRecords.stream()
                .filter(record -> pendingNodes.stream()
                        .anyMatch(node -> node.getApprovalId().equals(record.getId())
                                && node.getNodeOrder().equals(record.getCurrentNodeOrder())))
                .sorted((r1, r2) -> {
                    // 先按优先级降序，再按创建时间降序
                    int priorityCompare = Integer.compare(r2.getPriority(), r1.getPriority());
                    if (priorityCompare != 0) {
                        return priorityCompare;
                    }
                    return r2.getCreatedAt().compareTo(r1.getCreatedAt());
                })
                .toList();

        // 手动分页
        int total = filteredRecords.size();
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, total);
        List<ApprovalRecord> pagedRecords = start < total
                ? filteredRecords.subList(start, end)
                : List.of();

        // 构建分页结果
        Page<ApprovalRecordVO> resultPage = new Page<>(page, pageSize, total);
        List<ApprovalRecordVO> voList = pagedRecords.stream()
                .map(record -> {
                    SysUser initiator = sysUserMapper.selectById(record.getInitiatorId());
                    ApprovalType type = approvalTypeMapper.selectOne(
                            new LambdaQueryWrapper<ApprovalType>()
                                    .eq(ApprovalType::getCode, record.getTypeCode()));
                    return buildApprovalRecordVO(record, initiator, type);
                })
                .toList();
        resultPage.setRecords(voList);

        return resultPage;
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
                // 按职位审批：查询 sys_user_position 表获取拥有该职位的用户
                if (nodeTemplate.getApproverId() != null) {
                    Long userIdByPosition = sysUserPositionMapper
                            .selectFirstUserIdByPositionId(nodeTemplate.getApproverId());
                    if (userIdByPosition != null) {
                        return userIdByPosition;
                    }
                }
                // 如果没有找到拥有该职位的用户，回退到管理员（ID=1）
                return 1L;
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
