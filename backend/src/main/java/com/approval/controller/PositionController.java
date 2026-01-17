package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.Result;
import com.approval.entity.SysPosition;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.mapper.SysPositionMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 职位控制器
 *
 * 提供职位相关 API
 */
@RestController
@RequestMapping("/api/v1/positions")
@RequiredArgsConstructor
public class PositionController {

    private final SysPositionMapper sysPositionMapper;

    /**
     * 获取所有启用的职位列表
     *
     * @return 职位列表
     */
    @GetMapping
    @OperLog(module = LogModule.POSITION, operation = LogOperation.QUERY, description = "查询职位列表", logParams = false)
    public Result<List<SysPosition>> getAllPositions() {
        LambdaQueryWrapper<SysPosition> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysPosition::getStatus, 1);
        wrapper.orderByAsc(SysPosition::getSortOrder);
        List<SysPosition> positions = sysPositionMapper.selectList(wrapper);
        return Result.success(positions);
    }
}
