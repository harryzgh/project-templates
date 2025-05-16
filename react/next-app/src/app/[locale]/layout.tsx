import "../globals.css"
import type { Viewport } from "next"
import ReduxProvider from "../redux-provider"
import RootHtml from "@/app/components/client/root-html"
import { NextIntlClientProvider } from "next-intl"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { routers } from "@/router/index"
import { defaultLocale } from "@/locales/i18n/config"

// viewport 全站统一的公共的配置放 layout 中
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // 还支持但不常用的属性
  // interactiveWidget: 'resizes-visual',
  // 设置浏览器ui
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" }, // light
    { media: "(prefers-color-scheme: dark)", color: "black" }, // black
  ],
}

const loadMessages = async (locale: string) => {
  try {
    return (await import(`../../locales/${locale}.json`)).default
  } catch (_e) {
    console.log(_e)
    // const json = await fetch("/api/route/get")
    /// console.log("json+++++", json)
    const fullList = await headers()
    const host = fullList.get("host") || ""
    const fullUrl = fullList.get("referer") || ""
    const pathName = fullUrl.split(host)[1]
    const router = pathName
      ? routers.filter((item) => pathName.endsWith(item))
      : ""
    // todo headers() 中 referer 有时不存在，怎么解决 服务器端async函数组件 中获取pathname的问题
    // todo 组件中怎么调用api的问题
    // 服务器端重定向
    redirect(`/${defaultLocale}${router ?? ""}`)
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await loadMessages(locale)

  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <RootHtml>{children}</RootHtml>
      </NextIntlClientProvider>
    </ReduxProvider>
  )
}
