## Plan-1: 后端 - 数据库Schema与核心API基础

### 目标
建立PostgreSQL数据库Schema，包含用户表、工作流基础表结构，以及核心依赖配置。为后续工作流节点、版本管理等功能奠定数据基础。

### 涉及文件清单
- `package.json` — new
- `prisma/schema.prisma` — new
- `prisma/migrations/0001_init/migration.sql` — new
- `src/lib/prisma.ts` — new
- `src/lib/auth.ts` — new
- `src/types/index.ts` — new
- `src/app/api/health/route.ts` — new
- `.env.example` — new
- `next.config.js` — new
- `tsconfig.json` — new

### 依赖项
- 无前置依赖，这是第一个后端计划

### 实现要点
1. **数据库设计原则**
   - 使用Prisma ORM管理PostgreSQL数据库
   - 用户表：id, email, name, avatar, createdAt, updatedAt
   - 工作流表：id, title, description, userId(外键), status, createdAt, updatedAt
   - 分享表：id, workflowId, shareToken, expiresAt, isActive, viewCount

2. **认证方案**
   - 使用NextAuth.js实现JWT认证
   - 支持Credentials Provider（邮箱+密码）
   - 支持OAuth Provider（GitHub/Google可选）

3. **Vercel平台适配**
   - 使用Vercel Postgres作为数据库服务
   - API路由使用Edge Runtime（轻量级查询）
   - 敏感操作使用Node.js Runtime

4. **环境变量配置**
   - DATABASE_URL: PostgreSQL连接字符串
   - NEXTAUTH_SECRET: JWT签名密钥
   - NEXTAUTH_URL: 认证回调地址

### 预期验证方式
- `npm run dev` 启动正常
- `npx prisma migrate dev` 成功执行迁移
- 访问 `http://localhost:3000/api/health` 返回 `{"status":"ok"}`
- Prisma Studio 可正常查看数据表结构

### 交付物清单
- [ ] package.json 配置完成（Next.js + Prisma + NextAuth）
- [ ] Prisma Schema 定义完成（User, Workflow, Share 模型）
- [ ] 数据库迁移文件生成
- [ ] Prisma Client 初始化封装
- [ ] NextAuth 配置完成
- [ ] 类型定义文件创建
- [ ] Health Check API 可访问
- [ ] 环境变量示例文件
- [ ] TypeScript 配置正确
- [ ] 编译无错误

---

## 数据库Schema详细设计

### User 模型
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  avatar    String?
  password  String?  // 加密存储
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  workflows Workflow[]
}
```

### Workflow 模型
```prisma
model Workflow {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      WorkflowStatus @default(DRAFT)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  shares      Share[]
  versions    WorkflowVersion[]
  
  @@index([userId])
  @@index([status])
}

enum WorkflowStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Share 模型
```prisma
model Share {
  id          String    @id @default(uuid())
  workflowId  String
  shareToken  String    @unique
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  viewCount   Int       @default(0)
  allowExport Boolean   @default(false)
  createdAt   DateTime  @default(now())
  
  workflow    Workflow  @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  @@index([shareToken])
  @@index([workflowId])
}
```

### WorkflowVersion 模型（预留）
```prisma
model WorkflowVersion {
  id          String   @id @default(uuid())
  workflowId  String
  version     Int
  title       String
  description String?
  nodes       Json     // 节点数据JSON存储
  createdAt   DateTime @default(now())
  
  workflow    Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  @@unique([workflowId, version])
  @@index([workflowId])
}
```
