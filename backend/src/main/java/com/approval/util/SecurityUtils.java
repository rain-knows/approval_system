package com.approval.util;

import com.approval.entity.SysUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * 安全上下文工具类
 * 提供获取当前登录用户信息的便捷方法
 */
@Component
public class SecurityUtils {

    /**
     * 获取当前登录用户的用户名
     *
     * @return 用户名，未登录返回 null
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }

        return null;
    }

    /**
     * 获取当前登录用户的 ID
     * 需要在使用时注入 SysUserMapper 进行查询
     *
     * @param userMapper 用户 Mapper
     * @return 用户 ID，未登录或查询失败返回 null
     */
    public static Long getCurrentUserId(com.approval.mapper.SysUserMapper userMapper) {
        String username = getCurrentUsername();
        if (username == null || userMapper == null) {
            return null;
        }

        SysUser user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, username));

        return user != null ? user.getId() : null;
    }

    /**
     * 判断当前用户是否已认证
     *
     * @return 已认证返回 true
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }
}
