package com.approval.service;

import com.approval.common.PageResult;
import com.approval.dto.UserDTO;
import com.approval.dto.UserQueryDTO;
import com.approval.vo.UserVO;

import java.util.List;

/**
 * 用户服务接口
 * 提供用户管理相关业务逻辑
 */
public interface UserService {

    /**
     * 分页查询用户列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    PageResult<UserVO> getPagedUsers(UserQueryDTO query);

    /**
     * 获取所有用户列表（简单列表，用于下拉选择）
     *
     * @return 用户列表
     */
    List<UserVO> getAllUsers();

    /**
     * 根据ID获取用户详情
     *
     * @param id 用户ID
     * @return 用户详情
     */
    UserVO getUserById(Long id);

    /**
     * 创建用户
     *
     * @param dto 用户信息
     * @return 创建的用户
     */
    UserVO createUser(UserDTO dto);

    /**
     * 更新用户
     *
     * @param id  用户ID
     * @param dto 用户信息
     * @return 更新后的用户
     */
    UserVO updateUser(Long id, UserDTO dto);

    /**
     * 删除用户
     *
     * @param id 用户ID
     */
    void deleteUser(Long id);

    /**
     * 更新用户状态
     *
     * @param id     用户ID
     * @param status 状态: 0-禁用 1-启用
     */
    void updateUserStatus(Long id, Integer status);

    /**
     * 修改用户密码
     *
     * @param userId      用户ID
     * @param oldPassword 原密码
     * @param newPassword 新密码
     */
    void changePassword(Long userId, String oldPassword, String newPassword);
}
