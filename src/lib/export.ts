import { prisma } from './prisma'
import { WorkflowNode } from '@/types'

export async function exportWorkflowToMarkdown(
  userId: string,
  workflowId: string
): Promise<{
  content: string
  filename: string
} | null> {
  // 验证工作流属于当前用户
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
  const nodes = ((latestVersion?.nodes as unknown) as WorkflowNode[]) || []

  const content = generateMarkdown(workflow.title, workflow.description, nodes)
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${workflow.title}_${timestamp}.md`

  return {
    content,
    filename,
  }
}

export async function exportSharedWorkflowToMarkdown(
  shareToken: string
): Promise<{
  content: string
  filename: string
} | null> {
  const { prisma } = await import('./prisma')

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

  if (!share || !share.isActive) {
    return null
  }

  if (share.expiresAt && new Date() > share.expiresAt) {
    return null
  }

  if (!share.allowExport) {
    return null
  }

  const latestVersion = share.workflow.versions[0]
  const nodes = ((latestVersion?.nodes as unknown) as WorkflowNode[]) || []

  const content = generateMarkdown(
    share.workflow.title,
    share.workflow.description,
    nodes
  )
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `${share.workflow.title}_${timestamp}.md`

  return {
    content,
    filename,
  }
}

function generateMarkdown(
  title: string,
  description: string | null,
  nodes: WorkflowNode[]
): string {
  const lines: string[] = []

  // 标题
  lines.push(`# ${title}`)
  lines.push('')

  // 描述
  if (description) {
    lines.push(`> ${description}`)
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // 节点内容
  nodes.forEach((node, index) => {
    lines.push(`## 步骤 ${index + 1}: ${node.title}`)
    lines.push('')
    lines.push(`**类型**: ${getNodeTypeLabel(node.type)}`)
    lines.push('')

    switch (node.type) {
      case 'standard':
        lines.push(...generateStandardNodeContent(node))
        break
      case 'decision':
        lines.push(...generateDecisionNodeContent(node))
        break
      case 'parallel':
        lines.push(...generateParallelNodeContent(node))
        break
      case 'loop':
        lines.push(...generateLoopNodeContent(node))
        break
      case 'subflow':
        lines.push(...generateSubflowNodeContent(node))
        break
      case 'note':
        lines.push(...generateNoteNodeContent(node))
        break
    }

    lines.push('')
    lines.push('---')
    lines.push('')
  })

  // 页脚
  lines.push(`*导出时间: ${new Date().toLocaleString('zh-CN')}*`)

  return lines.join('\n')
}

function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    standard: '标准节点',
    decision: '判断节点',
    parallel: '并行节点',
    loop: '循环节点',
    subflow: '子流程节点',
    note: '备注节点',
  }
  return labels[type] || type
}

function generateStandardNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.characters && Array.isArray(data.characters) && data.characters.length > 0) {
    lines.push(`**人物**: ${data.characters.join('、')}`)
    lines.push('')
  }

  if (data.scheduledAt) {
    const date = new Date(data.scheduledAt as string).toLocaleString('zh-CN')
    lines.push(`**时间**: ${date}`)
    lines.push('')
  }

  if (data.location) {
    lines.push(`**地点**: ${data.location}`)
    lines.push('')
  }

  const eventData = data.event as Record<string, unknown> | undefined
  if (eventData?.content) {
    lines.push('**事件内容**:')
    lines.push('```')
    lines.push(String(eventData.content))
    lines.push('```')
    lines.push('')
  }

  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    lines.push(`**标签**: ${data.tags.map((t: string) => `#${t}`).join(' ')}`)
    lines.push('')
  }

  if (data.status) {
    const statusLabels: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成',
      skipped: '已跳过',
    }
    lines.push(`**状态**: ${statusLabels[data.status as string] || data.status}`)
    lines.push('')
  }

  return lines
}

function generateDecisionNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.condition) {
    lines.push('**判断条件**:')
    lines.push('```')
    lines.push(String(data.condition))
    lines.push('```')
    lines.push('')
  }

  if (data.branches && Array.isArray(data.branches)) {
    lines.push('**分支**:')
    lines.push('')
    data.branches.forEach((branch: Record<string, unknown>) => {
      const label = branch.label || '未命名分支'
      const condition = branch.condition ? ` (${branch.condition})` : ''
      const description = branch.description ? `: ${branch.description}` : ''
      lines.push(`- ${label}${condition}${description}`)
    })
    lines.push('')
  }

  return lines
}

function generateParallelNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.description) {
    lines.push(`**说明**: ${data.description}`)
    lines.push('')
  }

  if (data.tasks && Array.isArray(data.tasks)) {
    lines.push('**并行任务**:')
    lines.push('')
    lines.push('| 任务 | 负责人 | 状态 | 优先级 |')
    lines.push('|------|--------|------|--------|')

    const statusLabels: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成',
    }

    const priorityLabels: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    }

    data.tasks.forEach((task: Record<string, unknown>) => {
      const title = task.title || '-'
      const assignee = task.assignee || '-'
      const status = statusLabels[task.status as string] || task.status || '-'
      const priority = priorityLabels[task.priority as string] || task.priority || '-'
      lines.push(`| ${title} | ${assignee} | ${status} | ${priority} |`)
    })
    lines.push('')
  }

  return lines
}

function generateLoopNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.condition) {
    lines.push('**循环条件**:')
    lines.push('```')
    lines.push(String(data.condition))
    lines.push('```')
    lines.push('')
  }

  if (data.maxIterations) {
    lines.push(`**最大循环次数**: ${data.maxIterations}`)
    lines.push('')
  }

  if (data.description) {
    lines.push(`**说明**: ${data.description}`)
    lines.push('')
  }

  return lines
}

function generateSubflowNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.subflowId) {
    lines.push(`**子流程ID**: ${data.subflowId}`)
    lines.push('')
  }

  if (data.description) {
    lines.push(`**说明**: ${data.description}`)
    lines.push('')
  }

  return lines
}

function generateNoteNodeContent(node: WorkflowNode): string[] {
  const lines: string[] = []
  const data = node.data

  if (data.content) {
    lines.push('**备注内容**:')
    lines.push('> ' + String(data.content).replace(/\n/g, '\n> '))
    lines.push('')
  }

  return lines
}
