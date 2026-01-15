package com.approval.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 通用分页结果包装类
 *
 * @param <T> 数据类型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {

    /**
     * 数据列表
     */
    private List<T> list;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 当前页码
     */
    private Integer page;

    /**
     * 每页条数
     */
    private Integer pageSize;

    /**
     * 总页数
     */
    private Integer totalPages;

    /**
     * 创建分页结果
     *
     * @param list     数据列表
     * @param total    总记录数
     * @param page     当前页码
     * @param pageSize 每页条数
     * @param <T>      数据类型
     * @return 分页结果
     */
    public static <T> PageResult<T> of(List<T> list, Long total, Integer page, Integer pageSize) {
        int totalPages = (int) Math.ceil((double) total / pageSize);
        return PageResult.<T>builder()
                .list(list)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    /**
     * 从 MyBatis-Plus IPage 创建分页结果
     *
     * @param ipage MyBatis-Plus 分页对象
     * @param <T>   数据类型
     * @return 分页结果
     */
    public static <T> PageResult<T> of(com.baomidou.mybatisplus.core.metadata.IPage<T> ipage) {
        return PageResult.<T>builder()
                .list(ipage.getRecords())
                .total(ipage.getTotal())
                .page((int) ipage.getCurrent())
                .pageSize((int) ipage.getSize())
                .totalPages((int) ipage.getPages())
                .build();
    }
}
