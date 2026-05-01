import { prisma } from './prisma'
import { WorkflowStatus, Prisma } from '@prisma/client'
import {
  WorkflowListItem,
  WorkflowDetail,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowListQuery,
  PaginatedResponse,
  WorkflowNode,
} from '@/types'

export async function createWorkflow(
  userId: string,
  input: CreateWorkflowInput
): Promise<WorkflowDetail> {
  const workflow = await prisma.workflow.create({
    data: {
      title: input.title,
      description: input.description,
      userId,
      status: WorkflowStatus.DRAFT,
    },
  })

  // 创建初始版本
  await prisma.workflowVersion.create({
    data: {
      workflowId: workflow.id,
      version: 1,
      title: input.title,
      description: input.description || null,
      nodes: [],
    },
  })

  return {
    ...workflow,
    nodes: [],
    currentVersion: 1,
  }
}

export async function getWorkflows(
  userId: string,
  query: WorkflowListQuery
): Promise<PaginatedResponse<WorkflowListItem>> {
  const page = query.page || 1
  const limit = query.limit || 10
  const skip = (page - 1) * limit
  const sort = query.sort || 'updatedAt'
  const order = query.order || 'desc'

  const where: Prisma.WorkflowWhereInput = {
    userId,
    ...(query.search && {
      title: {
        contains: query.search,
        mode: 'insensitive',
      },
    }),
  }

  const [workflows, total] = await Promise.all([
    prisma.workflow.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    }),
    prisma.workflow.count({ where }),
  ])

  const data: WorkflowListItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    title: workflow.title,
    description: workflow.description,
    status: workflow.status,
    nodeCount: ((workflow.versions[0]?.nodes as unknown) as WorkflowNode[])?.length || 0,
    updatedAt: workflow.updatedAt,
  }))

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getWorkflowById(
  userId: string,
  workflowId: string
): Promise<WorkflowDetail | null> {
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
    include: {
      versions: {
        orderBy: {
          version: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!workflow) {
    return null
  }

  const latestVersion = workflow.versions[0]

  return {
    ...workflow,
    nodes: ((latestVersion?.nodes as unknown) as WorkflowNode[]) || [],
    currentVersion: latestVersion?.version || 1,
  }
}

export async function updateWorkflow(
  userId: string,
  workflowId: string,
  input: UpdateWorkflowInput
): Promise<WorkflowDetail | null> {
  // 检查工作流是否存在且属于当前用户
  const existingWorkflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
    include: {
      versions: {
        orderBy: {
          version: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!existingWorkflow) {
    return null
  }

  const latestVersion = existingWorkflow.versions[0]
  const newVersionNumber = (latestVersion?.version || 0) + 1

  // 使用事务更新工作流和创建新版本
  const result = await prisma.$transaction(async (tx) => {
    // 更新工作流基本信息
    const updatedWorkflow = await tx.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        title: input.title,
        description: input.description,
      },
    })

    // 如果有节点数据，创建新版本
    if (input.nodes) {
      await tx.workflowVersion.create({
        data: {
          workflowId,
          version: newVersionNumber,
          title: input.title || existingWorkflow.title,
          description: input.description ?? existingWorkflow.description,
          nodes: input.nodes as unknown as Prisma.InputJsonValue,
        },
      })
    }

    return updatedWorkflow
  })

  return {
    ...result,
    nodes: input.nodes || ((latestVersion?.nodes as unknown) as WorkflowNode[]) || [],
    currentVersion: input.nodes ? newVersionNumber : latestVersion?.version || 1,
  }
}

export async function deleteWorkflow(
  userId: string,
  workflowId: string
): Promise<boolean> {
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  })

  if (!workflow) {
    return false
  }

  await prisma.workflow.delete({
    where: {
      id: workflowId,
    },
  })

  return true
}
