import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/workflows/[id]/publish - 发布工作流
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
    if (workflow.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Workflow is already published' }, { status: 400 });
    }

    if (workflow.status === 'ARCHIVED') {
      return NextResponse.json({ error: 'Cannot publish archived workflow' }, { status: 400 });
    }

    // 发布工作流（创建版本快照）
    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      // 创建版本快照
      await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          version: workflow.version,
          nodes: workflow.nodes as any,
          createdBy: session.user!.id,
          comment: `Published version ${workflow.version}`,
        },
      });

      // 更新工作流状态
      return tx.workflow.update({
        where: { id: workflowId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: 'Workflow published successfully',
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Failed to publish workflow:', error);
    return NextResponse.json(
      { error: 'Failed to publish workflow' },
      { status: 500 }
    );
  }
}
