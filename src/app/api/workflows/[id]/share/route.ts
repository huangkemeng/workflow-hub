import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createShare, revokeShare, getSharesByWorkflow } from '@/lib/share'

const createShareSchema = z.object({
  expiresIn: z.enum(['7d', '30d']).nullable().optional(),
  allowExport: z.boolean().optional(),
})

const revokeShareSchema = z.object({
  shareToken: z.string(),
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

    const shares = await getSharesByWorkflow(session.user.id, params.id)

    return NextResponse.json({ shares })
  } catch (error) {
    console.error('获取分享列表失败:', error)
    if (error instanceof Error && error.message === '工作流不存在') {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '获取分享列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const validation = createShareSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: '参数错误', details: validation.error.errors },
        { status: 400 }
      )
    }

    const share = await createShare(session.user.id, params.id, validation.data)

    return NextResponse.json(share, { status: 201 })
  } catch (error) {
    console.error('创建分享失败:', error)
    if (error instanceof Error && error.message === '工作流不存在') {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '创建分享失败' },
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

    const body = await req.json()
    const validation = revokeShareSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: '参数错误', details: validation.error.errors },
        { status: 400 }
      )
    }

    const success = await revokeShare(
      session.user.id,
      params.id,
      validation.data.shareToken
    )

    if (!success) {
      return NextResponse.json(
        { error: '分享链接不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: '分享链接已撤销' })
  } catch (error) {
    console.error('撤销分享失败:', error)
    if (error instanceof Error && error.message === '工作流不存在') {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '撤销分享失败' },
      { status: 500 }
    )
  }
}
