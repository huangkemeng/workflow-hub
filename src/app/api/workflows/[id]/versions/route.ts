import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVersions } from '@/lib/version'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const versions = await getVersions(session.user.id, params.id)

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('获取版本历史失败:', error)
    if (error instanceof Error && error.message === '工作流不存在') {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '获取版本历史失败' },
      { status: 500 }
    )
  }
}
