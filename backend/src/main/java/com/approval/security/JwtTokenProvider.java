package com.approval.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JWT Token 提供者
 * 负责 JWT Token 的生成、解析和校验
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key key;

    /**
     * 初始化密钥
     */
    @PostConstruct
    public void init() {
        // 确保密钥长度足够（至少256位用于HS256）
        byte[] keyBytes = jwtSecret.getBytes();
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 从认证信息生成 JWT Token
     *
     * @param authentication 认证信息
     * @return JWT Token 字符串
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateToken(userDetails.getUsername());
    }

    /**
     * 从用户名生成 JWT Token
     *
     * @param username 用户名
     * @return JWT Token 字符串
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 从 Token 中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * 从 Token 中获取用户ID
     * 先获取用户名，然后查询用户ID
     *
     * @param token      JWT Token
     * @param userMapper 用户Mapper（从调用处传入）
     * @return 用户ID
     */
    public Long getUserIdFromToken(String token, com.approval.mapper.SysUserMapper userMapper) {
        String username = getUsernameFromToken(token);
        if (userMapper != null) {
            com.approval.entity.SysUser user = userMapper.selectOne(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.approval.entity.SysUser>()
                            .eq(com.approval.entity.SysUser::getUsername, username));
            return user != null ? user.getId() : null;
        }
        return null;
    }

    /**
     * 从 Token 中获取过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public Date getExpirationFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }

    /**
     * 校验 Token 是否有效
     *
     * @param token JWT Token
     * @return 如果有效返回 true，否则返回 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            // 无效的 JWT 签名
            return false;
        } catch (MalformedJwtException ex) {
            // 无效的 JWT Token
            return false;
        } catch (ExpiredJwtException ex) {
            // JWT Token 已过期
            return false;
        } catch (UnsupportedJwtException ex) {
            // 不支持的 JWT Token
            return false;
        } catch (IllegalArgumentException ex) {
            // JWT claims 字符串为空
            return false;
        }
    }
}
