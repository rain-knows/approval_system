package com.approval.controller;

import com.approval.common.PageResult;
import com.approval.common.Result;
import com.approval.dto.ApprovalCreateRequest;
import com.approval.entity.ApprovalType;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.ApprovalService;
import com.approval.service.ApprovalTypeService;
import com.approval.vo.ApprovalRecordVO;
import com.approval.vo.ApprovalTypeVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 审批控制器
 * 处理审批相关接口
 */
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@Slf4j
public class ApprovalController {

    private final ApprovalService approvalService;
    private final ApprovalTypeService approvalTypeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 获取审批类型列表
     *
     * @return 审批类型列表
     */
    @GetMapping("/types")
    public Result<List<ApprovalTypeVO>> getApprovalTypes() {
        List<ApprovalType> types = approvalTypeService.getAvailableTypes();
        List<ApprovalTypeVO> voList = types.stream()
                .map(ApprovalTypeVO::from)
                .collect(Collectors.toList());
        return Result.success(voList);
    }

    /**
     * 发起审批
     *
     * @param request 创建审批请求
     * @param token   JWT Token
     * @return 审批记录
     */
    @PostMapping
    public Result<ApprovalRecordVO> createApproval(
            @Valid @RequestBody ApprovalCreateRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        ApprovalRecordVO record = approvalService.createApproval(request, userId);
        log.info("用户 {} 发起审批: {}", userId, record.getTitle());
        return Result.success(record);
    }

    /**
     * 获取我的申请列表
     *
     * @param page     页码
     * @param pageSize 每页条数
     * @param status   状态筛选（可选）
     * @param token    JWT Token
     * @return 分页结果
     */
    @GetMapping("/my")
    public Result<PageResult<ApprovalRecordVO>> getMyApprovals(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer status,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        IPage<ApprovalRecordVO> result = approvalService.getMyApprovals(userId, page, pageSize, status);
        return Result.success(PageResult.of(result));
    }

    /**
     * 获取审批详情
     *
     * @param id 审批ID
     * @return 审批详情
     */
    @GetMapping("/{id}")
    public Result<ApprovalRecordVO> getApprovalDetail(@PathVariable String id) {
        ApprovalRecordVO record = approvalService.getApprovalDetail(id);
        return Result.success(record);
    }
}
