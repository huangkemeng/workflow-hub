import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import {
  WorkflowVersion,
  VersionListItem,
  RollbackResponse,
  WorkflowNode,
} from '@/types'

export async function getVersions(
  userId: string,
  workflowId: string
): Promise<VersionListItem[]> {
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

  const versions = await prisma.workflowVersion.findMany({
    where: {
      workflowId,
    },
    orderBy: {
      version: 'desc',
    },
  })

  return versions.map((version, index) => {
    const prevVersion = versions[index + 1]
    const changeSummary = generateChangeSummary(version, prevVersion)

    return {
      id: version.id,
      version: version.version,
      title: version.title,
      createdAt: version.createdAt,
      changeSummary,
    }
  })
}

export async function rollbackToVersion(
  userId: string,
  workflowId: string,
  versionId: string
): Promise<RollbackResponse> {
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

  // 获取目标版本
  const targetVersion = await prisma.workflowVersion.findFirst({
    where: {
      id: versionId,
      workflowId,
    },
  })

  if (!targetVersion) {
    throw new Error('版本不存在')
  }

  // 获取当前最新版本号
  const latestVersion = await prisma.workflowVersion.findFirst({
    where: {
      workflowId,
    },
    orderBy: {
      version: 'desc',
    },
  })

  const newVersionNumber = (latestVersion?.version || 0) + 1

  // 创建新版本，复制目标版本的数据
  await prisma.workflowVersion.create({
    data: {
      workflowId,
      version: newVersionNumber,
      title: targetVersion.title,
      description: targetVersion.description,
      nodes: targetVersion.nodes as Prisma.InputJsonValue,
    },
  })

  // 更新工作流标题和描述
  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      title: targetVersion.title,
      description: targetVersion.description,
    },
  })

  return {
    success: true,
    newVersion: newVersionNumber,
    message: `已成功回滚到版本${targetVersion.version}，新版本号为${newVersionNumber}`,
  }
}

export async function getVersionById(
  userId: string,
  workflowId: string,
  versionId: string
): Promise<WorkflowVersion | null> {
  // 验证工作流属于当前用户
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) {
    return null
  }

  const version = await prisma.workflowVersion.findFirst({
    where: {
      id: versionId,
      workflowId,
    },
  })

  if (!version) {
    return null
  }

  return {
    ...version,
    nodes: (version.nodes as unknown) as WorkflowNode[],
  }
}

function generateChangeSummary(
  current: {
    title: string
    description: string | null
    nodes: unknown
  },
  previous?: {
    title: string
    description: string | null
    nodes: unknown
  }
): string {
  if (!previous) {
    return '创建工作流'
  }

  const changes: string[] = []

  if (current.title !== previous.title) {
    changes.push('更新了标题')
  }

  if (current.description !== previous.description) {
    changes.push('更新了描述')
  }

  const currentNodes = ((current.nodes as unknown) as WorkflowNode[]) || []
  const previousNodes = ((previous.nodes as unknown) as WorkflowNode[]) || []

  if (currentNodes.length !== previousNodes.length) {
    changes.push(`节点数量从 ${previousNodes.length} 变为 ${currentNodes.length}`)
  } else if (JSON.stringify(currentNodes) !== JSON.stringify(previousNodes)) {
    changes.push('更新了节点内容')
  }

  if (changes.length === 0) {
    return '保存版本'
  }

  return changes.join('，')
}
