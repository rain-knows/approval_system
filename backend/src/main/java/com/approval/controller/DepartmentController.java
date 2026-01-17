package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.Result;
import com.approval.dto.DepartmentDTO;
import com.approval.entity.SysDepartment;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.service.DepartmentService;
import com.approval.vo.DepartmentTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 部门管理控制器
 * 提供部门CRUD和树形结构查询接口
 */
@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * 获取部门树形结构
     *
     * @return 完整部门树
     */
    @GetMapping("/tree")
    @OperLog(module = LogModule.DEPARTMENT, operation = LogOperation.QUERY, description = "查询部门树", logParams = false)
    public Result<List<DepartmentTreeVO>> getDepartmentTree() {
        List<DepartmentTreeVO> tree = departmentService.getDepartmentTree();
        return Result.success(tree);
    }

    /**
     * 获取所有部门列表（平铺）
     *
     * @return 所有部门列表
     */
    @GetMapping
    public Result<List<SysDepartment>> getAllDepartments() {
        List<SysDepartment> departments = departmentService.getAllDepartments();
        return Result.success(departments);
    }

    /**
     * 获取部门详情
     *
     * @param id 部门ID
     * @return 部门详情
     */
    @GetMapping("/{id}")
    @OperLog(module = LogModule.DEPARTMENT, operation = LogOperation.VIEW, description = "查看部门详情")
    public Result<SysDepartment> getDepartmentById(@PathVariable Long id) {
        SysDepartment department = departmentService.getById(id);
        return Result.success(department);
    }

    /**
     * 创建部门
     *
     * @param dto 部门信息
     * @return 创建的部门
     */
    @PostMapping
    @OperLog(module = LogModule.DEPARTMENT, operation = LogOperation.CREATE, description = "创建部门")
    public Result<SysDepartment> createDepartment(@Valid @RequestBody DepartmentDTO dto) {
        SysDepartment department = departmentService.create(dto);
        return Result.success("部门创建成功", department);
    }

    /**
     * 更新部门
     *
     * @param id  部门ID
     * @param dto 部门信息
     * @return 更新后的部门
     */
    @PutMapping("/{id}")
    @OperLog(module = LogModule.DEPARTMENT, operation = LogOperation.UPDATE, description = "更新部门信息")
    public Result<SysDepartment> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDTO dto) {
        SysDepartment department = departmentService.update(id, dto);
        return Result.success("部门更新成功", department);
    }

    /**
     * 删除部门
     *
     * @param id 部门ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @OperLog(module = LogModule.DEPARTMENT, operation = LogOperation.DELETE, description = "删除部门")
    public Result<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.delete(id);
        return Result.success("部门删除成功", null);
    }
}
