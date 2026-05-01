import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/workflows/[id]/archive - 归档工作流
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

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取工作流
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // 检查权限
    if (workflow.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 检查当前状态
    if (workflow.status === 'ARCHIVED') {
      return NextResponse.json({ error: 'Workflow is already archived' }, { status: 400 });
    }

    // 归档工作流
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: 'ARCHIVED',
      },
    });

    return NextResponse.json({
      message: 'Workflow archived successfully',
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Failed to archive workflow:', error);
    return NextResponse.json(
      { error: 'Failed to archive workflow' },
      { status: 500 }
    );
  }
}
