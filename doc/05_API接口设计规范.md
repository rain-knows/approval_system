# 审批系统 - API 接口设计规范

## 1. 接口设计原则

### 1.1 RESTful 规范

- 使用 HTTP 动词表示操作：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- URL 使用名词复数形式表示资源
- 使用版本控制：`/api/v1/`
- 使用 HTTP 状态码表示结果

### 1.2 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1705103372000
}
```

### 1.3 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "timestamp": 1705103372000
}
```

## 2. 认证接口

### 2.1 用户登录

**请求**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

**响应**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "/files/avatar/1.jpg",
      "role": "ADMIN"
    }
  }
}
```

### 2.2 用户注册

```
POST /api/v1/auth/register

{
  "username": "user01",
  "password": "123456",
  "nickname": "用户01",
  "email": "user01@example.com"
}
```

### 2.3 退出登录

```
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

## 3. 用户接口

### 3.1 获取当前用户信息

```
GET /api/v1/users/me
Authorization: Bearer {token}
```

### 3.2 更新用户信息

```
PUT /api/v1/users/me

{
  "nickname": "新昵称",
  "email": "new@example.com"
}
```

### 3.3 获取用户列表（管理员）

```
GET /api/v1/users?page=1&pageSize=10&keyword=xxx
```

### 3.4 更新密码

```
PUT /api/v1/users/me/password
Authorization: Bearer {token}

{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

**响应**
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

## 4. 审批接口

### 4.1 创建审批

```
POST /api/v1/approvals

{
  "title": "请假申请",
  "type": "LEAVE",
  "content": "因个人事务需请假3天",
  "approverIds": [2, 3],
  "attachmentIds": ["file-uuid-1"]
}
```

### 4.2 获取审批列表

```
GET /api/v1/approvals?page=1&pageSize=10&status=PENDING&type=LEAVE
```

**响应**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "uuid-1",
        "title": "请假申请",
        "type": "LEAVE",
        "typeName": "请假",
        "status": "PENDING",
        "statusName": "待审批",
        "initiator": { "id": 1, "name": "张三" },
        "currentApprover": { "id": 2, "name": "李四" },
        "createdAt": "2026-01-13 09:00:00"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

### 4.3 获取审批详情

```
GET /api/v1/approvals/{id}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "id": "uuid-1",
    "title": "请假申请",
    "type": "LEAVE",
    "content": "因个人事务需请假3天",
    "status": "IN_PROGRESS",
    "initiator": { "id": 1, "name": "张三" },
    "nodes": [
      {
        "order": 1,
        "approver": { "id": 2, "name": "李四" },
        "status": "APPROVED",
        "comment": "同意",
        "approvedAt": "2026-01-13 10:00:00"
      },
      {
        "order": 2,
        "approver": { "id": 3, "name": "王五" },
        "status": "PENDING",
        "comment": null,
        "approvedAt": null
      }
    ],
    "attachments": [
      {
        "id": "file-uuid-1",
        "fileName": "请假单.docx",
        "fileSize": 102400,
        "filePath": "/files/2026/01/13/xxx.docx"
      }
    ],
    "createdAt": "2026-01-13 09:00:00"
  }
}
```

### 4.4 审批操作

```
POST /api/v1/approvals/{id}/approve

{
  "approved": true,
  "comment": "同意请假申请"
}
```

### 4.5 撤回审批

```
POST /api/v1/approvals/{id}/withdraw
```

### 4.6 获取我的待办

```
GET /api/v1/approvals/todo?page=1&pageSize=10
```

### 4.7 获取我发起的

```
GET /api/v1/approvals/initiated?page=1&pageSize=10
```

## 5. 文件接口

### 5.1 文件上传

```
POST /api/v1/files/upload
Content-Type: multipart/form-data

file: (binary)
```

**响应**
```json
{
  "code": 200,
  "data": {
    "id": "file-uuid-1",
    "fileName": "document.pdf",
    "fileSize": 102400,
    "filePath": "/files/2026/01/13/xxx.pdf"
  }
}
```

### 5.2 文件下载

```
GET /api/v1/files/download/{id}
```

### 5.3 文件预览

```
GET /files/{path}
```

## 6. 通知接口

### 6.1 获取通知列表

```
GET /api/v1/notifications?page=1&pageSize=10&read=false
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "uuid-1",
        "title": "您有一条新的审批待处理",
        "content": "张三提交了一份请假申请，等待您审批",
        "type": "APPROVAL",
        "relatedId": "approval-uuid-1",
        "read": false,
        "createdAt": "2026-01-13 10:00:00"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 6.2 标记通知已读

```
PUT /api/v1/notifications/{id}/read
Authorization: Bearer {token}
```

### 6.3 全部标记已读

```
PUT /api/v1/notifications/read-all
Authorization: Bearer {token}
```

### 6.4 获取未读通知数量

```
GET /api/v1/notifications/unread-count
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "count": 3
  }
}
```

## 7. 工作流接口（管理员）

### 7.1 获取工作流模版列表

```
GET /api/v1/workflows?page=1&pageSize=10
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "请假审批流程",
        "typeCode": "LEAVE",
        "description": "员工请假申请审批流程",
        "nodes": [
          { "order": 1, "roleName": "直属上级", "roleId": null },
          { "order": 2, "roleName": "部门经理", "roleId": null }
        ],
        "status": 1,
        "createdAt": "2026-01-01 00:00:00"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 7.2 创建工作流模版

```
POST /api/v1/workflows
Authorization: Bearer {token}

{
  "name": "报销审批流程",
  "typeCode": "EXPENSE",
  "description": "费用报销审批流程",
  "nodes": [
    { "order": 1, "roleName": "直属上级" },
    { "order": 2, "roleName": "财务" }
  ]
}
```

### 7.3 获取工作流详情

```
GET /api/v1/workflows/{id}
Authorization: Bearer {token}
```

### 7.4 更新工作流模版

```
PUT /api/v1/workflows/{id}
Authorization: Bearer {token}

{
  "name": "报销审批流程(更新)",
  "description": "更新后的描述",
  "nodes": [
    { "order": 1, "roleName": "直属上级" },
    { "order": 2, "roleName": "财务主管" },
    { "order": 3, "roleName": "财务总监" }
  ]
}
```

### 7.5 删除工作流模版

```
DELETE /api/v1/workflows/{id}
Authorization: Bearer {token}
```

### 7.6 启用/禁用工作流

```
PUT /api/v1/workflows/{id}/status
Authorization: Bearer {token}

{
  "status": 0
}
```

## 8. 错误码定义

| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未授权（Token 无效或过期） |
| 403 | 403 | 禁止访问（无权限） |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突（如用户名已存在） |
| 500 | 500 | 服务器内部错误 |
| 1001 | 400 | 用户名或密码错误 |
| 1002 | 400 | 用户已存在 |
| 1003 | 400 | 原密码错误 |
| 2001 | 400 | 审批记录不存在 |
| 2002 | 400 | 当前状态不允许此操作 |
| 2003 | 403 | 无审批权限 |
| 3001 | 400 | 文件上传失败 |
| 3002 | 400 | 文件类型不支持 |
| 3003 | 400 | 文件大小超出限制 |
| 4001 | 400 | 通知不存在 |
| 5001 | 400 | 工作流模版不存在 |
| 5002 | 400 | 工作流名称已存在 |

## 9. 接口认证

除以下接口外，所有接口都需要在 Header 中携带 Token：

```
Authorization: Bearer {token}
```

**无需认证的接口：**
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- GET /files/**
