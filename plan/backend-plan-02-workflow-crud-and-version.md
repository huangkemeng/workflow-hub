## Plan-2: 后端 - 工作流CRUD与版本管理API

### 目标
实现工作流的完整CRUD操作API，包括创建工作流、编辑基本信息、删除工作流、查看列表，以及版本历史的记录和回滚功能。

### 涉及文件清单
- `src/app/api/workflows/route.ts` — new（工作流列表、创建）
- `src/app/api/workflows/[id]/route.ts` — new（工作流详情、更新、删除）
- `src/app/api/workflows/[id]/versions/route.ts` — new（版本列表）
- `src/app/api/workflows/[id]/versions/[versionId]/rollback/route.ts` — new（版本回滚）
- `src/lib/workflow.ts` — new（工作流业务逻辑封装）
- `src/lib/version.ts` — new（版本管理逻辑）
- `src/middleware.ts` — new（API认证中间件）

### 依赖项
- 依赖 Plan-1 的数据库Schema和Prisma Client
- 依赖 Plan-1 的认证配置

### 实现要点
1. **API路由设计**
   - `GET /api/workflows` - 获取当前用户的工作流列表（支持分页、搜索、排序）
   - `POST /api/workflows` - 创建工作流
   - `GET /api/workflows/[id]` - 获取工作流详情（包含最新版本节点数据）
   - `PUT /api/workflows/[id]` - 更新工作流基本信息
   - `DELETE /api/workflows/[id]` - 删除工作流
   - `GET /api/workflows/[id]/versions` - 获取版本历史列表
   - `POST /api/workflows/[id]/versions/[versionId]/rollback` - 回滚到指定版本

2. **版本管理机制**
   - 每次保存工作流时自动创建新版本
   - 版本号自增（1, 2, 3...）
   - 回滚时复制目标版本数据创建新版本（不回删历史）
   - 节点数据以JSON格式存储在WorkflowVersion表中

3. **数据验证**
   - 使用Zod进行请求参数验证
   - 标题必填，长度1-100字符
   - 描述可选，长度0-500字符
   - 节点数据验证结构完整性

4. **权限控制**
   - 所有API需要认证（除健康检查）
   - 用户只能操作自己的工作流
   - 使用Prisma事务保证数据一致性

### 预期验证方式
- `npm run dev` 启动正常
- 使用Postman或curl测试API：
  - POST `/api/workflows` 创建测试工作流
  - GET `/api/workflows` 返回工作流列表
  - PUT `/api/workflows/[id]` 更新工作流
  - GET `/api/workflows/[id]/versions` 返回版本列表
  - POST `/api/workflows/[id]/versions/[versionId]/rollback` 成功回滚

### 交付物清单
- [ ] 工作流列表API实现（含分页、搜索）
- [ ] 创建工作流API实现
- [ ] 工作流详情API实现
- [ ] 更新工作流API实现
- [ ] 删除工作流API实现
- [ ] 版本列表API实现
- [ ] 版本回滚API实现
- [ ] 认证中间件实现
- [ ] 业务逻辑封装完成
- [ ] API测试通过

---

## API详细规范

### 创建工作流
```
POST /api/workflows
Request:
{
  "title": "产品上线流程",
  "description": "描述产品从开发到上线的完整流程"
}

Response:
{
  "id": "uuid",
  "title": "产品上线流程",
  "description": "描述产品从开发到上线的完整流程",
  "status": "DRAFT",
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-01T10:00:00Z"
}
```

### 获取工作流列表
```
GET /api/workflows?page=1&limit=10&search=产品&sort=updatedAt&order=desc

Response:
{
  "data": [
    {
      "id": "uuid",
      "title": "产品上线流程",
      "description": "...",
      "status": "DRAFT",
      "nodeCount": 5,
      "updatedAt": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 获取工作流详情
```
GET /api/workflows/[id]

Response:
{
  "id": "uuid",
  "title": "产品上线流程",
  "description": "...",
  "status": "DRAFT",
  "nodes": [...], // 当前版本节点数据
  "currentVersion": 3,
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-01T12:00:00Z"
}
```

### 保存工作流（创建新版本）
```
PUT /api/workflows/[id]
Request:
{
  "title": "产品上线流程V2",
  "description": "更新描述",
  "nodes": [
    {
      "id": "node-1",
      "type": "standard",
      "title": "需求评审",
      "position": 1,
      "data": {...}
    }
  ]
}

Response:
{
  "id": "uuid",
  "title": "产品上线流程V2",
  "version": 4,
  "updatedAt": "2026-05-01T14:00:00Z"
}
```

### 获取版本历史
```
GET /api/workflows/[id]/versions

Response:
{
  "versions": [
    {
      "id": "version-uuid",
      "version": 4,
      "title": "产品上线流程V2",
      "createdAt": "2026-05-01T14:00:00Z",
      "changeSummary": "更新了标题和节点"
    },
    {
      "id": "version-uuid",
      "version": 3,
      "title": "产品上线流程",
      "createdAt": "2026-05-01T12:00:00Z",
      "changeSummary": "添加了判断节点"
    }
  ]
}
```

### 版本回滚
```
POST /api/workflows/[id]/versions/[versionId]/rollback

Response:
{
  "success": true,
  "newVersion": 5,
  "message": "已成功回滚到版本3，新版本号为5"
}
```
