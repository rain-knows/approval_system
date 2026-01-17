package com.approval.controller;

import com.approval.annotation.OperLog;
import com.approval.common.Result;
import com.approval.dto.LoginRequest;
import com.approval.dto.RegisterRequest;
import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;
import com.approval.service.AuthService;
import com.approval.vo.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 处理用户登录和注册请求
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应（包含 Token 和用户信息）
     */
    @PostMapping("/login")
    @OperLog(module = LogModule.AUTH, operation = LogOperation.LOGIN, description = "用户登录")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success("登录成功", response);
    }

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 注册结果
     */
    @PostMapping("/register")
    @OperLog(module = LogModule.AUTH, operation = LogOperation.CREATE, description = "用户注册")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success("注册成功", null);
    }
}
