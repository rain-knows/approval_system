package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.PageResult;
import com.approval.common.Result;
import com.approval.dto.WorkflowCreateRequest;
import com.approval.dto.WorkflowStatusRequest;
import com.approval.dto.WorkflowUpdateRequest;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.WorkflowService;
import com.approval.vo.WorkflowVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 工作流控制器
 * 处理工作流配置相关接口
 */
@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@Slf4j
public class WorkflowController {

    private final WorkflowService workflowService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 获取工作流列表（分页）
     *
     * @param page     页码
     * @param pageSize 每页条数
     * @param typeCode 类型编码筛选（可选）
     * @param status   状态筛选（可选）
     * @return 分页结果
     */
    @GetMapping
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.QUERY, description = "查询工作流列表", logParams = false)
    public Result<PageResult<WorkflowVO>> getWorkflowList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String typeCode,
            @RequestParam(required = false) Integer status) {
        IPage<WorkflowVO> result = workflowService.getWorkflowList(page, pageSize, typeCode, status);
        return Result.success(PageResult.of(result));
    }

    /**
     * 获取工作流详情
     *
     * @param id 工作流ID
     * @return 工作流详情
     */
    @GetMapping("/{id}")
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.VIEW, description = "查看工作流详情")
    public Result<WorkflowVO> getWorkflowDetail(@PathVariable Long id) {
        WorkflowVO workflow = workflowService.getWorkflowDetail(id);
        return Result.success(workflow);
    }

    /**
     * 根据类型编码获取工作流
     *
     * @param typeCode 审批类型编码
     * @return 工作流详情
     */
    @GetMapping("/by-type")
    public Result<WorkflowVO> getWorkflowByTypeCode(@RequestParam String typeCode) {
        WorkflowVO workflow = workflowService.getWorkflowByTypeCode(typeCode);
        return Result.success(workflow);
    }

    /**
     * 创建工作流
     *
     * @param request 创建请求
     * @param token   JWT Token
     * @return 工作流信息
     */
    @PostMapping
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.CREATE, description = "创建工作流")
    public Result<WorkflowVO> createWorkflow(
            @Valid @RequestBody WorkflowCreateRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        WorkflowVO workflow = workflowService.createWorkflow(request, userId);
        log.info("用户 {} 创建工作流: {}", userId, workflow.getName());
        return Result.success(workflow);
    }

    /**
     * 更新工作流
     *
     * @param id      工作流ID
     * @param request 更新请求
     * @return 工作流信息
     */
    @PutMapping("/{id}")
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.UPDATE, description = "更新工作流")
    public Result<WorkflowVO> updateWorkflow(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowUpdateRequest request) {
        WorkflowVO workflow = workflowService.updateWorkflow(id, request);
        return Result.success(workflow);
    }

    /**
     * 删除工作流
     *
     * @param id 工作流ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.DELETE, description = "删除工作流")
    public Result<Void> deleteWorkflow(@PathVariable Long id) {
        workflowService.deleteWorkflow(id);
        return Result.success();
    }

    /**
     * 更新工作流状态
     *
     * @param id      工作流ID
     * @param request 状态请求
     * @return 操作结果
     */
    @PutMapping("/{id}/status")
    @OperLog(module = LogModule.WORKFLOW, operation = LogOperation.UPDATE, description = "更新工作流状态")
    public Result<Void> updateWorkflowStatus(
            @PathVariable Long id,
            @RequestBody WorkflowStatusRequest request) {
        workflowService.updateWorkflowStatus(id, request.getStatus());
        return Result.success();
    }
}
