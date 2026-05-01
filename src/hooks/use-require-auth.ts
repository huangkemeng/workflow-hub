'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

// 不需要认证的路径
const PUBLIC_PATHS = ['/login', '/register', '/share'];

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 检查当前路径是否需要认证
    const isPublicPath = PUBLIC_PATHS.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    // 如果未认证且访问需要认证的路径，重定向到登录页
    if (status === 'unauthenticated' && !isPublicPath) {
      router.push('/login');
    }
  }, [status, pathname, router]);

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user,
  };
}
