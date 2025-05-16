"use client"
import { DynamicHeader, DynamicFooter } from "@/router"
import { Geist, Geist_Mono } from "next/font/google"
import { useTheme } from "@/store/action/themeAction"
import { useLocale } from "next-intl"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootHtml({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const theme = useTheme()
  const locale = useLocale()
  return (
    <html lang={locale}>
      <body
        data-theme={theme}
        className={`${theme} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicHeader />
        {children}
        <DynamicFooter />
      </body>
    </html>
  )
}
