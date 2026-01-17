package com.approval.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 日志操作类型枚举
 * 定义系统中各种操作的类型标识
 */
@Getter
@AllArgsConstructor
public enum LogOperation {

    /** 登录 - 用户登录成功 */
    LOGIN("LOGIN", "登录"),

    /** 登出 - 用户主动登出 */
    LOGOUT("LOGOUT", "登出"),

    /** 登录失败 - 登录认证失败 */
    LOGIN_FAIL("LOGIN_FAIL", "登录失败"),

    /** 密码修改 - 用户修改密码 */
    PASSWORD_CHANGE("PASSWORD_CHANGE", "密码修改"),

    /** 创建 - 创建新记录 */
    CREATE("CREATE", "创建"),

    /** 更新 - 修改现有记录 */
    UPDATE("UPDATE", "更新"),

    /** 删除 - 删除记录 */
    DELETE("DELETE", "删除"),

    /** 查看 - 查看敏感详情 */
    VIEW("VIEW", "查看"),

    /** 提交 - 提交审批申请 */
    SUBMIT("SUBMIT", "提交"),

    /** 审批通过 - 审批节点通过 */
    APPROVE("APPROVE", "审批通过"),

    /** 审批拒绝 - 审批节点拒绝 */
    REJECT("REJECT", "审批拒绝"),

    /** 撤回 - 撤回审批申请 */
    WITHDRAW("WITHDRAW", "撤回"),

    /** 分配角色 - 为用户分配角色 */
    ASSIGN_ROLE("ASSIGN_ROLE", "分配角色"),

    /** 上传 - 上传文件 */
    UPLOAD("UPLOAD", "上传"),

    /** 下载 - 下载文件 */
    DOWNLOAD("DOWNLOAD", "下载"),

    /** 查询 - 查询列表或详情 */
    QUERY("QUERY", "查询");

    /** 操作编码 */
    private final String code;

    /** 操作名称 */
    private final String name;

    /**
     * 根据编码获取枚举值
     *
     * @param code 操作编码
     * @return 对应的枚举值，未找到返回 null
     */
    public static LogOperation fromCode(String code) {
        for (LogOperation operation : values()) {
            if (operation.getCode().equals(code)) {
                return operation;
            }
        }
        return null;
    }
}
