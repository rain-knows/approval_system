package com.approval.mapper;

import com.approval.entity.OperationLog;
import com.approval.vo.OperationLogVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;

/**
 * 操作日志数据访问层
 * 提供操作日志的数据库操作接口
 */
@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {

        /**
         * 分页查询日志列表（关联用户信息）
         *
         * @param page            分页对象
         * @param module          模块筛选
         * @param operation       操作类型筛选
         * @param userId          用户ID筛选
         * @param usernameKeyword 用户名/昵称关键词
         * @param targetId        目标业务ID
         * @param startTime       开始时间
         * @param endTime         结束时间
         * @param keyword         详情关键词
         * @return 分页日志列表
         */
        @Select("<script>" +
                        "SELECT ol.id, ol.user_id, u.username, u.nickname, " +
                        "ol.module, ol.operation, ol.target_id, ol.detail, " +
                        "ol.ip_address, ol.user_agent, ol.created_at " +
                        "FROM operation_log ol " +
                        "LEFT JOIN sys_user u ON ol.user_id = u.id " +
                        "WHERE 1=1 " +
                        "<if test='module != null and module != \"\"'> AND ol.module = #{module} </if>" +
                        "<if test='operation != null and operation != \"\"'> AND ol.operation = #{operation} </if>" +
                        "<if test='userId != null'> AND ol.user_id = #{userId} </if>" +
                        "<if test='usernameKeyword != null and usernameKeyword != \"\"'> AND (u.username LIKE CONCAT('%', #{usernameKeyword}, '%') OR u.nickname LIKE CONCAT('%', #{usernameKeyword}, '%') OR ol.detail LIKE CONCAT('%', #{usernameKeyword}, '%')) </if>"
                        +
                        "<if test='targetId != null and targetId != \"\"'> AND ol.target_id = #{targetId} </if>" +
                        "<if test='startTime != null'> AND ol.created_at &gt;= #{startTime} </if>" +
                        "<if test='endTime != null'> AND ol.created_at &lt;= #{endTime} </if>" +
                        "<if test='keyword != null and keyword != \"\"'> AND ol.detail LIKE CONCAT('%', #{keyword}, '%') </if>"
                        +
                        "ORDER BY ol.created_at DESC" +
                        "</script>")
        IPage<OperationLogVO> selectLogPage(
                        Page<OperationLogVO> page,
                        @Param("module") String module,
                        @Param("operation") String operation,
                        @Param("userId") Long userId,
                        @Param("usernameKeyword") String usernameKeyword,
                        @Param("targetId") String targetId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("keyword") String keyword);

        /**
         * 统计指定时间范围内各模块的日志数量
         *
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 模块统计结果
         */
        @Select("SELECT module, COUNT(*) as count FROM operation_log " +
                        "WHERE created_at >= #{startTime} AND created_at <= #{endTime} " +
                        "GROUP BY module ORDER BY count DESC")
        java.util.List<java.util.Map<String, Object>> countByModule(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * 统计指定时间范围内各操作类型的日志数量
         *
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 操作统计结果
         */
        @Select("SELECT operation, COUNT(*) as count FROM operation_log " +
                        "WHERE created_at >= #{startTime} AND created_at <= #{endTime} " +
                        "GROUP BY operation ORDER BY count DESC")
        java.util.List<java.util.Map<String, Object>> countByOperation(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * 统计指定时间范围内每日的日志数量
         *
         * @param startTime 开始时间
         * @param endTime   结束时间
         * @return 每日统计结果
         */
        @Select("SELECT DATE(created_at) as date, COUNT(*) as count FROM operation_log " +
                        "WHERE created_at >= #{startTime} AND created_at <= #{endTime} " +
                        "GROUP BY DATE(created_at) ORDER BY date DESC")
        java.util.List<java.util.Map<String, Object>> countByDay(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);
}
