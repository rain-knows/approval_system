package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.PageResult;
import com.approval.common.Result;
import com.approval.dto.ChangePasswordRequest;
import com.approval.dto.UserDTO;
import com.approval.dto.UserQueryDTO;
<<<<<<< HEAD
import com.approval.mapper.SysUserMapper;
import com.approval.security.JwtTokenProvider;
=======
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
>>>>>>> 5afffefd286c08d7b68e48b97e3c0ccdb8f7f5a4
import com.approval.service.UserService;
import com.approval.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户管理控制器
 * 提供用户CRUD和状态管理接口
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SysUserMapper sysUserMapper;

    /**
     * 分页查询用户列表
     *
     * @param keyword      搜索关键词
     * @param departmentId 部门ID筛选
     * @param status       状态筛选
     * @param page         页码
     * @param pageSize     每页条数
     * @return 分页结果
     */
    @GetMapping
    @OperLog(module = LogModule.USER, operation = LogOperation.QUERY, description = "查询用户列表", logParams = false)
    public Result<PageResult<UserVO>> getPagedUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        UserQueryDTO query = UserQueryDTO.builder()
                .keyword(keyword)
                .departmentId(departmentId)
                .status(status)
                .page(page)
                .pageSize(pageSize)
                .build();

        PageResult<UserVO> result = userService.getPagedUsers(query);
        return Result.success(result);
    }

    /**
     * 获取所有用户列表（用于下拉选择）
     *
     * @return 用户列表
     */
    @GetMapping("/all")
    public Result<List<UserVO>> getAllUsers() {
        List<UserVO> users = userService.getAllUsers();
        return Result.success(users);
    }

    /**
     * 获取用户详情
     *
     * @param id 用户ID
     * @return 用户详情
     */
    @GetMapping("/{id}")
    @OperLog(module = LogModule.USER, operation = LogOperation.VIEW, description = "查看用户详情")
    public Result<UserVO> getUserById(@PathVariable Long id) {
        UserVO user = userService.getUserById(id);
        return Result.success(user);
    }

    /**
     * 创建用户
     *
     * @param dto 用户信息
     * @return 创建的用户
     */
    @PostMapping
    @OperLog(module = LogModule.USER, operation = LogOperation.CREATE, description = "创建用户")
    public Result<UserVO> createUser(@Valid @RequestBody UserDTO dto) {
        UserVO user = userService.createUser(dto);
        return Result.success("用户创建成功", user);
    }

    /**
     * 更新用户
     *
     * @param id  用户ID
     * @param dto 用户信息
     * @return 更新后的用户
     */
    @PutMapping("/{id}")
    @OperLog(module = LogModule.USER, operation = LogOperation.UPDATE, description = "更新用户信息")
    public Result<UserVO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO dto) {
        UserVO user = userService.updateUser(id, dto);
        return Result.success("用户更新成功", user);
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    @OperLog(module = LogModule.USER, operation = LogOperation.DELETE, description = "删除用户")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("用户删除成功", null);
    }

    /**
     * 更新用户状态
     *
     * @param id   用户ID
     * @param body 包含status字段的请求体
     * @return 更新结果
     */
    @PutMapping("/{id}/status")
    @OperLog(module = LogModule.USER, operation = LogOperation.UPDATE, description = "更新用户状态")
    public Result<Void> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer status = body.get("status");
        if (status == null) {
            return Result.error(400, "状态值不能为空");
        }
        userService.updateUserStatus(id, status);
        return Result.success("状态更新成功", null);
    }

    /**
     * 修改当前用户密码
     *
     * @param request 修改密码请求
     * @param token   JWT Token
     * @return 操作结果
     */
    @PutMapping("/me/password")
    public Result<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.replace("Bearer ", ""), sysUserMapper);
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        return Result.success("密码修改成功", null);
    }
}
