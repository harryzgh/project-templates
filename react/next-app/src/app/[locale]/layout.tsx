import "../globals.css"
import type { Viewport } from "next"
import ReduxProvider from "../redux-provider"
import RootHtml from "@/app/components/client/root-html"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server" // 从request.ts中获取 getLocale

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string; messages: object }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <RootHtml>{children}</RootHtml>
      </NextIntlClientProvider>
    </ReduxProvider>
  )
}
