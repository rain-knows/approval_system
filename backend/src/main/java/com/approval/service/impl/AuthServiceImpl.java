package com.approval.service.impl;

import com.approval.dto.LoginRequest;
import com.approval.dto.RegisterRequest;
import com.approval.entity.SysRole;
import com.approval.entity.SysUser;
import com.approval.entity.SysUserRole;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.exception.BusinessException;
import com.approval.mapper.SysRoleMapper;
import com.approval.mapper.SysUserMapper;
import com.approval.mapper.SysUserRoleMapper;
import com.approval.security.JwtTokenProvider;
import com.approval.service.AuthService;
import com.approval.service.OperationLogService;
import com.approval.vo.LoginResponse;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 认证服务实现类
 * 实现用户登录和注册的业务逻辑
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OperationLogService operationLogService;

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应
     */
    @Override
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, request.getUsername()));

        // 用户不存在
        if (user == null) {
            // 记录登录失败日志（包含账号和密码）
            logLoginFailure(request.getUsername(), request.getPassword(), "用户不存在");
            throw new BusinessException(401, "用户名或密码错误");
        }

        // 用户被禁用
        if (user.getStatus() != 1) {
            // 记录登录失败日志（账号被禁用）
            logLoginFailure(request.getUsername(), request.getPassword(), "账号已被禁用");
            throw new BusinessException(403, "账号已被禁用");
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // 记录登录失败日志（密码错误）
            logLoginFailure(request.getUsername(), request.getPassword(), "密码错误");
            throw new BusinessException(401, "用户名或密码错误");
        }

        // 生成 Token
        String token = tokenProvider.generateToken(user.getUsername());

        // 查询用户角色
        List<SysRole> roles = roleMapper.selectRolesByUserId(user.getId());
        List<String> roleCodes = roles.stream()
                .map(SysRole::getCode)
                .collect(Collectors.toList());

        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);

        // 构建响应
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .roles(roleCodes)
                .build();

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userInfo)
                .build();
    }

    /**
     * 用户注册
     *
     * @param request 注册请求
     */
    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // 检查用户名是否已存在
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, request.getUsername()));
        if (count > 0) {
            throw new BusinessException(400, "用户名已存在");
        }

        // 检查邮箱是否已存在（如果提供了邮箱）
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Long emailCount = userMapper.selectCount(
                    new LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getEmail, request.getEmail()));
            if (emailCount > 0) {
                throw new BusinessException(400, "邮箱已被使用");
            }
        }

        // 创建用户
        SysUser user = SysUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .email(request.getEmail())
                .status(1) // 默认启用
                .createdAt(LocalDateTime.now())
                .build();
        userMapper.insert(user);

        // 获取默认角色（USER）
        SysRole defaultRole = roleMapper.selectOne(
                new LambdaQueryWrapper<SysRole>()
                        .eq(SysRole::getCode, "USER"));

        if (defaultRole != null) {
            // 关联用户与默认角色
            SysUserRole userRole = SysUserRole.builder()
                    .userId(user.getId())
                    .roleId(defaultRole.getId())
                    .createdAt(LocalDateTime.now())
                    .build();
            userRoleMapper.insert(userRole);
        }
    }

    /**
     * 记录登录失败日志
     * 包含账号和密码信息，用于安全审计
     *
     * @param username 登录账号
     * @param password 登录密码
     * @param reason   失败原因
     */
    private void logLoginFailure(String username, String password, String reason) {
        try {
            // 获取请求上下文
            String ipAddress = getClientIp();
            String userAgent = null;

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                userAgent = request.getHeader("User-Agent");
            }

            // 构建日志详情（包含账号和密码）
            String detail = String.format("登录失败 - 账号: %s, 密码: %s, 原因: %s",
                    username, password, reason);

            // 异步记录日志
            operationLogService.logAsync(
                    0L, // 登录失败时用户ID为0
                    LogModule.AUTH.getCode(),
                    LogOperation.LOGIN_FAIL.getCode(),
                    null, // 无目标ID
                    detail,
                    ipAddress,
                    userAgent);
        } catch (Exception e) {
            // 日志记录失败不影响主流程
        }
    }

    /**
     * 获取客户端真实IP地址
     *
     * @return 客户端IP地址
     */
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }

            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            // 多个代理时取第一个IP
            if (ip != null && ip.contains(",")) {
                ip = ip.split(",")[0].trim();
            }
            return ip;
        } catch (Exception e) {
            return "unknown";
        }
    }
}
