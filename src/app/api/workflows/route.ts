import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createWorkflow, getWorkflows } from '@/lib/workflow'

const createWorkflowSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100字符'),
  description: z.string().max(500, '描述最多500字符').optional(),
})

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
    const sort = (searchParams.get('sort') as 'createdAt' | 'updatedAt' | 'title') || 'updatedAt'
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc'

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
      { error: '获取工作流列表失败' },
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
      { error: '创建工作流失败' },
      { status: 500 }
    )
  }
}
