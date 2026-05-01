import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { exportWorkflowToMarkdown } from '@/lib/export'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'markdown'

    if (format !== 'markdown') {
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      )
    }

    const result = await exportWorkflowToMarkdown(session.user.id, params.id)

    if (!result) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      )
    }

    // 设置响应头，触发文件下载
    const headers = new Headers()
    headers.set('Content-Type', 'text/markdown; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`)

    return new NextResponse(result.content, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('导出工作流失败:', error)
    return NextResponse.json(
      { error: '导出工作流失败' },
      { status: 500 }
    )
  }
}
