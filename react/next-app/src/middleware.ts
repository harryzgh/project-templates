// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { locales, routing } from "@/i18n/routing"
import { routers } from "./router"
let count = 0

/**
 *
 * @param request
 * @returns
 */
function pathMiddleware(request: NextRequest, urlLocale: string) {
  const { pathname } = request.nextUrl
  const [router] = routers.filter(
    (item) => pathname === `/${urlLocale}${item === "/" ? "" : item}`
  )
  console.log("test++++++++++++++++++++++22", router, request.url, ++count)
  if (!router) {
    const newPathname = `/${urlLocale}${router === "/" ? "" : router ?? ""}`
    return NextResponse.redirect(new URL(newPathname, request.url))
  }
  return null
}

/**
 *
 * @param request
 */
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
    // return NextResponse.redirect(new URL("/login", request.url))
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
  /* console.log(
    "addCustomHeaderMiddleware++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++",
    response
  ) */
  return response
}
/**
 * 日志记录
 * @param request
 * @returns
 */
function loggerMiddleware(request: NextRequest) {
  /*  console.log(
    `Request+++++++++++++++++++++++++++++++++++++++: ${new Date().toLocaleString()} ${
      request.method
    } ${request.url}`
  ) */
  return NextResponse.next()
}
// 国际化中间件
const intlMiddleware = createMiddleware(routing)

/**
 * 需要改变访问路径的，需要return
 * @param request
 * @returns
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const [urlLocale] = locales.filter(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  // 按顺序执行中间件
  // const authResult = authMiddleware(request)
  // if (authResult) return authResult
  // ---------------------------  1、验证路由是否带语言前缀
  if (!urlLocale) {
    const response = intlMiddleware(request)
    // 改变访问路径，需要return
    return response
  }

  //  ---------------------------  2、验证带语言前缀的路由是否需要重定向（不匹配项目路由时需要重定向）
  const pathResponse = pathMiddleware(request, urlLocale)
  if (pathResponse) {
    // 改变访问路径，需要return
    return pathResponse
  }
  headerMiddleware(request)
  authMiddleware(request)
  loggerMiddleware(request)
  addCustomHeaderMiddleware()
  return NextResponse.next()
}

// 配置中间件应用的路径
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  // matcher: [
  //   // 匹配所有路径，排除以下内容:
  //   "/((?!api|_next|_vercel|.*\\..*).*)",
  // ],
}
