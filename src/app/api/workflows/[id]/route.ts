import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getWorkflowById, updateWorkflow, deleteWorkflow } from '@/lib/workflow'

const updateWorkflowSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100字符').optional(),
  description: z.string().max(500, '描述最多500字符').optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['standard', 'decision', 'parallel', 'loop', 'subflow', 'note']),
    title: z.string(),
    position: z.number(),
    data: z.record(z.unknown()),
    config: z.record(z.unknown()).optional(),
  })).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const workflow = await getWorkflowById(session.user.id, params.id)

    if (!workflow) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('获取工作流详情失败:', error)
    return NextResponse.json(
      { error: '获取工作流详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateWorkflowSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: '参数错误', details: validation.error.errors },
        { status: 400 }
      )
    }

    const workflow = await updateWorkflow(
      session.user.id,
      params.id,
      validation.data
    )

    if (!workflow) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('更新工作流失败:', error)
    return NextResponse.json(
      { error: '更新工作流失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const success = await deleteWorkflow(session.user.id, params.id)

    if (!success) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除工作流失败:', error)
    return NextResponse.json(
      { error: '删除工作流失败' },
      { status: 500 }
    )
  }
}
