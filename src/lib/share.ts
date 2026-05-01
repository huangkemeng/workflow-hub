import { prisma } from './prisma'
import { generateShareToken, calculateExpiry } from './token'
import {
  ShareCreateInput,
  ShareResponse,
  WorkflowNode,
} from '@/types'

export async function createShare(
  userId: string,
  workflowId: string,
  input: ShareCreateInput
): Promise<ShareResponse> {
  // 验证工作流属于当前用户
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) {
    throw new Error('工作流不存在')
  }

  const shareToken = generateShareToken()
  const expiresAt = calculateExpiry(input.expiresIn || null)

  const share = await prisma.share.create({
    data: {
      workflowId,
      shareToken,
      expiresAt,
      allowExport: input.allowExport ?? false,
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    shareToken: share.shareToken,
    shareUrl: `${baseUrl}/share/${share.shareToken}`,
    expiresAt: share.expiresAt,
    allowExport: share.allowExport,
  }
}

export async function revokeShare(
  userId: string,
  workflowId: string,
  shareToken: string
): Promise<boolean> {
  // 验证工作流属于当前用户
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) {
    throw new Error('工作流不存在')
  }

  const share = await prisma.share.findFirst({
    where: {
      shareToken,
      workflowId,
    },
  })

  if (!share) {
    return false
  }

  await prisma.share.update({
    where: {
      id: share.id,
    },
    data: {
      isActive: false,
    },
  })

  return true
}

export async function getShareByToken(
  shareToken: string
): Promise<{
  workflow: {
    id: string
    title: string
    description: string | null
    nodes: WorkflowNode[]
    allowExport: boolean
    viewCount: number
  }
} | null> {
  const share = await prisma.share.findUnique({
    where: {
      shareToken,
    },
    include: {
      workflow: {
        include: {
          versions: {
            orderBy: {
              version: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  })

  if (!share) {
    return null
  }

  // 检查分享是否有效
  if (!share.isActive) {
    return null
  }

  // 检查是否过期
  if (share.expiresAt && new Date() > share.expiresAt) {
    return null
  }

  // 增加访问计数
  await prisma.share.update({
    where: {
      id: share.id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  })

  const latestVersion = share.workflow.versions[0]

  return {
    workflow: {
      id: share.workflow.id,
      title: share.workflow.title,
      description: share.workflow.description,
      nodes: ((latestVersion?.nodes as unknown) as WorkflowNode[]) || [],
      allowExport: share.allowExport,
      viewCount: share.viewCount + 1,
    },
  }
}

export async function getSharesByWorkflow(
  userId: string,
  workflowId: string
) {
  // 验证工作流属于当前用户
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) {
    throw new Error('工作流不存在')
  }

  const shares = await prisma.share.findMany({
    where: {
      workflowId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return shares.map((share) => ({
    id: share.id,
    shareToken: share.shareToken,
    shareUrl: `${baseUrl}/share/${share.shareToken}`,
    expiresAt: share.expiresAt,
    allowExport: share.allowExport,
    viewCount: share.viewCount,
    createdAt: share.createdAt,
    isExpired: share.expiresAt ? new Date() > share.expiresAt : false,
  }))
}
