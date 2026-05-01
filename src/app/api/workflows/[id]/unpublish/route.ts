import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/workflows/[id]/unpublish - 取消发布工作流
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = params.id;

    // 获取工作流
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { owner: true },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 检查权限
    if (workflow.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 检查当前状态
    if (workflow.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Workflow is not published' }, { status: 400 });
    }

    // 取消发布工作流
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: 'DRAFT',
        publishedAt: null,
      },
    });

    return NextResponse.json({
      message: 'Workflow unpublished successfully',
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Failed to unpublish workflow:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish workflow' },
      { status: 500 }
    );
  }
}
