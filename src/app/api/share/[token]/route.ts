import { NextRequest, NextResponse } from 'next/server'
import { getShareByToken } from '@/lib/share'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const result = await getShareByToken(params.token)

    if (!result) {
      return NextResponse.json(
        { error: '分享链接不存在或已过期' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取分享内容失败:', error)
    return NextResponse.json(
      { error: '获取分享内容失败' },
      { status: 500 }
    )
  }
}
