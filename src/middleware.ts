import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // 公开路由不需要认证
        if (req.nextUrl.pathname.startsWith('/api/share/')) {
          return true
        }
        if (req.nextUrl.pathname === '/api/health') {
          return true
        }
        // 其他 API 路由需要认证
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return token !== null
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/api/:path*'],
}
