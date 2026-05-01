## Plan-3: 后端 - 分享功能与导出API

### 目标
实现工作流分享功能（生成分享链接、访问控制、访问统计）和导出功能（Markdown格式导出）。

### 涉及文件清单
- `src/app/api/workflows/[id]/share/route.ts` — new（创建/撤销分享）
- `src/app/api/share/[token]/route.ts` — new（通过token访问分享）
- `src/app/api/workflows/[id]/export/route.ts` — new（导出Markdown）
- `src/lib/share.ts` — new（分享逻辑封装）
- `src/lib/export.ts` — new（导出逻辑封装）
- `src/lib/token.ts` — new（Token生成工具）

### 依赖项
- 依赖 Plan-1 的数据库Schema
- 依赖 Plan-2 的工作流查询逻辑

### 实现要点
1. **分享链接机制**
   - 使用随机Token作为分享标识（16位随机字符串）
   - 支持设置有效期（7天/30天/永久）
   - 支持撤销分享（软删除，设置isActive=false）
   - 记录访问次数统计

2. **分享页面数据API**
   - `GET /api/share/[token]` - 无需认证，返回工作流只读数据
   - 验证token有效性和过期时间
   - 自动增加viewCount
   - 返回完整节点数据供前端渲染

3. **Markdown导出**
   - 将工作流节点转换为Markdown格式
   - 标准节点：标题、人物、时间、地点、事件
   - 判断节点：条件、分支说明
   - 并行节点：任务列表
   - 支持直接下载.md文件

4. **安全考虑**
   - 分享链接Token使用crypto随机生成
   - 过期检查在服务端完成
   - 导出功能需验证权限（创建者或分享允许导出）

### 预期验证方式
- `npm run dev` 启动正常
- 测试分享功能：
  - POST `/api/workflows/[id]/share` 生成分享链接
  - GET `/api/share/[token]` 无需认证访问工作流
  - DELETE `/api/workflows/[id]/share` 撤销分享
- 测试导出功能：
  - GET `/api/workflows/[id]/export?format=markdown` 下载.md文件

### 交付物清单
- [ ] 创建分享链接API实现
- [ ] 撤销分享API实现
- [ ] 分享访问API实现（公开访问）
- [ ] Markdown导出API实现
- [ ] Token生成工具实现
- [ ] 分享逻辑封装完成
- [ ] 导出逻辑封装完成
- [ ] API测试通过

---

## API详细规范

### 创建分享链接
```
POST /api/workflows/[id]/share
Request:
{
  "expiresIn": "7d", // 可选值: "7d", "30d", null(永久)
  "allowExport": true // 是否允许访客导出
}

Response:
{
  "shareToken": "abc123xyz789",
  "shareUrl": "https://your-app.vercel.app/share/abc123xyz789",
  "expiresAt": "2026-05-08T10:00:00Z",
  "allowExport": true
}
```

### 撤销分享
```
DELETE /api/workflows/[id]/share
Request:
{
  "shareToken": "abc123xyz789"
}

Response:
{
  "success": true,
  "message": "分享链接已撤销"
}
```

### 通过分享链接访问工作流
```
GET /api/share/[token]

Response (成功):
{
  "workflow": {
    "id": "uuid",
    "title": "产品上线流程",
    "description": "...",
    "nodes": [...], // 完整节点数据
    "allowExport": true,
    "viewCount": 42
  }
}

Response (失败 - 404):
{
  "error": "分享链接不存在或已过期"
}
```

### 导出Markdown
```
GET /api/workflows/[id]/export?format=markdown

Response: 文件下载 (Content-Type: text/markdown)
文件名: 产品上线流程_2026-05-01.md

文件内容示例:
# 产品上线流程

> 描述产品从开发到上线的完整流程

---

## 步骤 1: 需求评审会议

**类型**: 标准节点

**人物**: 产品经理、技术负责人、UI设计师

**时间**: 2026-05-10 14:00

**地点**: 会议室A

**事件内容**:
1. 产品经理讲解需求背景和目标
2. 技术负责人评估技术可行性
3. UI设计师展示初步设计方案
4. 讨论并确认需求细节
5. 输出会议纪要

**标签**: #重要 #评审 #里程碑

**状态**: 待开始

---

## 步骤 2: 技术方案评审结果

**类型**: 判断节点

**判断条件**: 技术方案评审得分是否 ≥ 80分？

**分支**:
- ✓ 通过 (得分≥80): 进入开发阶段
- ✗ 不通过 (得分<80): 返回修改方案

---

## 步骤 3: 开发阶段并行任务

**类型**: 并行节点

**说明**: 前后端开发可以并行进行

**并行任务**:
| 任务 | 负责人 | 状态 | 优先级 |
|------|--------|------|--------|
| 前端开发 | 前端工程师A | 进行中 | 高 |
| 后端开发 | 后端工程师B | 进行中 | 高 |
| 数据库设计 | DBA | 已完成 | 中 |

---

*导出时间: 2026-05-01 10:00:00*
```

---

## Token生成策略

```typescript
// 使用crypto生成16位随机字符串
function generateShareToken(): string {
  return crypto.randomBytes(8).toString('hex'); // 16位十六进制字符串
}

// 有效期计算
function calculateExpiry(expiresIn: '7d' | '30d' | null): Date | null {
  if (!expiresIn) return null; // 永久有效
  
  const days = expiresIn === '7d' ? 7 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
```
