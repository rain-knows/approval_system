package com.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 用户请求DTO
 * 用于创建和更新用户
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    /**
     * 用户名（登录账号）
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度应在3-50个字符之间")
    private String username;

    /**
     * 密码（创建时必填，更新时可选）
     * 允许为空（更新时不修改密码），或6-50个字符
     */
    @jakarta.validation.constraints.Pattern(regexp = "^$|^.{6,50}$", message = "密码长度应在6-50个字符之间")
    private String password;

    /**
     * 昵称（显示名称）
     */
    @NotBlank(message = "昵称不能为空")
    @Size(max = 50, message = "昵称不能超过50个字符")
    private String nickname;

    /**
     * 邮箱地址（可选，如果填写则必须符合邮箱格式）
     */
    @Size(max = 100, message = "邮箱不能超过100个字符")
    @jakarta.validation.constraints.Pattern(regexp = "^$|^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$", message = "邮箱格式不正确")
    private String email;

    /**
     * 手机号
     */
    @Size(max = 20, message = "手机号不能超过20个字符")
    private String phone;

    /**
     * 头像文件路径
     */
    @Size(max = 255, message = "头像路径不能超过255个字符")
    private String avatar;

    /**
     * 所属部门ID
     */
    private Long departmentId;

    /**
     * 角色ID列表
     */
    private List<Long> roleIds;

    /**
     * 状态: 0-禁用 1-启用
     */
    private Integer status;
}
