package com.approval.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 日志模块枚举
 * 定义系统中各个功能模块的标识
 */
@Getter
@AllArgsConstructor
public enum LogModule {

    /** 认证模块 - 登录、登出、密码修改等认证相关操作 */
    AUTH("AUTH", "认证模块"),

    /** 用户管理 - 用户账号的增删改查操作 */
    USER("USER", "用户管理"),

    /** 部门管理 - 部门的增删改查操作 */
    DEPARTMENT("DEPARTMENT", "部门管理"),

    /** 角色管理 - 角色及权限配置操作 */
    ROLE("ROLE", "角色管理"),

    /** 审批管理 - 审批申请的创建、审批、撤回等操作 */
    APPROVAL("APPROVAL", "审批管理"),

    /** 工作流管理 - 工作流模板的配置操作 */
    WORKFLOW("WORKFLOW", "工作流管理"),

    /** 文件管理 - 文件上传、下载、删除操作 */
    FILE("FILE", "文件管理"),

    /** 职位管理 - 职位的查询操作 */
    POSITION("POSITION", "职位管理"),

    /** 通知管理 - 通知的查询和标记操作 */
    NOTIFICATION("NOTIFICATION", "通知管理"),

    /** 系统配置 - 系统参数配置操作 */
    SYSTEM("SYSTEM", "系统配置");

    /** 模块编码 */
    private final String code;

    /** 模块名称 */
    private final String name;

    /**
     * 根据编码获取枚举值
     *
     * @param code 模块编码
     * @return 对应的枚举值，未找到返回 null
     */
    public static LogModule fromCode(String code) {
        for (LogModule module : values()) {
            if (module.getCode().equals(code)) {
                return module;
            }
        }
        return null;
    }
}
