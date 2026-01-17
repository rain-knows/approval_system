package com.approval.aspect;

import com.approval.annotation.OperLog;
import com.approval.entity.OperationLog;
import com.approval.mapper.OperationLogMapper;
import com.approval.mapper.SysUserMapper;
import com.approval.util.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 操作日志切面
 * 自动记录被 @OperLog 注解标注的方法调用日志
 */
@Aspect
@Component
@Slf4j
public class OperationLogAspect {

    @Autowired
    private OperationLogMapper operationLogMapper;

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 环绕通知，记录操作日志
     *
     * @param joinPoint 切入点
     * @param operLog   日志注解
     * @return 目标方法返回值
     * @throws Throwable 异常
     */
    @Around("@annotation(operLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperLog operLog) throws Throwable {
        // 记录开始时间
        long startTime = System.currentTimeMillis();

        // 获取请求上下文
        HttpServletRequest request = getRequest();

        // 获取当前用户ID（可能为null，登录时会从结果中获取）
        Long userId = SecurityUtils.getCurrentUserId(userMapper);

        // 获取客户端信息
        String ipAddress = getClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;

        // 构建日志详情
        String detail = buildDetail(joinPoint, operLog);

        Object result = null;
        String targetId = null;

        try {
            // 执行目标方法
            result = joinPoint.proceed();

            // 尝试从结果中提取目标ID
            targetId = extractTargetId(result);

            // 对于登录操作，从返回结果中提取用户ID
            if (userId == null || userId == 0L) {
                userId = extractUserIdFromLoginResult(result);
            }

            return result;
        } catch (Throwable e) {
            detail = detail + " [异常: " + e.getMessage() + "]";
            throw e;
        } finally {
            // 记录日志（包括成功和失败的情况）
            long costTime = System.currentTimeMillis() - startTime;
            saveLogAsync(userId, operLog, targetId, detail, ipAddress, userAgent, costTime);
        }
    }

    /**
     * 异步保存日志
     */
    @Async
    public void saveLogAsync(Long userId, OperLog operLog, String targetId,
            String detail, String ipAddress, String userAgent, long costTime) {
        try {
            OperationLog logEntity = OperationLog.builder()
                    .userId(userId != null ? userId : 0L)
                    .module(operLog.module().getCode())
                    .operation(operLog.operation().getCode())
                    .targetId(targetId)
                    .detail(detail + " [耗时: " + costTime + "ms]")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent != null ? truncate(userAgent, 500) : null)
                    .createdAt(LocalDateTime.now())
                    .build();

            operationLogMapper.insert(logEntity);
            log.debug("操作日志记录成功: {}", logEntity);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    /**
     * 获取 HttpServletRequest
     */
    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取客户端真实IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 多个代理时取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }

    /**
     * 构建日志详情
     */
    private String buildDetail(ProceedingJoinPoint joinPoint, OperLog operLog) {
        StringBuilder detail = new StringBuilder();

        // 添加操作描述
        if (!operLog.description().isEmpty()) {
            detail.append(operLog.description());
        } else {
            detail.append(operLog.operation().getName());
        }

        // 记录方法参数
        if (operLog.logParams()) {
            try {
                MethodSignature signature = (MethodSignature) joinPoint.getSignature();
                String[] paramNames = signature.getParameterNames();
                Object[] args = joinPoint.getArgs();

                if (paramNames != null && args != null && paramNames.length > 0) {
                    Map<String, Object> params = new HashMap<>();
                    for (int i = 0; i < paramNames.length; i++) {
                        // 过滤敏感参数
                        if (!isSensitiveParam(paramNames[i])) {
                            Object arg = args[i];
                            // 过滤复杂对象和请求/响应对象
                            if (arg != null && isSimpleType(arg)) {
                                params.put(paramNames[i], arg);
                            }
                        }
                    }
                    if (!params.isEmpty()) {
                        detail.append(" 参数: ").append(objectMapper.writeValueAsString(params));
                    }
                }
            } catch (Exception e) {
                log.debug("序列化参数失败", e);
            }
        }

        return truncate(detail.toString(), 2000);
    }

    /**
     * 从返回结果中提取目标ID
     */
    private String extractTargetId(Object result) {
        if (result == null) {
            return null;
        }

        try {
            // 尝试从 Result 对象中提取
            if (result.getClass().getSimpleName().equals("Result")) {
                Object data = result.getClass().getMethod("getData").invoke(result);
                if (data instanceof String) {
                    return (String) data;
                } else if (data instanceof Long || data instanceof Integer) {
                    return data.toString();
                }
            }
        } catch (Exception e) {
            log.debug("提取目标ID失败", e);
        }

        return null;
    }

    /**
     * 从登录结果中提取用户ID
     * 用于登录操作日志记录
     */
    private Long extractUserIdFromLoginResult(Object result) {
        if (result == null) {
            return null;
        }

        try {
            // 尝试从 Result<LoginResponse> 中提取用户ID
            if (result.getClass().getSimpleName().equals("Result")) {
                Object data = result.getClass().getMethod("getData").invoke(result);
                if (data != null && data.getClass().getSimpleName().equals("LoginResponse")) {
                    // 获取 user 对象
                    Object user = data.getClass().getMethod("getUser").invoke(data);
                    if (user != null) {
                        // 获取 user.id
                        Object userId = user.getClass().getMethod("getId").invoke(user);
                        if (userId instanceof Long) {
                            return (Long) userId;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("从登录结果中提取用户ID失败", e);
        }

        return null;
    }

    /**
     * 判断是否为敏感参数
     */
    private boolean isSensitiveParam(String paramName) {
        String lowerName = paramName.toLowerCase();
        return lowerName.contains("password") ||
                lowerName.contains("pwd") ||
                lowerName.contains("secret") ||
                lowerName.contains("token") ||
                lowerName.contains("credential");
    }

    /**
     * 判断是否为简单类型（避免序列化复杂对象）
     */
    private boolean isSimpleType(Object obj) {
        return obj instanceof String ||
                obj instanceof Number ||
                obj instanceof Boolean ||
                obj.getClass().isPrimitive();
    }

    /**
     * 截断字符串
     */
    private String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        return str.length() <= maxLength ? str : str.substring(0, maxLength);
    }
}
