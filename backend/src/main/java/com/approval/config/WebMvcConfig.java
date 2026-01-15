package com.approval.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMvc 配置类
 * 配置静态资源映射
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:D:/uploads/approval-system}")
    private String uploadDir;

    @Value("${file.access-path:/files}")
    private String accessPath;

    /**
     * 配置静态资源映射
     * 将 /files/** 映射到本地磁盘目录
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 文件存储目录映射
        registry.addResourceHandler(accessPath + "/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
