package com.approval.service.impl;

import com.approval.common.PageResult;
import com.approval.dto.UserDTO;
import com.approval.dto.UserQueryDTO;
import com.approval.entity.SysDepartment;
import com.approval.entity.SysRole;
import com.approval.entity.SysUser;
import com.approval.entity.SysUserRole;
import com.approval.exception.BusinessException;
import com.approval.mapper.SysDepartmentMapper;
import com.approval.mapper.SysRoleMapper;
import com.approval.mapper.SysUserMapper;
import com.approval.mapper.SysUserRoleMapper;
import com.approval.service.UserService;
import com.approval.vo.UserVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户服务实现类
 * 实现用户管理业务逻辑
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysDepartmentMapper departmentMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 分页查询用户列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public PageResult<UserVO> getPagedUsers(UserQueryDTO query) {
        // 构建查询条件
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();

        // 关键词搜索（用户名/昵称/邮箱）
        if (StringUtils.hasText(query.getKeyword())) {
            String keyword = "%" + query.getKeyword().trim() + "%";
            wrapper.and(w -> w
                    .like(SysUser::getUsername, keyword)
                    .or().like(SysUser::getNickname, keyword)
                    .or().like(SysUser::getEmail, keyword));
        }

        // 部门筛选
        if (query.getDepartmentId() != null) {
            wrapper.eq(SysUser::getDepartmentId, query.getDepartmentId());
        }

        // 状态筛选
        if (query.getStatus() != null) {
            wrapper.eq(SysUser::getStatus, query.getStatus());
        }

        // 排序
        wrapper.orderByDesc(SysUser::getCreatedAt);

        // 分页查询
        Page<SysUser> page = new Page<>(query.getPage(), query.getPageSize());
        Page<SysUser> result = userMapper.selectPage(page, wrapper);

        // 获取部门名称映射
        Map<Long, String> deptNameMap = getDepartmentNameMap();

        // 转换为VO
        List<UserVO> voList = result.getRecords().stream()
                .map(user -> convertToVO(user, deptNameMap))
                .collect(Collectors.toList());

        return PageResult.of(voList, result.getTotal(), query.getPage(), query.getPageSize());
    }

    /**
     * 获取所有用户列表（简单列表）
     *
     * @return 用户列表
     */
    @Override
    public List<UserVO> getAllUsers() {
        List<SysUser> users = userMapper.selectList(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getStatus, 1)
                        .orderByAsc(SysUser::getId));

        Map<Long, String> deptNameMap = getDepartmentNameMap();

        return users.stream()
                .map(user -> convertToVO(user, deptNameMap))
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取用户详情
     *
     * @param id 用户ID
     * @return 用户详情
     */
    @Override
    public UserVO getUserById(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        Map<Long, String> deptNameMap = getDepartmentNameMap();
        return convertToVO(user, deptNameMap);
    }

    /**
     * 创建用户
     *
     * @param dto 用户信息
     * @return 创建的用户
     */
    @Override
    @Transactional
    public UserVO createUser(UserDTO dto) {
        // 检查用户名是否存在
        SysUser existing = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, dto.getUsername()));
        if (existing != null) {
            throw new BusinessException(409, "用户名已存在");
        }

        // 验证密码
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BusinessException(400, "密码不能为空");
        }

        // 验证部门是否存在
        if (dto.getDepartmentId() != null) {
            SysDepartment dept = departmentMapper.selectById(dto.getDepartmentId());
            if (dept == null) {
                throw new BusinessException(400, "指定的部门不存在");
            }
        }

        // 创建用户
        SysUser user = SysUser.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .avatar(dto.getAvatar())
                .departmentId(dto.getDepartmentId())
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userMapper.insert(user);

        // 关联角色
        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            updateUserRoles(user.getId(), dto.getRoleIds());
        }

        Map<Long, String> deptNameMap = getDepartmentNameMap();
        return convertToVO(user, deptNameMap);
    }

    /**
     * 更新用户
     *
     * @param id  用户ID
     * @param dto 用户信息
     * @return 更新后的用户
     */
    @Override
    @Transactional
    public UserVO updateUser(Long id, UserDTO dto) {
        // 获取现有用户
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // 检查用户名是否被其他用户占用
        if (!user.getUsername().equals(dto.getUsername())) {
            SysUser existing = userMapper.selectOne(
                    new LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getUsername, dto.getUsername())
                            .ne(SysUser::getId, id));
            if (existing != null) {
                throw new BusinessException(409, "用户名已被占用");
            }
        }

        // 验证部门是否存在
        if (dto.getDepartmentId() != null) {
            SysDepartment dept = departmentMapper.selectById(dto.getDepartmentId());
            if (dept == null) {
                throw new BusinessException(400, "指定的部门不存在");
            }
        }

        // 更新字段
        user.setUsername(dto.getUsername());
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        if (dto.getAvatar() != null) {
            user.setAvatar(StringUtils.hasText(dto.getAvatar()) ? dto.getAvatar() : null);
        }
        user.setDepartmentId(dto.getDepartmentId());
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }

        // 更新密码（如果提供）
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        // 更新角色
        if (dto.getRoleIds() != null) {
            updateUserRoles(id, dto.getRoleIds());
        }

        Map<Long, String> deptNameMap = getDepartmentNameMap();
        return convertToVO(user, deptNameMap);
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     */
    @Override
    @Transactional
    public void deleteUser(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // 检查是否是admin用户
        if ("admin".equals(user.getUsername())) {
            throw new BusinessException(400, "不能删除系统管理员账户");
        }

        // 删除用户角色关联
        userRoleMapper.delete(
                new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, id));

        // 删除用户
        userMapper.deleteById(id);
    }

    /**
     * 更新用户状态
     *
     * @param id     用户ID
     * @param status 状态
     */
    @Override
    @Transactional
    public void updateUserStatus(Long id, Integer status) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // 检查是否是admin用户
        if ("admin".equals(user.getUsername()) && status == 0) {
            throw new BusinessException(400, "不能禁用系统管理员账户");
        }

        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /**
     * 修改用户密码
     *
     * @param userId      用户ID
     * @param oldPassword 原密码
     * @param newPassword 新密码
     */
    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // 验证原密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(400, "原密码不正确");
        }

        // 检查新密码与原密码是否相同
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BusinessException(400, "新密码不能与原密码相同");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
    }

    /**
     * 更新用户角色
     *
     * @param userId  用户ID
     * @param roleIds 角色ID列表
     */
    private void updateUserRoles(Long userId, List<Long> roleIds) {
        // 删除现有角色关联
        userRoleMapper.delete(
                new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, userId));

        // 添加新的角色关联
        if (roleIds != null && !roleIds.isEmpty()) {
            for (Long roleId : roleIds) {
                SysUserRole userRole = SysUserRole.builder()
                        .userId(userId)
                        .roleId(roleId)
                        .createdAt(LocalDateTime.now())
                        .build();
                userRoleMapper.insert(userRole);
            }
        }
    }

    /**
     * 获取部门名称映射
     *
     * @return 部门ID到名称的映射
     */
    private Map<Long, String> getDepartmentNameMap() {
        List<SysDepartment> departments = departmentMapper.selectList(null);
        return departments.stream()
                .collect(Collectors.toMap(
                        SysDepartment::getId,
                        SysDepartment::getName,
                        (a, b) -> a));
    }

    /**
     * 将用户实体转换为VO
     *
     * @param user        用户实体
     * @param deptNameMap 部门名称映射
     * @return 用户VO
     */
    private UserVO convertToVO(SysUser user, Map<Long, String> deptNameMap) {
        // 获取用户角色
        List<SysUserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, user.getId()));

        List<UserVO.RoleInfo> roles = Collections.emptyList();
        if (!userRoles.isEmpty()) {
            List<Long> roleIds = userRoles.stream()
                    .map(SysUserRole::getRoleId)
                    .collect(Collectors.toList());
            List<SysRole> sysRoles = roleMapper.selectBatchIds(roleIds);
            roles = sysRoles.stream()
                    .map(role -> UserVO.RoleInfo.builder()
                            .id(role.getId())
                            .code(role.getCode())
                            .name(role.getName())
                            .build())
                    .collect(Collectors.toList());
        }

        return UserVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .departmentId(user.getDepartmentId())
                .departmentName(user.getDepartmentId() != null ? deptNameMap.get(user.getDepartmentId()) : null)
                .status(user.getStatus())
                .roles(roles)
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
