import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createWorkflow, getWorkflows } from '@/lib/workflow'

const createWorkflowSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100字符'),
  description: z.string().max(500, '描述最多500字符').optional(),
})

// 解析排序参数，支持格式: "updated-desc", "updated-asc", "created-desc", "created-asc", "title-asc", "title-desc"
function parseSortParam(sortParam: string | null): { sort: 'updatedAt' | 'createdAt' | 'title'; order: 'asc' | 'desc' } {
  if (!sortParam) {
    return { sort: 'updatedAt', order: 'desc' }
  }

  const parts = sortParam.split('-')
  const field = parts[0]
  const direction = parts[1] as 'asc' | 'desc' | undefined

  // 映射字段名
  const sortFieldMap: Record<string, 'updatedAt' | 'createdAt' | 'title'> = {
    'updated': 'updatedAt',
    'created': 'createdAt',
    'title': 'title',
  }

  const sort = sortFieldMap[field] || 'updatedAt'
  const order = direction === 'asc' ? 'asc' : 'desc'

  return { sort, order }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const sortParam = searchParams.get('sort')

    // 解析排序参数
    const { sort, order } = parseSortParam(sortParam)

    const result = await getWorkflows(session.user.id, {
      page,
      limit,
      search,
      sort,
      order,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取工作流列表失败:', error)
    return NextResponse.json(
      { error: '获取工作流列表失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const validation = createWorkflowSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: '参数错误', details: validation.error.errors },
        { status: 400 }
      )
    }

    const workflow = await createWorkflow(session.user.id, validation.data)

    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    console.error('创建工作流失败:', error)
    return NextResponse.json(
      { error: '创建工作流失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
