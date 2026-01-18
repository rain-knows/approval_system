package com.approval.service.impl;

import com.approval.entity.ApprovalNode;
import com.approval.entity.ApprovalRecord;
import com.approval.entity.ApprovalType;
import com.approval.mapper.ApprovalNodeMapper;
import com.approval.mapper.ApprovalRecordMapper;
import com.approval.mapper.ApprovalTypeMapper;
import com.approval.service.DashboardService;
import com.approval.vo.DashboardStatisticsVO;
import com.approval.vo.RecentActivityVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * 仪表盘服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final ApprovalRecordMapper approvalRecordMapper;
    private final ApprovalNodeMapper approvalNodeMapper;
    private final ApprovalTypeMapper approvalTypeMapper;

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

    @Override
    public DashboardStatisticsVO getStatistics(Long userId) {
        // 获取当前月份的起始时间
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 统计我发起的审批记录（按状态分类）
        LambdaQueryWrapper<ApprovalRecord> baseWrapper = new LambdaQueryWrapper<>();
        baseWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);

        // 1. 待处理的审批（状态为待审批或审批中）
        LambdaQueryWrapper<ApprovalRecord> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .in(ApprovalRecord::getStatus, STATUS_PENDING, STATUS_IN_PROGRESS);
        int pendingCount = Math.toIntExact(approvalRecordMapper.selectCount(pendingWrapper));

        // 2. 已通过的审批
        LambdaQueryWrapper<ApprovalRecord> approvedWrapper = new LambdaQueryWrapper<>();
        approvedWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .eq(ApprovalRecord::getStatus, STATUS_APPROVED)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);
        int approvedCount = Math.toIntExact(approvalRecordMapper.selectCount(approvedWrapper));

        // 3. 已拒绝的审批
        LambdaQueryWrapper<ApprovalRecord> rejectedWrapper = new LambdaQueryWrapper<>();
        rejectedWrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .eq(ApprovalRecord::getStatus, STATUS_REJECTED)
                .ge(ApprovalRecord::getCreatedAt, monthStart)
                .le(ApprovalRecord::getCreatedAt, monthEnd);
        int rejectedCount = Math.toIntExact(approvalRecordMapper.selectCount(rejectedWrapper));

        // 4. 本月发起的总数量
        int totalCount = Math.toIntExact(approvalRecordMapper.selectCount(baseWrapper));

        log.info("用户 {} 的仪表盘统计（我发起的）: 待处理={}, 已通过={}, 已拒绝={}, 本月总计={}",
                userId, pendingCount, approvedCount, rejectedCount, totalCount);

        return DashboardStatisticsVO.builder()
                .pending(pendingCount)
                .approved(approvedCount)
                .rejected(rejectedCount)
                .total(totalCount)
                .build();
    }

    @Override
    public List<RecentActivityVO> getRecentActivities(Long userId, int limit) {
        List<RecentActivityVO> activities = new ArrayList<>();

        // 限制 limit 在合理范围内，防止负数或过大值影响性能
        limit = Math.max(1, Math.min(limit, 100));

        // 查询我最近发起的审批
        LambdaQueryWrapper<ApprovalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApprovalRecord::getInitiatorId, userId)
                .orderByDesc(ApprovalRecord::getCreatedAt)
                .last("LIMIT " + limit);
        List<ApprovalRecord> recentRecords = approvalRecordMapper.selectList(wrapper);

        for (ApprovalRecord record : recentRecords) {
            ApprovalType type = approvalTypeMapper.selectOne(
                    new LambdaQueryWrapper<ApprovalType>()
                            .eq(ApprovalType::getCode, record.getTypeCode()));

            String activityType = "created";
            LocalDateTime activityTime = record.getCreatedAt();

            // 根据审批状态确定活动类型和时间
            if (record.getStatus() == STATUS_APPROVED) {
                activityType = "approved";
                activityTime = record.getCompletedAt() != null ? record.getCompletedAt() : record.getUpdatedAt();
            } else if (record.getStatus() == STATUS_REJECTED) {
                activityType = "rejected";
                activityTime = record.getCompletedAt() != null ? record.getCompletedAt() : record.getUpdatedAt();
            } else if (record.getStatus() == STATUS_WITHDRAWN) {
                activityType = "withdrawn";
                activityTime = record.getUpdatedAt();
            }

            activities.add(RecentActivityVO.builder()
                    .approvalId(record.getId())
                    .activityType(activityType)
                    .title(record.getTitle())
                    .typeName(type != null ? type.getName() : record.getTypeCode())
                    .typeIcon(type != null ? type.getIcon() : null)
                    .typeColor(type != null ? type.getColor() : null)
                    .activityTime(activityTime)
                    .status(record.getStatus())
                    .relativeTime(calculateRelativeTime(activityTime))
                    .build());
        }

        // 按时间降序排列
        activities.sort(Comparator.comparing(RecentActivityVO::getActivityTime).reversed());
        
        return activities;
    }

    /**
     * 计算相对时间
     */
    private String calculateRelativeTime(LocalDateTime time) {
        Duration duration = Duration.between(time, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1) {
            return "刚刚";
        } else if (minutes < 60) {
            return minutes + "分钟前";
        } else if (hours < 24) {
            return hours + "小时前";
        } else if (days < 30) {
            return days + "天前";
        } else {
            return (days / 30) + "个月前";
        }
    }
}
