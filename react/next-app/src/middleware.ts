// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/locales/i18n/config"

export default createMiddleware({
  locales,
  defaultLocale,
})

/* async function pathMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  } else {
    const [router] = routers.filter((item) => pathname.endsWith(item))
    request.nextUrl.pathname = `/${defaultLocale}${router ?? ""}`
    return NextResponse.redirect(
      new URL(`${defaultLocale}/about`, request.nextUrl.origin),
      {
        status: 308,
      }
    )
    // return NextResponse.redirect(request.nextUrl)
  }
} */
function headerMiddleware(request: NextRequest) {
  // const { pathname } = request.nextUrl
  // 克隆请求头并设置一个新的头 `x-hello-from-middleware1`
  /*  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-url-header", pathname)

  // 你也可以在 NextResponse.next 中设置请求头
  const response = NextResponse.next({
    request: {
      // 新的请求头
      headers: requestHeaders,
    },
  })
  console.log(
    "pathname++++++++++++++++++++++++++++++++++++++++++++++++",
    requestHeaders,
    pathname
  )
  response.headers.set("x-url", pathname)
  return response */
}
/**
 * 身份认证
 * @param request
 * @returns
 */
function authMiddleware(request: NextRequest) {
  if (!request.cookies.get("authToken")) {
    return NextResponse.next()
    // 登录页没写，暂时屏蔽
    // return NextResponse.redirect(new URL('/login', request.url))
  }
  return null
}
/**
 * 给请求添加通用请求头
 * @param request
 * @returns  request: NextRequest
 */
function addCustomHeaderMiddleware() {
  const response = NextResponse.next()
  response.headers.set("x-custom-header", "hello-world")
  console.log(
    "addCustomHeaderMiddleware++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
  )
  return response
}
/**
 * 日志记录
 * @param request
 * @returns
 */
function loggerMiddleware(request: NextRequest) {
  console.log(`Request: ${request.method} ${request.url}`)
  return NextResponse.next()
}

// 组合中间件
export function middleware(request: NextRequest) {
  // 按顺序执行中间件
  // const authResult = authMiddleware(request)
  // if (authResult) return authResult
  // pathMiddleware(request)
  headerMiddleware(request)
  authMiddleware(request)
  loggerMiddleware(request)
  // request
  return addCustomHeaderMiddleware()
}
// 配置中间件应用的路径
/* export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
} */
export const config = {
  matcher: [
    // 匹配所有路径，排除以下内容:
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
