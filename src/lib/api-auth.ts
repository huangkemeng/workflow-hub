import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 不需要认证的 API 路径
const PUBLIC_API_PATHS = [
  '/api/auth',
  '/api/health',
];

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;

  // 检查是否为公开 API
  const isPublicPath = PUBLIC_API_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  if (isPublicPath) {
    // 公开 API 不需要认证，但如果有 token 也可以获取 userId
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return handler(req, token?.id as string || '');
  }

  // 获取 JWT Token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 验证 token 是否存在
  if (!token || !token.id) {
    return NextResponse.json(
      { error: '未授权，请先登录' },
      { status: 401 }
    );
  }

  // 调用处理函数，传入 userId
  return handler(req, token.id as string);
}

// 简化的认证检查函数
export async function checkAuth(req: NextRequest): Promise<{ 
  authenticated: boolean; 
  userId?: string; 
  error?: string 
}> {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token || !token.id) {
    return { 
      authenticated: false, 
      error: '未授权，请先登录' 
    };
  }

  return { 
    authenticated: true, 
    userId: token.id as string 
  };
}
