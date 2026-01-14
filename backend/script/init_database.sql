-- ============================================================
-- 审批系统数据库初始化脚本 (RBAC版本)
-- 对应文档: doc/06_数据库设计文档.md
-- 版本: 2.0.0
-- 生成时间: 2026-01-14
-- 更新内容: 引入RBAC机制，职位与权限分离
-- ============================================================

-- SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 第一部分: 表结构创建 (按依赖顺序)
-- ============================================================

-- ----------------------------
-- 1. 部门表 (sys_department)
-- 必须先创建，因为 sys_user 依赖它
-- ----------------------------
DROP TABLE IF EXISTS `sys_department`;
CREATE TABLE `sys_department` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `name` VARCHAR(100) NOT NULL COMMENT '部门名称',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父部门ID（0表示顶级部门）',
  `leader_id` BIGINT DEFAULT NULL COMMENT '部门负责人ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门表';

-- ----------------------------
-- 2. 用户表 (sys_user) - RBAC版本：移除role字段
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录账号）',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（BCrypt加密）',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称（显示名称）',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像文件路径',
  `department_id` BIGINT DEFAULT NULL COMMENT '所属部门ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_department` (`department_id`),
  CONSTRAINT `fk_user_dept` FOREIGN KEY (`department_id`) REFERENCES `sys_department` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

-- ----------------------------
-- 3. 角色表 (sys_role) - RBAC核心表
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `code` VARCHAR(50) NOT NULL COMMENT '角色编码（如SUPER_ADMIN）',
  `name` VARCHAR(100) NOT NULL COMMENT '角色名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色表';

-- ----------------------------
-- 4. 权限表 (sys_permission) - RBAC核心表
-- ----------------------------
DROP TABLE IF EXISTS `sys_permission`;
CREATE TABLE `sys_permission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `code` VARCHAR(100) NOT NULL COMMENT '权限编码（如user:view）',
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `type` VARCHAR(20) NOT NULL COMMENT '权限类型: MENU/BUTTON/API',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID（树形结构）',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '路由路径/API路径',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标（菜单用）',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='权限表';

-- ----------------------------
-- 5. 用户角色关联表 (sys_user_role)
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户角色关联表';

-- ----------------------------
-- 6. 角色权限关联表 (sys_role_permission)
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_permission`;
CREATE TABLE `sys_role_permission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色权限关联表';

-- ----------------------------
-- 7. 职位表 (sys_position) - 业务岗位，与系统权限分离
-- ----------------------------
DROP TABLE IF EXISTS `sys_position`;
CREATE TABLE `sys_position` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '职位ID',
  `code` VARCHAR(50) NOT NULL COMMENT '职位编码（如DEPT_MANAGER）',
  `name` VARCHAR(100) NOT NULL COMMENT '职位名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '职位描述',
  `level` INT DEFAULT 0 COMMENT '职级（用于审批层级）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='职位表';

-- ----------------------------
-- 8. 用户职位关联表 (sys_user_position)
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_position`;
CREATE TABLE `sys_user_position` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `position_id` BIGINT NOT NULL COMMENT '职位ID',
  `is_primary` TINYINT DEFAULT 0 COMMENT '是否主职位: 0-否 1-是',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_position` (`user_id`, `position_id`),
  KEY `idx_position_id` (`position_id`),
  CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_position` FOREIGN KEY (`position_id`) REFERENCES `sys_position` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户职位关联表';

-- ----------------------------
-- 9. 审批类型表 (approval_type)
-- ----------------------------
DROP TABLE IF EXISTS `approval_type`;
CREATE TABLE `approval_type` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '类型ID',
  `code` VARCHAR(50) NOT NULL COMMENT '类型编码（如LEAVE/EXPENSE）',
  `name` VARCHAR(100) NOT NULL COMMENT '类型名称',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '类型描述',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '主题颜色',
  `sort_order` INT DEFAULT 0 COMMENT '排序序号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批类型表';

-- ----------------------------
-- 10. 工作流模板表 (workflow_template)
-- ----------------------------
DROP TABLE IF EXISTS `workflow_template`;
CREATE TABLE `workflow_template` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `type_code` VARCHAR(50) NOT NULL COMMENT '关联审批类型编码',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '模板描述',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  `created_by` BIGINT NOT NULL COMMENT '创建人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type_code` (`type_code`),
  KEY `idx_status` (`status`),
  KEY `fk_workflow_creator` (`created_by`),
  CONSTRAINT `fk_tpl_creator` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_tpl_type` FOREIGN KEY (`type_code`) REFERENCES `approval_type` (`code`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工作流模板表';

-- ----------------------------
-- 11. 工作流节点模板表 (workflow_node_template)
-- approver_type 支持: USER/POSITION/DEPARTMENT_HEAD
-- ----------------------------
DROP TABLE IF EXISTS `workflow_node_template`;
CREATE TABLE `workflow_node_template` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '节点模板ID',
  `workflow_id` BIGINT NOT NULL COMMENT '工作流模板ID',
  `node_name` VARCHAR(100) NOT NULL COMMENT '节点名称',
  `node_order` INT NOT NULL COMMENT '节点顺序',
  `approver_type` VARCHAR(20) NOT NULL COMMENT '审批人类型: USER/POSITION/DEPARTMENT_HEAD',
  `approver_id` BIGINT DEFAULT NULL COMMENT '指定审批人ID（USER类型）或职位ID（POSITION类型）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_workflow_order` (`workflow_id`,`node_order`),
  KEY `idx_workflow` (`workflow_id`),
  CONSTRAINT `fk_node_tpl_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflow_template` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工作流节点模板表';

-- ----------------------------
-- 12. 审批记录表 (approval_record)
-- ----------------------------
DROP TABLE IF EXISTS `approval_record`;
CREATE TABLE `approval_record` (
  `id` VARCHAR(36) NOT NULL COMMENT '审批ID (UUID)',
  `title` VARCHAR(200) NOT NULL COMMENT '审批标题',
  `type_code` VARCHAR(50) NOT NULL COMMENT '审批类型编码',
  `content` TEXT COMMENT '审批内容（支持JSON）',
  `initiator_id` BIGINT NOT NULL COMMENT '发起人ID',
  `priority` TINYINT DEFAULT 0 COMMENT '紧急程度: 0-普通 1-紧急 2-非常紧急',
  `deadline` DATETIME DEFAULT NULL COMMENT '截止日期',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态码',
  `current_node_order` INT DEFAULT 1 COMMENT '当前审批节点序号',
  `workflow_id` BIGINT DEFAULT NULL COMMENT '使用的工作流模板ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_initiator` (`initiator_id`),
  KEY `idx_type` (`type_code`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_approval_workflow` (`workflow_id`),
  CONSTRAINT `fk_record_initiator` FOREIGN KEY (`initiator_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_record_type` FOREIGN KEY (`type_code`) REFERENCES `approval_type` (`code`) ON DELETE RESTRICT,
  CONSTRAINT `fk_record_workflow` FOREIGN KEY (`workflow_id`) REFERENCES `workflow_template` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批记录表';

-- ----------------------------
-- 13. 审批节点表 (approval_node)
-- ----------------------------
DROP TABLE IF EXISTS `approval_node`;
CREATE TABLE `approval_node` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '节点ID',
  `approval_id` VARCHAR(36) NOT NULL COMMENT '审批记录ID',
  `node_name` VARCHAR(100) NOT NULL COMMENT '节点名称',
  `approver_id` BIGINT NOT NULL COMMENT '审批人ID',
  `node_order` INT NOT NULL COMMENT '节点顺序',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0-待审批 1-已通过 2-已拒绝',
  `comment` VARCHAR(500) DEFAULT NULL COMMENT '审批意见',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审批时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_approval_order` (`approval_id`,`node_order`),
  KEY `idx_approval_id` (`approval_id`),
  KEY `idx_approver` (`approver_id`),
  CONSTRAINT `fk_node_record` FOREIGN KEY (`approval_id`) REFERENCES `approval_record` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_node_approver` FOREIGN KEY (`approver_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='审批节点表';

-- ----------------------------
-- 14. 附件表 (attachment)
-- ----------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment` (
  `id` VARCHAR(36) NOT NULL COMMENT '附件ID (UUID)',
  `approval_id` VARCHAR(36) DEFAULT NULL COMMENT '关联审批ID',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `stored_name` VARCHAR(255) NOT NULL COMMENT '存储文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  `file_size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME 类型',
  `preview_support` TINYINT DEFAULT 0 COMMENT '是否支持在线预览',
  `uploader_id` BIGINT NOT NULL COMMENT '上传者ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_approval_id` (`approval_id`),
  KEY `idx_uploader` (`uploader_id`),
  CONSTRAINT `fk_attach_record` FOREIGN KEY (`approval_id`) REFERENCES `approval_record` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_attach_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='附件表';

-- ----------------------------
-- 15. 通知表 (notification)
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` VARCHAR(36) NOT NULL COMMENT '通知ID (UUID)',
  `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
  `content` VARCHAR(500) DEFAULT NULL COMMENT '通知内容',
  `type` VARCHAR(20) NOT NULL COMMENT '通知类型: APPROVAL/SYSTEM/REMINDER',
  `related_id` VARCHAR(36) DEFAULT NULL COMMENT '关联业务ID',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_notify_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='通知表';

-- ----------------------------
-- 16. 操作日志表 (operation_log)
-- ----------------------------
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT NOT NULL COMMENT '操作用户ID',
  `module` VARCHAR(50) NOT NULL COMMENT '模块名称',
  `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `target_id` VARCHAR(36) DEFAULT NULL COMMENT '目标业务ID',
  `detail` TEXT COMMENT '操作详情',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT '客户端IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理信息',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='操作日志表';

-- 补上循环依赖的外键
ALTER TABLE `sys_department` ADD CONSTRAINT `fk_dept_leader` FOREIGN KEY (`leader_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL;


-- ============================================================
-- 第二部分: 初始化数据
-- ============================================================

-- ----------------------------
-- 1. 部门数据
-- ----------------------------
INSERT INTO `sys_department` (`id`, `name`, `parent_id`, `leader_id`, `sort_order`, `status`) VALUES
(1, '总经办', 0, NULL, 1, 1),
(2, '人事行政部', 1, NULL, 2, 1),
(3, '技术部', 1, NULL, 3, 1),
(4, '财务部', 1, NULL, 4, 1),
(5, '市场部', 1, NULL, 5, 1);

-- ----------------------------
-- 2. 用户数据 (密码均为: admin123 -> BCrypt加密)
-- 注意: 用户的角色和职位通过关联表设置
-- ----------------------------
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `email`, `department_id`, `status`) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', 'admin@company.com', 1, 1),
(2, 'hr_admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '人事经理', 'hr@company.com', 2, 1),
(3, 'tech_lead', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '技术总监', 'tech@company.com', 3, 1),
(4, 'finance_mgr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '财务经理', 'finance@company.com', 4, 1),
(5, 'dev_zhang', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张开发', 'zhang@company.com', 3, 1),
(6, 'market_li', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李市场', 'li@company.com', 5, 1);

-- 更新部门负责人
UPDATE `sys_department` SET `leader_id` = 1 WHERE `id` = 1;
UPDATE `sys_department` SET `leader_id` = 2 WHERE `id` = 2;
UPDATE `sys_department` SET `leader_id` = 3 WHERE `id` = 3;
UPDATE `sys_department` SET `leader_id` = 4 WHERE `id` = 4;

-- ----------------------------
-- 3. 系统角色数据 (RBAC核心)
-- ----------------------------
INSERT INTO `sys_role` (`id`, `code`, `name`, `description`, `sort_order`, `status`) VALUES
(1, 'SUPER_ADMIN', '超级管理员', '系统最高权限，可管理所有功能', 1, 1),
(2, 'ADMIN', '管理员', '系统管理功能权限', 2, 1),
(3, 'USER', '普通用户', '基础功能权限', 3, 1);

-- ----------------------------
-- 4. 系统权限数据 (RBAC核心)
-- ----------------------------
INSERT INTO `sys_permission` (`id`, `code`, `name`, `type`, `parent_id`, `path`, `icon`, `sort_order`, `status`) VALUES
-- 一级菜单
(1, 'dashboard:view', '仪表盘', 'MENU', 0, '/dashboard', 'home', 1, 1),
(2, 'approval:view', '审批列表', 'MENU', 0, '/approval', 'file-check', 2, 1),
(3, 'user:view', '用户管理', 'MENU', 0, '/admin/users', 'users', 10, 1),
(4, 'role:view', '角色管理', 'MENU', 0, '/admin/roles', 'shield', 11, 1),
(5, 'system:config', '系统配置', 'MENU', 0, '/admin/settings', 'settings', 12, 1),
-- 审批相关按钮权限
(10, 'approval:create', '发起审批', 'BUTTON', 2, NULL, NULL, 1, 1),
(11, 'approval:approve', '审批操作', 'BUTTON', 2, NULL, NULL, 2, 1),
(12, 'approval:withdraw', '撤回审批', 'BUTTON', 2, NULL, NULL, 3, 1),
-- 用户管理按钮权限
(20, 'user:create', '新增用户', 'BUTTON', 3, NULL, NULL, 1, 1),
(21, 'user:edit', '编辑用户', 'BUTTON', 3, NULL, NULL, 2, 1),
(22, 'user:delete', '删除用户', 'BUTTON', 3, NULL, NULL, 3, 1),
-- 角色管理按钮权限
(30, 'role:manage', '角色配置', 'BUTTON', 4, NULL, NULL, 1, 1);

-- ----------------------------
-- 5. 用户角色关联数据
-- admin: 超级管理员
-- hr_admin, tech_lead, finance_mgr: 管理员
-- dev_zhang, market_li: 普通用户
-- ----------------------------
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1),  -- admin -> 超级管理员
(2, 2),  -- hr_admin -> 管理员
(3, 2),  -- tech_lead -> 管理员
(4, 2),  -- finance_mgr -> 管理员
(5, 3),  -- dev_zhang -> 普通用户
(6, 3);  -- market_li -> 普通用户

-- ----------------------------
-- 6. 角色权限关联数据
-- 超级管理员: 所有权限
-- 管理员: 除系统配置外的管理权限
-- 普通用户: 基础功能
-- ----------------------------
-- 超级管理员 - 拥有所有权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(1, 10), (1, 11), (1, 12),
(1, 20), (1, 21), (1, 22),
(1, 30);

-- 管理员 - 用户管理、审批管理，无系统配置
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(2, 1), (2, 2), (2, 3),
(2, 10), (2, 11), (2, 12),
(2, 20), (2, 21);

-- 普通用户 - 仪表盘、审批列表、发起审批
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`) VALUES
(3, 1), (3, 2),
(3, 10), (3, 12);

-- ----------------------------
-- 7. 业务职位数据 (与系统权限分离)
-- ----------------------------
INSERT INTO `sys_position` (`id`, `code`, `name`, `description`, `level`, `sort_order`, `status`) VALUES
(1, 'CEO', '总经理', '公司最高决策者', 100, 1, 1),
(2, 'DEPT_MANAGER', '部门经理', '部门负责人', 50, 2, 1),
(3, 'TEAM_LEADER', '组长', '团队负责人', 30, 3, 1),
(4, 'STAFF', '员工', '普通员工', 10, 4, 1),
(5, 'FINANCE', '财务', '财务审核职责', 40, 5, 1),
(6, 'HR', '人事', '人事管理职责', 40, 6, 1);

-- ----------------------------
-- 8. 用户职位关联数据
-- ----------------------------
INSERT INTO `sys_user_position` (`user_id`, `position_id`, `is_primary`) VALUES
(1, 1, 1),  -- admin -> 总经理(主)
(2, 2, 1),  -- hr_admin -> 部门经理(主)
(2, 6, 0),  -- hr_admin -> 人事(兼)
(3, 2, 1),  -- tech_lead -> 部门经理(主)
(4, 2, 1),  -- finance_mgr -> 部门经理(主)
(4, 5, 0),  -- finance_mgr -> 财务(兼)
(5, 4, 1),  -- dev_zhang -> 员工(主)
(6, 4, 1);  -- market_li -> 员工(主)

-- ----------------------------
-- 9. 审批类型数据
-- ----------------------------
INSERT INTO `approval_type` (`code`, `name`, `description`, `icon`, `color`, `sort_order`) VALUES
('LEAVE', '请假申请', '员工请假、调休审批', 'calendar', '#3B82F6', 1),
('EXPENSE', '报销申请', '差旅费、业务费报销', 'dollar-sign', '#10B981', 2),
('PURCHASE', '采购申请', '办公用品、设备采购', 'shopping-cart', '#8B5CF6', 3),
('BUSINESS_TRIP', '出差申请', '外出公干、出差备案', 'plane', '#F59E0B', 4),
('OVERTIME', '加班申请', '工作日及节假日加班', 'clock', '#EF4444', 5),
('CONTRACT', '合同审批', '业务合同审核', 'file-text', '#6366F1', 6);

-- ----------------------------
-- 10. 工作流模板数据
-- ----------------------------
INSERT INTO `workflow_template` (`id`, `name`, `type_code`, `description`, `created_by`, `status`) VALUES
(1, '普通请假流程', 'LEAVE', '适用于3天以内的普通请假', 2, 1),
(2, '费用报销流程', 'EXPENSE', '标准报销审批流', 4, 1);

-- ----------------------------
-- 11. 工作流节点数据 (使用POSITION类型)
-- 请假流程: 部门负责人 -> 人事
-- 报销流程: 部门负责人 -> 财务 -> 总经理
-- ----------------------------
INSERT INTO `workflow_node_template` (`workflow_id`, `node_name`, `node_order`, `approver_type`, `approver_id`) VALUES
-- 请假流程
(1, '部门负责人审批', 1, 'DEPARTMENT_HEAD', NULL),
(1, '人事审批', 2, 'POSITION', 6),  -- approver_id=6 对应 HR 职位
-- 报销流程
(2, '部门负责人审批', 1, 'DEPARTMENT_HEAD', NULL),
(2, '财务初审', 2, 'POSITION', 5),  -- approver_id=5 对应 FINANCE 职位
(2, '总经理审批', 3, 'POSITION', 1); -- approver_id=1 对应 CEO 职位

-- ----------------------------
-- 12. 预置系统通知
-- ----------------------------
INSERT INTO `notification` (`id`, `user_id`, `title`, `content`, `type`, `created_at`) VALUES
('uuid-notify-001', 5, '欢迎使用审批系统', '您好，您的账号已创建成功，请尽快完善个人信息。', 'SYSTEM', NOW()),
('uuid-notify-002', 3, '待办事项提醒', '您有新的部门报销申请需要审批，请及时处理。', 'APPROVAL', NOW());

-- SET FOREIGN_KEY_CHECKS = 1;
