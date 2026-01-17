package com.approval.annotation;

import com.approval.enums.LogModule;
import com.approval.enums.LogOperation;

import java.lang.annotation.*;

/**
 * 操作日志注解
 * 用于标注需要记录操作日志的方法
 * 被标注的方法执行时会自动记录操作日志
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperLog {

    /**
     * 模块名称
     *
     * @return 日志模块枚举
     */
    LogModule module();

    /**
     * 操作类型
     *
     * @return 日志操作类型枚举
     */
    LogOperation operation();

    /**
     * 操作描述（支持SpEL表达式）
     * 例如："创建用户: #{#request.username}"
     *
     * @return 操作描述
     */
    String description() default "";

    /**
     * 是否记录请求参数
     *
     * @return 默认为 true
     */
    boolean logParams() default true;

    /**
     * 是否记录返回结果
     *
     * @return 默认为 false
     */
    boolean logResult() default false;
}
