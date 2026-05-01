import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rollbackToVersion } from '@/lib/version'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const result = await rollbackToVersion(
      session.user.id,
      params.id,
      params.versionId
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('版本回滚失败:', error)
    if (error instanceof Error) {
      if (error.message === '工作流不存在') {
        return NextResponse.json(
          { error: '工作流不存在' },
          { status: 404 }
        )
      }
      if (error.message === '版本不存在') {
        return NextResponse.json(
          { error: '版本不存在' },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      { error: '版本回滚失败' },
      { status: 500 }
    )
  }
}
