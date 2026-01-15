package com.approval.service.impl;

import com.approval.entity.ApprovalType;
import com.approval.exception.BusinessException;
import com.approval.mapper.ApprovalTypeMapper;
import com.approval.service.ApprovalTypeService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 审批类型服务实现类
 */
@Service
@RequiredArgsConstructor
public class ApprovalTypeServiceImpl implements ApprovalTypeService {

    private final ApprovalTypeMapper approvalTypeMapper;

    @Override
    public List<ApprovalType> getAvailableTypes() {
        return approvalTypeMapper.selectEnabledTypes();
    }

    @Override
    public ApprovalType getByCode(String code) {
        ApprovalType type = approvalTypeMapper.selectOne(
                new LambdaQueryWrapper<ApprovalType>()
                        .eq(ApprovalType::getCode, code)
                        .eq(ApprovalType::getStatus, 1));
        if (type == null) {
            throw new BusinessException(404, "审批类型不存在: " + code);
        }
        return type;
    }
}
